(function(window, document) {
	var w = window,
		doc = document;

	var Kodo = function(selector, context) {
		return new Kodo.prototype.init(selector, context);
	}
	Kodo.prototype = {
		constructor: Kodo,
		length: 0,
		splice: [].splice,
		selector: '',
		init: function(selector, context) { //dom选择的一些判断
			if (!selector) {
				return this;
			}

			if (typeof selector == 'object') {
				this[0] = selector;
				this.length = 1;
				return this;
			} else if (typeof selector == 'function') {
				Kodo.ready(selector);
				return;
			}

			var context = context || doc,
				elm;

			if (selector.charAt(0) == '#' && !selector.match('\\s')) {
				this.selector = selector;

				selector = selector.substring(1);
				elm = doc.getElementById(selector);

				this[0] = elm;
				this.context = context;
				this.length = 1;
				return this;
			} else {
				elm = context.querySelectorAll(selector);
				for (var i = 0; i < elm.length; i++) {
					this[i] = elm[i];
				}

				this.selector = selector;
				this.context = context;
				this.length = elm.length;
				return this;
			}
		},
		css: function(attr, val) { //链式测试
			console.log(this.length);
			for (var i = 0; i < this.length; i++) {
				if (arguments.length == 1) {
					return getComputedStyle(this[i], null)[attr];
				}
				this[i].style[attr] = val;
			}
			return this;
		},
		hasClass: function(cls) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			for (var i = 0; i < this.length; i++) {
				if (this[i].className.match(reg)) return true
				return false;
			}
			return this;
		},
		addClass: function(cls) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			for (var i = 0; i < this.length; i++) {
				if (!this[i].className.match(reg))
					this[i].className += ' ' + cls;
			}
			return this;
		},
		removeClass: function(cls) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			for (var i = 0; i < this.length; i++) {
				if (this[i].className.match(reg))
					this[i].className = this[i].className.replace(' ' + cls, '');
			}
			return this;
		},
		find: function(selector) {
			if (!selector) return;
			var context = this.selector;
			return new Kodo(context + ' ' + selector);
		},
		first: function() {
			return new Kodo(this[0])
		},
		last: function() {
			var num = this.length - 1;
			return new Kodo(this[num]);
		},
		eq: function(num) {
			var num = num < 0 ? (this.length - 1) : num;
			console.log(num);
			return new Kodo(this[num]);
		},
		get: function(num) {
			var num = num < 0 ? (this.length - 1) : num;
			console.log(num);
			return this[num];
		},
		next: function() {
			return sibling(this[0], "nextSibling");
		},
		prev: function() {
			return sibling(this[0], "previousSibling");
		},
		parent: function() {
			var parent = this[0].parentNode;
			parent && parent.nodeType !== 11 ? parent : null;
			var a = Kodo();
			a[0] = parent;
			a.selector = parent.tagName.toLocaleLowerCase();
			a.length = 1;
			return a;
		},
		parents: function() {
			var a = Kodo(),
				i = 0;
			while ((this[0] = this[0]['parentNode']) && this[0].nodeType !== 9) {
				if (this[0].nodeType === 1) {
					a[i] = this[0];
					i++;
				}
			}
			a.length = i;
			return a;
		}

	}
	Kodo.prototype.init.prototype = Kodo.prototype;

	//工具方法
	Kodo.ready = function(fn) {
		// 修改

		doc.addEventListener('DOMContentLoaded', function() {
			fn && fn();
		}, false);
		doc.removeEventListener('DOMContentLoaded', fn, true);

		// 修改
	}
	Kodo.each = function(obj, callback) {
			var len = obj.length,
				constru = obj.constructor,
				i = 0;

			if (constru === window.f) {
				for (; i < len; i++) {
					var val = callback.call(obj[i], i, obj[i]);
					if (val === false) break;
				}
			} else if (isArray(obj)) {
				for (; i < len; i++) {
					var val = callback.call(obj[i], i, obj[i]);
					if (val === false) break;
				}
			} else {
				for (i in obj) {
					var val = callback.call(obj[i], i, obj[i]);
					if (val === false) break;
				}
			}
		}
		///////////////////
		///////新增ajax////
		///////////////////
	Kodo.get = function(url, sucBack, complete) {
		var options = {
			url: url,
			success: sucBack,
			complete: complete
		}
		ajax(options);
	}
	Kodo.post = function(url, data, sucback, complete) {
		var options = {
			url: url,
			type: "POST",
			data: data,
			success: sucback,
			complete: complete
		}
		ajax(options);
	}

	function ajax(options) {
			var defaultOptions = {
				url: false, //ajax 请求地址
				type: "GET",
				data: false,
				success: false, //数据成功返回后的回调方法
				complete: false //ajax完成后的回调方法
			};
			for (i in defaultOptions) {
				if (options[i] === undefined) {
					options[i] = defaultOptions[i];
				}
			}

			var xhr = new XMLHttpRequest();
			var url = options.url;
			var params = formatParams(options.data);
			xhr.open(options.type, url);
			xhr.onreadystatechange = onStateChange;
			if (options.type === 'POST') {
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			}
			xhr.send(params ? params : null);

			function onStateChange() {
				if (xhr.readyState == 4) {
					var result,
						status = xhr.status;

					if ((status >= 200 && status < 300) || status == 304) {
						result = xhr.responseText;
						ajaxSuccess(result, xhr)
					} else {
						console.log("ERR", xhr.status);
					}
				}
			}

			function ajaxSuccess(data, xhr) {
				var status = 'success';
				options.success && options.success(data, options, status, xhr)
				ajaxComplete(status)
			}

			function ajaxComplete(status) {
				options.complete && options.complete(status);
			}

			function formatParams(data) {
				var arr = [];
				for (var name in data) {
					arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
				}
				arr.push(("v=" + Math.random()).replace("."));
				return arr.join("&");
			}
		}
		///////////////////
		///////新增ajax////
		///////////////////

	function sibling(cur, dir) {
		while ((cur = cur[dir]) && cur.nodeType !== 1) {}
		return cur;
	}

	function isArray(obj) {
		return Array.isArray(obj);
	}
	window.f = Kodo;
})(window, document);