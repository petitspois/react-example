import $ from './parts';
import Promise from './promise';

 const settings = {
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


export default (options) => {

    var pms = {},
        xhr = new XMLHttpRequest(),
        opts = ((s, o) => {
            var opts = {};
            petitspois.mixIn(opts, s, o);
            return opts;
        })(settings, options),
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
