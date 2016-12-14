/**
 * Created by devll on 2016/12/7.
 */
;(function (m) {
    var logEvent = function (event) {
            m.log(event);
        },
        core_rspace = /\s+/,
        ajaxConverter = function (config, response) {
            var conv, conv2, current, tmp,
                dataTypes = config.dataTypes.slice(),
                prev = dataTypes[ 0 ],
                converters = {},
                i = 0;
            if ( dataTypes[ 1 ] ) {
                for ( conv in config.converters ) {
                    converters[ conv.toLowerCase() ] = config.converters[ conv ];
                }
            }
            for ( ; (current = dataTypes[++i]); ) {
                if ( current !== "*" ) {
                    if ( prev !== "*" && prev !== current ) {
                        conv = converters[ prev + " " + current ] || converters[ "* " + current ];
                        if ( !conv ) {
                            for ( conv2 in converters ) {
                                tmp = conv2.split(" ");
                                if ( tmp[ 1 ] === current ) {
                                    conv = converters[ prev + " " + tmp[ 0 ] ] ||
                                        converters[ "* " + tmp[ 0 ] ];
                                    if ( conv ) {
                                        if ( conv === true ) {
                                            conv = converters[ conv2 ];
                                        } else if ( converters[ conv2 ] !== true ) {
                                            current = tmp[ 0 ];
                                            dataTypes.splice( i--, 0, current );
                                        }

                                        break;
                                    }
                                }
                            }
                        }
                        if ( conv !== true ) {
                            try {
                                response.responseData = conv( response[prev]);
                            } catch ( e ) {
                                return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
                            }
                        }
                    }
                    prev = current;
                }
            }
            return { state: "success", data: response };
        };
    var AjaxObserver = function (preparedHooks, startedHooks, completedHooks, successedHooks, failedHooks) {
        this.preparedHooks = preparedHooks || [logEvent];
        this.startedHooks = startedHooks || [logEvent];
        this.completedHooks = completedHooks || [logEvent];
        this.successedHooks = successedHooks || [logEvent];
        this.failedHooks = failedHooks || [logEvent];
    };
    AjaxObserver.prototype.onPrepared = function (event) {
        hooksExecutor(this.preparedHooks, event);
    };
    AjaxObserver.prototype.onStarted = function (event) {
        hooksExecutor(this.startedHooks, event);
    };
    AjaxObserver.prototype.onCompleted = function (event) {
        hooksExecutor(this.completedHooks, event);
    };
    AjaxObserver.prototype.onSuccessed = function (event) {
        hooksExecutor(this.successedHooks, event);
    };
    AjaxObserver.prototype.onFailed = function (event) {
        hooksExecutor(this.failedHooks, event);
    };
    var AjaxTask = function (config) {
        config.dataTypes = m.trim(config.dataType || "*").toLowerCase().split(core_rspace);
        this.config = config;
        this.xhr = this.config.xhr();
    };
    AjaxTask.prototype.adapted = function (observer) {
        if (this.config.async) {
            this.xhr.timeout = this.config.timeout;
            m.inject(this).before("start", function (jp) {
                observer.onPrepared({config: this.config, readyState: this.xhr.readyState, type: 'prepared'});
            }).after("start", function (jp) {
                observer.onStarted({config: this.config, readyState: this.xhr.readyState, type: 'started'});
            }).flush();
            var config = this.config;
            this.xhr.onreadystatechange = function (e) {
                if (this.readyState === 4) {
                    var ct,type,finalDataType,firstDataType,responseHeadersString = this.getAllResponseHeaders(),response = {}, responseHeaders = {}, match, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
                    while (( match = rheaders.exec(responseHeadersString) )) {
                        responseHeaders[match[1].toLowerCase()] = match[2];
                    }
                    for(type in config.responseFields){
                        if (this[config.responseFields[type]]) {
                            response[type] = this[config.responseFields[type]];
                        }
                    }
                    while( config.dataTypes[ 0 ] === "*" ) {
                        config.dataTypes.shift();
                        if ( ct === undefined ) {
                            ct = config.mimeType || responseHeaders["content-type"];
                        }
                    }
                    if ( ct ) {
                        for ( type in config.contents ) {
                            if ( config.contents[ type ] && config.contents[ type ].test( ct ) ) {
                                config.dataTypes.unshift( type );
                                break;
                            }
                        }
                    }
                    if ( config.dataTypes[ 0 ] in response ) {
                        finalDataType = config.dataTypes[ 0 ];
                    } else {
                        // Try convertible dataTypes
                        for ( type in response ) {
                            if ( !config.dataTypes[ 0 ] || config.converters[ type + " " + config.dataTypes[0] ] ) {
                                finalDataType = type;
                                break;
                            }
                            if ( !firstDataType ) {
                                firstDataType = type;
                            }
                        }
                        // Or just use first one
                        finalDataType = finalDataType || firstDataType;
                    }
                    if ( finalDataType ) {
                        if ( finalDataType !== config.dataTypes[ 0 ] ) {
                            config.dataTypes.unshift( finalDataType );
                        }
                    }
                    response = m.extend(response,{
                        responseHeadersString: responseHeadersString,
                        responseHeaders: responseHeaders,
                        responseType: this.responseType,
                        responseURL: this.responseURL,
                        status : this.readyState
                    });
                    observer.onCompleted({type: 'completed', response: response});
                    if (ajaxConverter(config, response)) {
                        observer.onSuccessed({});
                    } else {
                        observer.onFailed({});
                    }

                }
            };
            this.xhr.ontimeout = function (e) {
                observer.onFailed({});
            }
        } else {
            m.inject(this).before("start", function (jp) {
                observer.onPrepared({});
            }).after("start", function (jp) {
                observer.onStarted({});
            }).after("send", function (jp) {
                observer.onCompleted({});
                observer.onSuccessed({});
                observer.onFailed({});
            }).flush();
        }
        return this;
    };
    AjaxTask.prototype.start = function () {
        if (this.config.username) {
            this.xhr.open(this.config.method, this.config.url, this.config.async, this.config.username, this.config.password);
        } else {
            this.xhr.open(this.config.method, this.config.url, this.config.async);
        }
        this.xhr.setRequestHeader("Accept",
            this.config.dataType && this.config.accepts[this.config.dataType] ?
                this.config.accepts[this.config.dataType]
                : this.config.accepts["*"]
        );
        return this;
    };
    AjaxTask.prototype.send = function () {
        this.xhr.send();
    };
    //from jquery
    var rhash = /#.*$/,
        defaultConfig = {
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
            responseFields : {xml:'responseXML',text:"responseText"},
            contents: {"html": /html/,"json":/json/,"script":/javascript|ecmascript/,"xml": /xml/},
            converters: {
                "* text": m.stringify,
                "text html": true,
                "text json": m.parseJSON,
                "text xml": m.parseXML
            },
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": ["*/"]+["*"]
            },
        }, hooksExecutor = function (hooks, event) {
            for (var i = 0; i < hooks.length; i++) {
                (hooks[i])(event);
            }
        };
    m.extend({
        ajaxSetup: function (config) {
            return m.extend(defaultConfig, config);
        },
        ajax: function (cfg) {
            var config = m.extend({}, defaultConfig);
            config = m.extend(config, cfg);
            config.url = config.url.replace(rhash, "");
            new AjaxTask(config).adapted(new AjaxObserver()).start().send();
        }
    });
})(window.mirror);