class parts {

    constructor(){
        this.ajaxSettings = {
            url: '',
            type: 'GET',
            dataType: 'text', // text, html, json or xml
            async: true,
            cache: true,
            data: null,
            contentType: 'application/x-www-form-urlencoded',
            accepts: {
                text: 'text/plain',
                html: 'text/html',
                xml: 'application/xml, text/xml',
                json: 'application/json, text/javascript'
            }
        };
    }

     mixIn (target) {
        for (var i = 1, arg, args = arguments; arg = args[i++];) {
            if (arg !== target) {
                for (var prop in arg) {
                    target[prop] = arg[prop];
                }
            }
        }
        return target;
    }

     promise () {
        if(Promise)return Promise;
        return class Promise {
            constructor(fn){
                var that = this,
                    resolve = function (val) {
                        that.resolve(val);
                    },
                    reject = function (val) {
                        that.reject(val);
                    };
                that.status = 'pending';
                that.resolveFn = null;
                that.rejectFn = null;
                typeof fn === 'function' && fn(resolve, reject);
            }

            resolve (val) {
                if (this.status === 'pending') {
                    this.status = 'fulfilled';
                    this.resolveFn && this.resolveFn(val);
                }
            }

            reject (val) {
                if (this.status === 'pending') {
                    this.status = 'rejected';
                    this.rejectFn && this.rejectFn(val);
                }
            }

            then (resolve, reject) {
                var borrow = new Promise();
                this.resolveFn = function (val) {
                    var result = resolve ? resolve(val) : val;
                    if (result instanceof Promise) {
                        result.then(function (val) {
                            borrow.resolve(val);
                        });
                    } else {
                        borrow.resolve(result);
                    }
                }
                this.rejectFn = function (val) {
                    var result = reject ? reject(val) : val;
                    borrow.reject(result);
                }
                return borrow;
            }
        }

    }

     ajax (options){
        var pms = {},
            xhr = new XMLHttpRequest(),
            opts = (s, o) => {
                var opts = {};
                this.mixIn(opts, s, o);
                return opts;
            }(this.ajaxSettings, options),
            param = data => {
                var s = [];
                for (var key in data) {
                    s.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                }
                return s.join('&');
            },

            ready = (resolve, reject) => {
                return  () => {
                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                        var data = (opts.dataType == 'xml') ? xhr.responseXML : xhr.responseText;
                        if (opts.dataType == 'json') {
                            data = JSON.parse(data);
                        }
                        resolve(data, xhr.status);
                    } else {
                        reject(opts, xhr, xhr.status);
                    }
                }
            };

        //clear cache
        if (!opts.cache) {
            opts.url += (~opts.url.indexOf('?') ? '&' : '?') + '_=' + (+new Date);
        }

        //queryString
        if (opts.data) {
            if (opts.type == 'GET') {
                opts.url += (~opts.url.indexOf('?') ? '&' : '?') + param(opts.data);
                opts.data = null;
            } else {
                opts.data = opts.contentType ? param(opts.data) : opts.data;
            }
        }

        xhr.open(opts.type, opts.url, opts.async);

        opts.contentType && xhr.setRequestHeader('Content-type', opts.contentType);

        if (opts.contentType && opts.dataType && opts.accepts[opts.dataType]) {
            xhr.setRequestHeader('Accept', opts.accepts[opts.dataType]);
        }

        pms = new Promise(function (resolve, reject) {
            if (opts.async) {
                xhr.onload = ready.apply(xhr, arguments);
                xhr.send(opts.data);
            } else {
                xhr.send(opts.data);
                ready.apply(xhr, arguments)();
            }
        });

        return pms;
    }

}


export default new parts;
