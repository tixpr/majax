import {AsyncStorage} from 'react-native';
let __client_id = 1,
	__client_secret = "ocxO18rEHlJEaT4xCypPoAHbISmrrCR7BBEbqlaR";
//let __host_api='http://192.168.1.40:8000/';
let __host_api='http://30.30.30.226:8000/';
export default class Majax{
	constructor(){
		this.header= null;
		this.is_reload=false;
		let c = __host_api||'';
		this.config = {
			login: c+'oauth/token',
			refresh: c+'oauth/token'
		};
		this.request_fncs = null;
		this.request_url = null;
		this.request_type = '';
		this.request_data =	 null;
		this.status_valid = [200,201,202,203,204,205,206];
		this.status_entity = [422];
		this.status_reload = [401];
	}
	validate(callback){
		return AsyncStorage.getItem('authentication').then((user)=>this.__validate(user,callback));
	}
	__validate(user,callback){
		if(user){
			callback(true);
		}else{
			callback(false);
		}
	}
	createHeader(user){
		if(this.header){
			delete this.header;
		}
		this.header=new Headers();
		if(user){
			let auth = JSON.parse(user);
			this.header.set('Authorization',auth.token_type+' '+auth.access_token);
		}
	}
	logout(){
		this.access_token = null;
		this.refresh_token = null;
		this.token_type = null;
		this.valid_handle = null;
		this.reload_handle = null;
		this.error_handle = null;
		this.is_authenticate = false;
		AsyncStorage.clear()-then(()=>console.warn('logout'));
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
	__response(data){
		let f = this.request_fncs;
		if(f && f.valid){
			f.valid(data);
		}
	}
	__responseAjax(res){
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
					res.json().then((data)=>this.__response(data));
				break;
			}
		}else if(res.status===401 && this.is_reload===false){
			this.oauthRefresh();
		}else{
			console.warn('Error inesperado en la petición response ajax');
			console.warn(res);
			res.json().then((err)=>this.__errorAjax(err));
		}
	}
	__errorAjax(error){
		let f = this.request_fncs;
		console.warn(error);
		if(f && f.error){
			f.error(error);
		}
	}
	get(url, fncs, data = null){
		AsyncStorage.getItem('authentication').then((user)=>this.__get(user,url,fncs,data));
	}
	__get(user,url, fncs, data = null) {
		this.createHeader(user);
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
		let h = __host_api||'';
		if(!this.is_reload){
			url = h+url;
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
	post(url, fncs, data = null){
		AsyncStorage.getItem('authentication').then((user)=>this.__post(user,url,fncs,data));
	}
	__post(user, url, fncs, data = null) {
		this.createHeader(user);
		this.request_type = 'POST';
		this.request_url = url;
		this.request_data = data;
		this.request_fncs = fncs;
		let h = __host_api||'';
		if(!this.is_reload){
			url = h+url;
		}
		let __body=null;
		this.header.set('X-Requested-With', 'XMLHttpRequest');
		if(data){
			switch(data.type){
				case 'file':
					let fd = new FormData();
					fd.append('file',data.data);
					__body = fd;
					break;
				case 'form':
					let fd2 = new FormData(data.data);
					body=fd2;
					break;
				case 'formdata':
					__body = data.data;
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
	put(url, fncs, data = null){
		AsyncStorage.getItem('authentication').then((user)=>this.__put(user,url,fncs,data));
	}
	__put(user, url, fncs, data = null) {
		this.createHeader(user);
		this.request_type = 'PUT';
		this.request_url = url;
		this.request_fncs = fncs;
		this.request_data = data;
		let h = __host_api||'';
		if(!this.is_reload){
			url = h+url;
		}
		let __body=null;
		this.header.set('X-Requested-With', 'XMLHttpRequest');
		if(data){
			switch(data.type){
				case 'file':
					let fd = new FormData();
					fd.append('file',data.data);
					__body = fd;
					break;
				case 'form':
					let fd2 = new FormData(data.data);
					__body = fd2;
					break;
				case 'formdata':
					__body = data.data;
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
	delete(url, fncs){
		AsyncStorage.getItem('authentication').then((user)=>this.__get(user,url,fncs,data));
	}
	__delete(user, url, fncs) {
		this.createHeader(user);
		this.request_type = 'DELETE';
		this.request_url = url;
		this.request_data = data;
		this.request_fncs = fncs;
		let h = __host_api||'';
		if(!this.is_reload){
			url = h+url;
		}
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
		this.createHeader(null);
		this.request_fncs = fncs;
		this.header.set('X-Requested-With', 'XMLHttpRequest');
		this.header.set('Content-Type','application/json');
		this.header.set('Accept', 'application/json');
		fetch(
			this.config.login,
			{
				method: 'POST',
				headers: this.header,
				mode: 'cors',
				cache: 'default',
				body: JSON.stringify({
					grant_type:"password",
					client_id:__client_id,
					client_secret:__client_secret,
					username: username,
					password: password
				})
			}
		).then(
			(res)=>this.__responseOauth(res)
		).catch(
			(err)=>this.__errorOauth(err)
		);
	}
	__errorOauth(err){
		let f = this.request_fncs;
		if(f && f.error){
			f.error(err);
		}
	}
	__responseJsonOauth(data){
		AsyncStorage.setItem('authentication',JSON.stringify(data)).then(()=>this.__validOauth());
	}
	__validOauth(){
		let f = this.request_fncs;
		if(f && f.valid){
			f.valid();
		}
	}
	__responseOauth(res){
		if(res.ok){
			res.json().then((data)=>this.__responseJsonOauth(data));
		}else{
			res.json().then((err)=>this.__errorAjax(err));
		}
	}
	oauthRefresh(){
		AsyncStorage.getItem('authentication').then((user)=>this.__oauthRefresh(user));
	}
	__oauthRefresh(data){
		this.createHeader(data);
		let user = JSON.parse(data);
		this.header.set('X-Requested-With', 'XMLHttpRequest');
		this.header.set('Content-Type','application/json');
		this.header.set('Accept', 'application/json');
		fetch(
			this.config.refresh,
			{
				method: 'POST',
				headers: this.header,
				mode: 'cors',
				cache: 'default',
				body: JSON.stringify({
					grant_type:"refresh_token",
					client_id:__client_id,
					client_secret:__client_secret,
					refresh_token: user.refresh_token
				})
			}
		).then(
			(res)=>this.__responseRefresh(res)
		).catch(
			(error)	=>	this.__errorAjax(error)
		);
	}
	__responseJsonRefresh(data){
		AsyncStorage.setItem('authentication',JSON.stringify(data)).then(()=>this.requestReload());
	}
	__responseRefresh(res){
		if(res.ok){
			res.json().then((data)=>this.__responseJsonRefresh(data));
		}else{
			console.warn('Error inesperado en la petición');
			console.warn(res);
		}
	}
};