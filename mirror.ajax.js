/**
 * Created by devll on 2016/12/7.
 */
;(function (m) {
    //from jquery
    var rhash = /#.*$/,
        config = {
            url: location.href,
            global: true,
            method: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
            timeout: 10000,
            xhr: function () {
                return new window.XMLHttpRequest();
            },
            converters: {
                "* text": window.String,
                "text html": true,
                "text json": m.parseJSON,
                "text xml": m.parseXML
            },
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                script: "text/javascript, application/javascript",
                json: "application/json, text/javascript",
                text: "text/plain",
                _default: "*/*"
            }
        };
    m.extend({
        ajaxSetup: function (cfg) {
            return m.extend(config, cfg);
        },
        ajax: function (config) {
            var s = m.ajaxSetup(config || {});
            s.url = s.url.replace( rhash, "" );
            var xhr = s.xhr();
            xhr.timeout = s.timeout;
            xhr.onreadystatechange = function (e) {
                if (this.readyState == 4 && this.status == 200) {

                }else if(this.readyState == 2 && this.status == 200){
                    if(this.getResponseHeader("Content-Type")==""){

                    }
                }
            };
            if(s.username){
                xhr.open(s.method,s.url,s.async,s.username,s.password);
            }else{
                xhr.open(s.method,s.url.s.async);
            }
        }
    });
})(window.mirror);