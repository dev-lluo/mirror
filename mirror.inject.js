/**
 * Created by devll on 2016/12/7.
 */
(function(m){
    var __Inject__ = function (obj) {
        this.__obj__ = obj;
    };
    m.extend(__Inject__.prototype,{
        flush:function(){
            this.__obj__ = undefined;
        },
        before:function(funcName,injFunc){
            this.__obj__[funcName] = m.inject.before(this.__obj__[funcName],injFunc);
            return this;
        },
        after:function(funcName,injFunc){
            this.__obj__[funcName] = m.inject.after(this.__obj__[funcName],injFunc);
            return this;
        },
        around:function(funcName,injFunc){
            this.__obj__[funcName] = m.inject.around(this.__obj__[funcName],injFunc);
            return this;
        },
        throwing:function (funcName,injFunc) {
            this.__obj__[funcName] = m.inject.throwing(this.__obj__[funcName],injFunc);
            return this;
        }
    });
    m.extend({
        inject:function(obj){
            return new __Inject__(obj);
        }
    });
    m.extend(m.inject,{
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
    });
})(window.mirror);