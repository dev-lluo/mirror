/**
 * Created by devll on 2016/12/7.
 */
;(function (m) {
    var AjaxObserver = function (preparedHooks,startedHooks,completedHooks,successedHooks,failedHooks) {
        this.preparedHooks = preparedHooks||[];
        this.startedHooks = startedHooks||[];
        this.completedHooks = completedHooks||[];
        this.successedHooks = successedHooks||[];
        this.failedHooks = failedHooks||[];
    };
    AjaxObserver.prototype.onPrepared = function(event){
        hooksExecutor(this.preparedHooks,event);
    };
    AjaxObserver.prototype.onStarted = function(event){
        hooksExecutor(this.startedHooks,event);
    };
    AjaxObserver.prototype.onCompleted = function(event){
        hooksExecutor(this.completedHooks,event);
    };
    AjaxObserver.prototype.onSuccessed = function(event){
        hooksExecutor(this.successedHooks,event);
    };
    AjaxObserver.prototype.onFailed = function(event){
        hooksExecutor(this.failedHooks,event);
    };
    var AjaxTask = function(config){
        this.config = config;
        this.xhr = this.config.xhr();
    };
    AjaxTask.prototype.adapted = function (observer) {
        if(this.config.async){
            this.xhr.timeout = this.config.timeout;
            m.inject(this).before("start",function (jp) {
                observer.onPrepared({});
            }).after("start",function (jp) {
                observer.onStarted({});
            }).flush();
            this.xhr.onreadystatechange = function (e) {
                if(this.readyState===4){
                    observer.onCompleted({});
                    observer.onSuccessed({});
                    observer.onFailed({});
                }
            };
            this.xhr.ontimeout = function (e) {
                observer.onFailed({});
            }
        }else{
            m.inject(this).before("start",function (jp) {
                observer.onPrepared({});
            }).after("start",function (jp) {
                observer.onStarted({});
            }).after("send",function (jp) {
                observer.onCompleted({});
                observer.onSuccessed({});
                observer.onFailed({});
            }).flush();
        }
    };
    AjaxTask.prototype.start = function(){
        if(this.config.username){
            this.xhr.open(this.config.method,this.config.url,this.config.async,this.config.username,this.config.password);
        }else{
            this.xhr.open(this.config.method,this.config.url,this.config.async);
        }
    };
    AjaxTask.prototype.send = function(){
        this.xhr.send();
    };
    /*AjaxTask.prototype.dealResult = function () {
        this.responseHeadersString = this.xhr.getAllResponseHeaders();
        var match,rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
        while( ( match = rheaders.exec( this.responseHeadersString ) ) ) {
            this.responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
        }
    };
    AjaxTask.prototype.getResponseHeader = function(key){
        return this.responseHeaders[key.toLowerCase()];
    };*/
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
        }, hooksExecutor = function (hooks, event) {
            for (var i = 0; i < hooks.length; i++) {
                (hooks[i])(event);
            }
        };
    m.extend({
        ajaxSetup: function () {
            return m.extend(config, cfg);
        },
        ajax: function (config) {
            config= m.ajaxSetup(config || {});
            config.url = config.url.replace(rhash, "");
            new AjaxTask(config).adapted(new AjaxObserver()).start().send();
        }
    });
})(window.mirror);