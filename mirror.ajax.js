/**
 * Created by devll on 2016/12/7.
 */
;(function (m) {
    //from jquery
    var rhash = /#.*$/,
        config = {
            url: location.href,
            global: true,
            type: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
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

        }
    });
})(window.mirror);