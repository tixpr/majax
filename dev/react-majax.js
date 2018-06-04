'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactNative = require('react-native');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __client_id = 1,
    __client_secret = "ocxO18rEHlJEaT4xCypPoAHbISmrrCR7BBEbqlaR";
//let __host_api='http://192.168.1.40:8000/';
var __host_api = 'http://30.30.30.226:8000/';

var Majax = function () {
	function Majax() {
		_classCallCheck(this, Majax);

		this.header = null;
		this.is_reload = false;
		var c = __host_api || '';
		this.config = {
			login: c + 'oauth/token',
			refresh: c + 'oauth/token'
		};
		this.request_fncs = null;
		this.request_url = null;
		this.request_type = '';
		this.request_data = null;
		this.status_valid = [200, 201, 202, 203, 204, 205, 206];
		this.status_entity = [422];
		this.status_reload = [401];
	}

	_createClass(Majax, [{
		key: 'validate',
		value: function validate(callback) {
			var _this = this;

			return _reactNative.AsyncStorage.getItem('authentication').then(function (user) {
				return _this.__validate(user, callback);
			});
		}
	}, {
		key: '__validate',
		value: function __validate(user, callback) {
			if (user) {
				callback(true);
			} else {
				callback(false);
			}
		}
	}, {
		key: 'createHeader',
		value: function createHeader(user) {
			if (this.header) {
				delete this.header;
			}
			this.header = new Headers();
			if (user) {
				var auth = JSON.parse(user);
				this.header.set('Authorization', auth.token_type + ' ' + auth.access_token);
			}
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
			_reactNative.AsyncStorage.clear() - then(function () {
				return console.warn('logout');
			});
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
	}, {
		key: '__response',
		value: function __response(data) {
			var f = this.request_fncs;
			if (f && f.valid) {
				f.valid(data);
			}
		}
	}, {
		key: '__responseAjax',
		value: function __responseAjax(res) {
			var _this2 = this;

			if (res.ok) {
				switch (this.contentType) {
					case 'text':
						res.text().then(function (data) {
							return _this2.__response(data);
						});
						break;
					case 'blob':
						res.blob().then(function (data) {
							return _this2.__response(data);
						});
						break;
					case 'arrayBuffer':
						res.arrayBuffer().then(function (data) {
							return _this2.__response(data);
						});
						break;
					default:
						res.json().then(function (data) {
							return _this2.__response(data);
						});
						break;
				}
			} else if (res.status === 401 && this.is_reload === false) {
				this.oauthRefresh();
			} else {
				console.warn('Error inesperado en la petición response ajax');
				console.warn(res);
				res.json().then(function (err) {
					return _this2.__errorAjax(err);
				});
			}
		}
	}, {
		key: '__errorAjax',
		value: function __errorAjax(error) {
			var f = this.request_fncs;
			console.warn(error);
			if (f && f.error) {
				f.error(error);
			}
		}
	}, {
		key: 'get',
		value: function get(url, fncs) {
			var _this3 = this;

			var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			_reactNative.AsyncStorage.getItem('authentication').then(function (user) {
				return _this3.__get(user, url, fncs, data);
			});
		}
	}, {
		key: '__get',
		value: function __get(user, url, fncs) {
			var _this4 = this;

			var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

			this.createHeader(user);
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
			if (!this.is_reload) {
				url = h + url;
			}
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
				return _this4.__responseAjax(res);
			}).catch(function (error) {
				return _this4.__errorAjax(error);
			});
		}
	}, {
		key: 'post',
		value: function post(url, fncs) {
			var _this5 = this;

			var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			_reactNative.AsyncStorage.getItem('authentication').then(function (user) {
				return _this5.__post(user, url, fncs, data);
			});
		}
	}, {
		key: '__post',
		value: function __post(user, url, fncs) {
			var _this6 = this;

			var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

			this.createHeader(user);
			this.request_type = 'POST';
			this.request_url = url;
			this.request_data = data;
			this.request_fncs = fncs;
			var h = __host_api || '';
			if (!this.is_reload) {
				url = h + url;
			}
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
						body = fd2;
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
				return _this6.__responseAjax(res);
			}).catch(function (error) {
				return _this6.__errorAjax(error);
			});
		}
	}, {
		key: 'put',
		value: function put(url, fncs) {
			var _this7 = this;

			var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

			_reactNative.AsyncStorage.getItem('authentication').then(function (user) {
				return _this7.__put(user, url, fncs, data);
			});
		}
	}, {
		key: '__put',
		value: function __put(user, url, fncs) {
			var _this8 = this;

			var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

			this.createHeader(user);
			this.request_type = 'PUT';
			this.request_url = url;
			this.request_fncs = fncs;
			this.request_data = data;
			var h = __host_api || '';
			if (!this.is_reload) {
				url = h + url;
			}
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
				return _this8.__responseAjax(res);
			}).catch(function (error) {
				return _this8.__errorAjax(error);
			});
		}
	}, {
		key: 'delete',
		value: function _delete(url, fncs) {
			var _this9 = this;

			_reactNative.AsyncStorage.getItem('authentication').then(function (user) {
				return _this9.__get(user, url, fncs, data);
			});
		}
	}, {
		key: '__delete',
		value: function __delete(user, url, fncs) {
			var _this10 = this;

			this.createHeader(user);
			this.request_type = 'DELETE';
			this.request_url = url;
			this.request_data = data;
			this.request_fncs = fncs;
			var h = __host_api || '';
			if (!this.is_reload) {
				url = h + url;
			}
			fetch(url, {
				method: 'DELETE',
				headers: this.header,
				mode: 'cors',
				cache: 'default'
			}).then(function (res) {
				return _this10.__responseAjax(res);
			}).catch(function (error) {
				return _this10.__errorAjax(error);
			});
		}
	}, {
		key: 'oauth',
		value: function oauth(username, password, fncs) {
			var _this11 = this;

			this.createHeader(null);
			this.request_fncs = fncs;
			this.header.set('X-Requested-With', 'XMLHttpRequest');
			this.header.set('Content-Type', 'application/json');
			this.header.set('Accept', 'application/json');
			fetch(this.config.login, {
				method: 'POST',
				headers: this.header,
				mode: 'cors',
				cache: 'default',
				body: JSON.stringify({
					grant_type: "password",
					client_id: __client_id,
					client_secret: __client_secret,
					username: username,
					password: password
				})
			}).then(function (res) {
				return _this11.__responseOauth(res);
			}).catch(function (err) {
				return _this11.__errorOauth(err);
			});
		}
	}, {
		key: '__errorOauth',
		value: function __errorOauth(err) {
			var f = this.request_fncs;
			if (f && f.error) {
				f.error(err);
			}
		}
	}, {
		key: '__responseJsonOauth',
		value: function __responseJsonOauth(data) {
			var _this12 = this;

			_reactNative.AsyncStorage.setItem('authentication', JSON.stringify(data)).then(function () {
				return _this12.__validOauth();
			});
		}
	}, {
		key: '__validOauth',
		value: function __validOauth() {
			var f = this.request_fncs;
			if (f && f.valid) {
				f.valid();
			}
		}
	}, {
		key: '__responseOauth',
		value: function __responseOauth(res) {
			var _this13 = this;

			if (res.ok) {
				res.json().then(function (data) {
					return _this13.__responseJsonOauth(data);
				});
			} else {
				res.json().then(function (err) {
					return _this13.__errorAjax(err);
				});
			}
		}
	}, {
		key: 'oauthRefresh',
		value: function oauthRefresh() {
			var _this14 = this;

			_reactNative.AsyncStorage.getItem('authentication').then(function (user) {
				return _this14.__oauthRefresh(user);
			});
		}
	}, {
		key: '__oauthRefresh',
		value: function __oauthRefresh(data) {
			var _this15 = this;

			this.createHeader(data);
			var user = JSON.parse(data);
			this.header.set('X-Requested-With', 'XMLHttpRequest');
			this.header.set('Content-Type', 'application/json');
			this.header.set('Accept', 'application/json');
			fetch(this.config.refresh, {
				method: 'POST',
				headers: this.header,
				mode: 'cors',
				cache: 'default',
				body: JSON.stringify({
					grant_type: "refresh_token",
					client_id: __client_id,
					client_secret: __client_secret,
					refresh_token: user.refresh_token
				})
			}).then(function (res) {
				return _this15.__responseRefresh(res);
			}).catch(function (error) {
				return _this15.__errorAjax(error);
			});
		}
	}, {
		key: '__responseJsonRefresh',
		value: function __responseJsonRefresh(data) {
			var _this16 = this;

			_reactNative.AsyncStorage.setItem('authentication', JSON.stringify(data)).then(function () {
				return _this16.requestReload();
			});
		}
	}, {
		key: '__responseRefresh',
		value: function __responseRefresh(res) {
			var _this17 = this;

			if (res.ok) {
				res.json().then(function (data) {
					return _this17.__responseJsonRefresh(data);
				});
			} else {
				console.warn('Error inesperado en la petición');
				console.warn(res);
			}
		}
	}]);

	return Majax;
}();

exports.default = Majax;
;