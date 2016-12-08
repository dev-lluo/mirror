/**
 * Created by devll on 2016/12/7.
 */
(function(m){
    m.extend({
        inject:{
            before : function(func,proxy){
                return function(){
                    var joinPoint = {
                        args : arguments,
                        proxy : this,
                        resume : true,
                        result : undefined
                    };
                    proxy.apply(this,[joinPoint]) ;
                    return joinPoint.resume?func.apply(this,joinPoint.args):joinPoint.result;
                };
            },
            after : function(func,proxy){
                return function(){
                    var joinPoint = {
                        result : undefined,
                        proxy : this
                    };
                    joinPoint.result = func.apply(this,arguments) ;
                    proxy.apply(this,[joinPoint]);
                    return joinPoint.result;
                };
            },
            around : function(func,proxy){
                return function(){
                    var joinPoint = {
                        invoke : function(){
                            return this.func.apply(this.proxy,this.args);
                        },
                        func : func,
                        args : arguments,
                        proxy : this
                    };
                    return proxy.apply(this,[joinPoint]);
                };
            },
            throwing: function(func,proxy){
                return function(){
                    try {
                        return func.apply(this,arguments);
                    } catch (e) {
                        proxy(e);
                    }
                };
            }
        }
    });
})(window.mirror);