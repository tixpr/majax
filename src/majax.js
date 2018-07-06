class Majax{
	static setConfig(client_id, client_secret,host_api){
		localStorage.setItem('credentials',JSON.stringify({
			client_id: client_id,
			client_secret: client_secret,
			host_api: host_api
		}));
	}
	constructor(){
		this.getAutentication();
		this.header= null;
		this.is_reload=false;
		let temp = localStorage.getItem('credentials');
		let c = '';
		if(temp){
			c = JSON.parse(temp).host_api||'';
		}
		this.config = {
			login: c+'oauth/token',
			refresh: c+'oauth/token'
		};
		this.request_fncs = null;
		this.request_url = null;
		this.request_type = '';
		this.request_data = null;
	}
	createHeader(){
		if(self.fetch){
			if(this.header){
				delete this.header;
			}
			this.header=new Headers();
			if(this.is_authenticate){
				this.header.set('Authorization',this.token_type+' '+this.access_token);
			}
		}else{
			alert('Fetch no soportado, Favor de actualizar su navegador');
		}
	}
	getAutentication(){
		if(localStorage.getItem('authentication') != null ){
			this.is_authenticate = true;
			let auth = JSON.parse(localStorage.getItem('authentication'));
			this.access_token = auth.access_token;
			this.refresh_token = auth.refresh_token;
			this.token_type = auth.token_type;
		}else{
			this.is_authenticate = false;
		}
	}
	requestErase(){
		this.request_fncs = null;
		this.request_url = null;
		this.request_type = '';
		this.request_data = null;
	}
	logout(){
		this.access_token = null;
		this.refresh_token = null;
		this.token_type = null;
		this.valid_handle = null;
		this.reload_handle = null;
		this.error_handle = null;
		this.is_authenticate = false;
		localStorage.removeItem('authentication');
	}
	//	PARA EL RELOAD AL CULMINAR EL TOKEN DE AUTIRIZACIÓN
	requestErase(){
		this.request_fncs = null;
		this.request_url = null;
		this.request_type = '';
		this.request_data = null;
	}
	requestReload(){
		this.is_reload=true;
		switch(this.request_type){
			case 'GET':
				this.get(this.request_url,this.request_fncs,this.request_data);
				break;
			case 'POST':
				this.post(this.request_url,this.request_fncs,this.request_data);
				break;
			case 'PUT':
				this.put(this.request_url,this.request_fncs,this.request_data);
				break;
			case 'DELETE':
				this.delete(this.request_url,this.request_fncs);
				break;
		}
	}
//===================================
	__response(data){
		console.info('iniciando pasado de la respuesta');
		let f = this.request_fncs;
		if(f && f.valid){
			f.valid(data);
		}
	}
	__responseAjax(res){
		console.info(res.status);
		if(res.ok){
			switch(this.contentType){
				case 'text':
					res.text().then((data)=>this.__response(data));
				break;
				case 'blob':
					res.blob().then((data)=>this.__response(data));
				break;
				case 'arrayBuffer':
					res.arrayBuffer().then((data)=>this.__response(data));
				break;
				default:
					console.info('interpretando json');
					res.json().then((data)=>this.__response(data));
				break;
			}
		}else if(res.status===401 && this.is_reload===false){
			this.oauth_refresh();
		}else{
			console.warn('Error inesperado en la petición response ajax');
			console.warn(res);
			res.json().then((err)=>this.__errorAjax(err));
		}
	}
	__errorAjax(error){
		let f = this.request_fncs;
		console.error(error);
		if(f && f.error){
			f.error(error);
		}
	}
	get(url, fncs, data = null) {
		this.createHeader();
		if(data){
			if(url.lastIndexOf('?')<0){
				url+="?";
			}
			switch(data.type){
				case 'form':
					let d = new FormData(data.data);
					let ent = d.entries();
					for(let k of ent){
						if(url.charAt(url.length-1)!=="&"){
							url+="&";
						}
						url += k[0]+"="+k[1];
					}
					break;
				case 'formdata':
					let ent2 = data.data.entries();
					for(let v of ent2){
						if(url.charAt(url.length-1)!=="&"){
							url+="&";
						}
						url += v[0]+"="+v[1];
					}
					break;
				case 'json':
					for(let k in data.data){
						if(url.charAt(url.length-1)!=="&"){
							url+="&";
						}
						url += k+"="+data.data[k];
					}
					break;
				default:
					break;
			}
		}
		this.request_fncs = fncs;
		this.request_type = 'GET';
		this.request_url = url;
		this.request_data = data;
		this.header.set('X-Requested-With', 'XMLHttpRequest');
		fetch(
			url,
			{
				method: 'GET',
				headers: this.header,
				mode: 'cors',
				cache: 'default'
			}
		).then(
			(res)=>this.__responseAjax(res)
		).catch(
			(error)	=>	this.__errorAjax(error)
		);
	}
	post(url, fncs, data = null) {
		this.createHeader();
		this.request_fncs = fncs;
		this.request_type = 'POST';
		this.request_url = url;
		this.request_data = data;
		let __body=null;
		this.header.set('X-Requested-With', 'XMLHttpRequest');
		if(data){
			switch(data.type){
				case 'file':
					let fd = new FormData();
					fd.append('file',data.data);
					__body=fd;
					break;
				case 'form':
					let fd2 = new FormData(data.data);
					__body=fd2;
					break;
				case 'formdata':
					__body=data.data;
					break;
				case 'json':
					this.header.set('Content-Type','application/json');
					__body = JSON.stringify(data.data);
					break;
				default:
					__body = data.data;
					break;
			}
		}
		fetch(
			url,
			{
				method: 'POST',
				headers: this.header,
				mode: 'cors',
				cache: 'default',
				body: __body
			}
		).then(
			(res)=>this.__responseAjax(res)
		).catch(
			(error)	=>	this.__errorAjax(error)
		);
	}
	put(url, fncs, data = null) {
		this.createHeader();
		this.request_fncs = fncs;
		this.request_type = 'PUT';
		this.request_url = url;
		this.request_data = data;
		let h = __host_api||'';
		let __body=null;
		this.header.set('X-Requested-With', 'XMLHttpRequest');
		if(data){
			switch(data.type){
				case 'file':
					let fd = new FormData();
					fd.append('file',data.data);
					__body=fd;
					break;
				case 'form':
					let fd2 = new FormData(data.data);
					__body=fd2;
					break;
				case 'formdata':
					__body=data.data;
					break;
				case 'json':
					this.header.set('Content-Type','application/json');
					__body = JSON.stringify(data.data);
					break;
				default:
					__body = data.data;
					break;
			}
		}
		fetch(
			url,
			{
				method: 'PUT',
				headers: this.header,
				mode: 'cors',
				cache: 'default',
				body: __body
			}
		).then(
			(res)=>this.__responseAjax(res)
		).catch(
			(error)	=>	this.__errorAjax(error)
		);
	}
	delete(url, fncs) {
		this.createHeader();
		this.request_fncs = fncs;
		this.request_type = 'DELETE';
		this.request_url = url;
		this.request_data = data;
		fetch(
			url,
			{
				method: 'DELETE',
				headers: this.header,
				mode: 'cors',
				cache: 'default'
			}
		).then(
			(res)=>this.__responseAjax(res)
		).catch(
			(error)	=>	this.__errorAjax(error)
		);
	}
	oauth(username, password, fncs) {
		this.createHeader();
		this.request_fncs = fncs;
		this.header.set('X-Requested-With', 'XMLHttpRequest');
		this.header.set('Content-Type','application/json');
		let temp = localStorage.getItem('credentials');
		if(temp){
			let cred = JSON.parse(temp);
			fetch(
				this.config.login,
				{
					method: 'POST',
					headers: this.header,
					mode: 'cors',
					cache: 'default',
					body: JSON.stringify({
						grant_type:"password",
						client_id:cred.client_id,
						client_secret:cred.client_secret,
						username: username,
						password: password
					})
				}
			).then(
				(res)=>this.__responseOauth(res)
			).catch(
				(err)=>this.__errorOauth(err)
			);
		}else{
			alert('no existe información de usuario del API');
		}
	}
	__errorOauth(err){
		let f = this.request_fncs;
		console.info('Error oauth->'+err);
		if(f && f.error){
			f.error(err);
		}
	}
	__responseOauth(res){
		if(res.ok){
			res.json().then((data)=>this.__responseJsonOauth(data));
		}else{
			if(res.status>=500 && res.status<=600){
				this.__errorAjax({message:res.statusText,error:res.status});
			}else{
				res.json().then((err)=>this.__errorAjax(err));
			}
		}
	}
	__responseJsonOauth(data){
		localStorage.setItem('authentication',JSON.stringify(data));
		this.access_token = data.access_token;
		this.refresh_token = data.refresh_token;
		this.token_type = data.token_type;
		this.is_authenticate = true;
		let f = this.request_fncs;
		if(f && f.valid){
			f.valid(data);
		}
	}
	oauth_refresh(){
		this.createHeader();
		this.header.set('X-Requested-With', 'XMLHttpRequest');
		this.header.set('Content-Type','application/json');
		this.header.set('Accept', 'application/json');
		let temp = localStorage.getItem('credentials');
		if(temp){
			let cred = JSON.parse(temp);
			fetch(
				this.config.refresh,
				{
					method: 'POST',
					headers: this.header,
					mode: 'cors',
					cache: 'default',
					body: JSON.stringify({
						grant_type:"refresh_token",
						client_id:cred.client_id,
						client_secret:cred.client_secret,
						refresh_token: this.refresh_token
					})
				}
			).then(
				(res)=>this.__responseRefresh(res)
			).catch(
				(error)	=>	this.__errorAjax(error)
			);
		}else{
			alert('no existe información de usuario del API');
		}
		
	}
	__responseRefresh(res){
		if(res.ok){
			res.json().then((data)=>this.__responseJsonRefresh(data));
		}else{
			res.json().then((err)=>this.__errorAjax(err));
		}
	}
	__responseJsonRefresh(data){
		localStorage.setItem('authentication',JSON.stringify(data));
		this.access_token = data.access_token;
		this.refresh_token = data.refresh_token;
		this.token_type = data.token_type;
		this.is_authenticate = true;
		this.requestReload();
	}
};