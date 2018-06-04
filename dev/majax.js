'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Majax = function () {
	_createClass(Majax, null, [{
		key: 'setConfig',
		value: function setConfig(client_id, client_secret, host_api) {
			localStorage.setItem('credentials', JSON.stringify({
				client_id: client_id,
				client_secret: client_secret,
				host_api: host_api
			}));
		}
	}]);

	function Majax() {
		_classCallCheck(this, Majax);

		this.getAutentication();
		this.header = null;
		this.is_reload = false;
		var temp = localStorage.getItem('credentials');
		var c = '';
		if (temp) {
			c = JSON.parse(temp).host_api || '';
		}
		this.config = {
			login: c + 'oauth/token',
			refresh: c + 'oauth/token'
		};
		this.request_fncs = null;
		this.request_url = null;
		this.request_type = '';
		this.request_data = null;
	}

	_createClass(Majax, [{
		key: 'createHeader',
		value: function createHeader() {
			if (self.fetch) {
				if (this.header) {
					delete this.header;
				}
				this.header = new Headers();
				if (this.is_authenticate) {
					this.header.set('Authorization', this.token_type + ' ' + this.access_token);
				}
			} else {
				alert('Fetch no soportado, Favor de actualizar su navegador');
			}
		}
	}, {
		key: 'getAutentication',
		value: function getAutentication() {
			if (localStorage.getItem('authentication') != null) {
				this.is_authenticate = true;
				var auth = JSON.parse(localStorage.getItem('authentication'));
				this.access_token = auth.access_token;
				this.refresh_token = auth.refresh_token;
				this.token_type = auth.token_type;
			} else {
				this.is_authenticate = false;
			}
		}
	}, {
		key: 'requestErase',
		value: function requestErase() {
			this.request_fncs = null;
			this.request_url = null;
			this.request_type = '';
			this.request_data = null;
		}
	}, {
		key: 'logout',
		value: function logout() {
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

	}, {
		key: 'requestErase',
		value: function requestErase() {
			this.request_fncs = null;
			this.request_url = null;
			this.request_type = '';
			this.request_data = null;
		}
	}, {
		key: 'requestReload',
		value: function requestReload() {
			this.is_reload = true;
			switch (this.request_type) {
				case 'GET':
					this.get(this.request_url, this.request_fncs, this.request_data);
					break;
				case 'POST':
					this.post(this.request_url, this.request_fncs, this.request_data);
					break;
				case 'PUT':
					this.put(this.request_url, this.request_fncs, this.request_data);
					break;
				case 'DELETE':
					this.delete(this.request_url, this.request_fncs);
					break;
			}
		}
		//===================================

	}, {
		key: '__response',
		value: function __response(data) {
			console.info('iniciando pasado de la respuesta');
			var f = this.request_fncs;
			if (f && f.valid) {
				f.valid(data);
			}
		}
	}, {
		key: '__responseAjax',
		value: function __responseAjax(res) {
			var _this = this;

			console.info(res.status);
			if (res.ok) {
				switch (this.contentType) {
					case 'text':
						res.text().then(function (data) {
							return _this.__response(data);
						});
						break;
					case 'blob':
						res.blob().then(function (data) {
							return _this.__response(data);
						});
						break;
					case 'arrayBuffer':
						res.arrayBuffer().then(function (data) {
							return _this.__response(data);
						});
						break;
					default:
						console.info('interpretando json');
						res.json().then(function (data) {
							return _this.__response(data);
						});
						break;
				}
			} else if (res.status === 401 && this.is_reload === false) {
				this.oauth_refresh();
			} else {
				console.warn('Error inesperado en la petición response ajax');
				console.warn(res);
				res.json().then(function (err) {
					return _this.__errorAjax(err);
				});
			}
		}
	}, {
		key: '__errorAjax',
		value: function __errorAjax(error) {
			var f = this.request_fncs;
			console.error(error);
			if (f && f.error) {
				f.error(error);
			}
		}
	}, {
		key: 'get',
		value: function get(url, fncs) {
			var _this2 = this;

			var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			this.createHeader();
			if (data) {
				if (url.lastIndexOf('?') < 0) {
					url += "?";
				}
				switch (data.type) {
					case 'form':
						var d = new FormData(data.data);
						var ent = d.entries();
						var _iteratorNormalCompletion = true;
						var _didIteratorError = false;
						var _iteratorError = undefined;

						try {
							for (var _iterator = ent[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
								var k = _step.value;

								if (url.charAt(url.length - 1) !== "&") {
									url += "&";
								}
								url += k[0] + "=" + k[1];
							}
						} catch (err) {
							_didIteratorError = true;
							_iteratorError = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion && _iterator.return) {
									_iterator.return();
								}
							} finally {
								if (_didIteratorError) {
									throw _iteratorError;
								}
							}
						}

						break;
					case 'formdata':
						var ent2 = data.data.entries();
						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;

						try {
							for (var _iterator2 = ent2[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								var v = _step2.value;

								if (url.charAt(url.length - 1) !== "&") {
									url += "&";
								}
								url += v[0] + "=" + v[1];
							}
						} catch (err) {
							_didIteratorError2 = true;
							_iteratorError2 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion2 && _iterator2.return) {
									_iterator2.return();
								}
							} finally {
								if (_didIteratorError2) {
									throw _iteratorError2;
								}
							}
						}

						break;
					case 'json':
						for (var _k in data.data) {
							if (url.charAt(url.length - 1) !== "&") {
								url += "&";
							}
							url += _k + "=" + data.data[_k];
						}
						break;
					default:
						break;
				}
			}
			var h = __host_api || '';
			url = h + url;
			this.request_fncs = fncs;
			this.request_type = 'GET';
			this.request_url = url;
			this.request_data = data;
			this.header.set('X-Requested-With', 'XMLHttpRequest');
			fetch(url, {
				method: 'GET',
				headers: this.header,
				mode: 'cors',
				cache: 'default'
			}).then(function (res) {
				return _this2.__responseAjax(res);
			}).catch(function (error) {
				return _this2.__errorAjax(error);
			});
		}
	}, {
		key: 'post',
		value: function post(url, fncs) {
			var _this3 = this;

			var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			this.createHeader();
			this.request_fncs = fncs;
			this.request_type = 'POST';
			this.request_url = url;
			this.request_data = data;
			var h = __host_api || '';
			url = h + url;
			var __body = null;
			this.header.set('X-Requested-With', 'XMLHttpRequest');
			if (data) {
				switch (data.type) {
					case 'file':
						var fd = new FormData();
						fd.append('file', data.data);
						__body = fd;
						break;
					case 'form':
						var fd2 = new FormData(data.data);
						__body = fd2;
						break;
					case 'formdata':
						__body = data.data;
						break;
					case 'json':
						this.header.set('Content-Type', 'application/json');
						__body = JSON.stringify(data.data);
						break;
					default:
						__body = data.data;
						break;
				}
			}
			fetch(url, {
				method: 'POST',
				headers: this.header,
				mode: 'cors',
				cache: 'default',
				body: __body
			}).then(function (res) {
				return _this3.__responseAjax(res);
			}).catch(function (error) {
				return _this3.__errorAjax(error);
			});
		}
	}, {
		key: 'put',
		value: function put(url, fncs) {
			var _this4 = this;

			var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			this.createHeader();
			this.request_fncs = fncs;
			this.request_type = 'PUT';
			this.request_url = url;
			this.request_data = data;
			var h = __host_api || '';
			url = h + url;
			var __body = null;
			this.header.set('X-Requested-With', 'XMLHttpRequest');
			if (data) {
				switch (data.type) {
					case 'file':
						var fd = new FormData();
						fd.append('file', data.data);
						__body = fd;
						break;
					case 'form':
						var fd2 = new FormData(data.data);
						__body = fd2;
						break;
					case 'formdata':
						__body = data.data;
						break;
					case 'json':
						this.header.set('Content-Type', 'application/json');
						__body = JSON.stringify(data.data);
						break;
					default:
						__body = data.data;
						break;
				}
			}
			fetch(url, {
				method: 'PUT',
				headers: this.header,
				mode: 'cors',
				cache: 'default',
				body: __body
			}).then(function (res) {
				return _this4.__responseAjax(res);
			}).catch(function (error) {
				return _this4.__errorAjax(error);
			});
		}
	}, {
		key: 'delete',
		value: function _delete(url, fncs) {
			var _this5 = this;

			this.createHeader();
			this.request_fncs = fncs;
			this.request_type = 'DELETE';
			this.request_url = url;
			this.request_data = data;
			var h = __host_api || '';
			url = h + url;
			fetch(url, {
				method: 'DELETE',
				headers: this.header,
				mode: 'cors',
				cache: 'default'
			}).then(function (res) {
				return _this5.__responseAjax(res);
			}).catch(function (error) {
				return _this5.__errorAjax(error);
			});
		}
	}, {
		key: 'oauth',
		value: function oauth(username, password, fncs) {
			var _this6 = this;

			this.createHeader();
			this.request_fncs = fncs;
			this.header.set('X-Requested-With', 'XMLHttpRequest');
			this.header.set('Content-Type', 'application/json');
			var temp = localStorage.getItem('credentials');
			if (temp) {
				var cred = JSON.parse(temp);
				fetch(this.config.login, {
					method: 'POST',
					headers: this.header,
					mode: 'cors',
					cache: 'default',
					body: JSON.stringify({
						grant_type: "password",
						client_id: cred.client_id,
						client_secret: cred.client_secret,
						username: username,
						password: password
					})
				}).then(function (res) {
					return _this6.__responseOauth(res);
				}).catch(function (err) {
					return _this6.__errorOauth(err);
				});
			} else {
				alert('no existe información de usuario del API');
			}
		}
	}, {
		key: '__errorOauth',
		value: function __errorOauth(err) {
			var f = this.request_fncs;
			console.info('Error oauth->' + err);
			if (f && f.error) {
				f.error(err);
			}
		}
	}, {
		key: '__responseOauth',
		value: function __responseOauth(res) {
			var _this7 = this;

			if (res.ok) {
				res.json().then(function (data) {
					return _this7.__responseJsonOauth(data);
				});
			} else {
				if (res.status >= 500 && res.status <= 600) {
					this.__errorAjax({ message: res.statusText, error: res.status });
				} else {
					res.json().then(function (err) {
						return _this7.__errorAjax(err);
					});
				}
			}
		}
	}, {
		key: '__responseJsonOauth',
		value: function __responseJsonOauth(data) {
			localStorage.setItem('authentication', JSON.stringify(data));
			this.access_token = data.access_token;
			this.refresh_token = data.refresh_token;
			this.token_type = data.token_type;
			this.is_authenticate = true;
			var f = this.request_fncs;
			if (f && f.valid) {
				f.valid(data);
			}
		}
	}, {
		key: 'oauth_refresh',
		value: function oauth_refresh() {
			var _this8 = this;

			this.createHeader();
			this.header.set('X-Requested-With', 'XMLHttpRequest');
			this.header.set('Content-Type', 'application/json');
			this.header.set('Accept', 'application/json');
			var temp = localStorage.getItem('credentials');
			if (temp) {
				var cred = JSON.parse(temp);
				fetch(this.config.refresh, {
					method: 'POST',
					headers: this.header,
					mode: 'cors',
					cache: 'default',
					body: JSON.stringify({
						grant_type: "refresh_token",
						client_id: cred.client_id,
						client_secret: cred.client_secret,
						refresh_token: this.refresh_token
					})
				}).then(function (res) {
					return _this8.__responseRefresh(res);
				}).catch(function (error) {
					return _this8.__errorAjax(error);
				});
			} else {
				alert('no existe información de usuario del API');
			}
		}
	}, {
		key: '__responseRefresh',
		value: function __responseRefresh(res) {
			var _this9 = this;

			if (res.ok) {
				res.json().then(function (data) {
					return _this9.__responseJsonRefresh(data);
				});
			} else {
				res.json().then(function (err) {
					return _this9.__errorAjax(err);
				});
			}
		}
	}, {
		key: '__responseJsonRefresh',
		value: function __responseJsonRefresh(data) {
			localStorage.setItem('authentication', JSON.stringify(data));
			this.access_token = data.access_token;
			this.refresh_token = data.refresh_token;
			this.token_type = data.token_type;
			this.is_authenticate = true;
			this.requestReload();
		}
	}]);

	return Majax;
}();

exports.default = Majax;
;