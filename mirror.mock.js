(function (m) {
    var  __Proxy__ = function(instance,accessors,fieldAccessor,methodAccessor){
            this.__inst__ = instance;
            this.__accs__ = accessors;
            this.__facc__ = fieldAccessor;
            this.__macc__ = methodAccessor;
        },
        def = Object.defineProperties,
        fieldAccessor = function (instance, accessors, name, value) {
            if (arguments.length === 4) {
                accessors[name].set.call(instance, value);
            } else {
                return accessors[name].get.call(instance);
            }
        },
        methodAccessor ;
    if (m.isIE8) {
        m.inject(m).before("type",function(jp){
            jp.result = jp.args[0]&&jp.args[0].type____;
            jp.resume = !jp.result;
        }).before("each",function(){
            if(jp.args[0]&&jp.args[0].type____){
                jp.args[0].each(jp.args[1]||function(){},jp.args[2]||function(){});
                jp.resume = false;
            }
        }).before("hashCode",function(jp){
            jp.result = jp.args[0]&&jp.args[0].type____&&jp.args[0].hashCode();
            jp.resume = !jp.result;
        }).before("stringify",function(jp){
            jp.result = jp.args[0]&&jp.args[0].type____&&jp.args[0].serialize();
            jp.resume = !jp.result;
        }).flush();
        methodAccessor = function (instance, accessors, name) {
            return accessors[name].apply(instance, slice.call(arguments, 3));
        };
        m.window.execScript([
            "Function parseVB(code)",
            "\tExecuteGlobal(code)",
            "End Function"
        ].join("\r\n"), "VBScript");
        var buildArgString = function (argCnt) {
            var args = [];
            for (var i = 0; i < argCnt; i++) {
                args.push("arg" + i);
            }
            ;
            return args.join(",");
        };
        __Proxy__.prototype.create = function(){
            var className = "VBClass"+m.UUID();
            var buffer = [
                "Class "+className,
                "\tPrivate inst,accs,facc,macc",
                "\tPublic Default Function VBConstructor(o, a, fc, mc)",
                "\t\tSet inst = o : set accs = a : set facc = fc : set macc = mc ",
                "\t\tSet VBConstructor = Me",
                "\tEnd Function"
            ];
            var self = this;
            m.each(self.__inst__,function(key,value){
                if(m.isOne(value,"Function")){
                    self.__accs__[key] = value;
                    var fArgStr = buildArgString(value.length);
                    var aArgStr = fArgStr === ""?"":(","+fArgStr);
                    buffer.push(
                        "\tPublic Function " + key + "("+fArgStr+")",
                        "\tOn Error Resume Next",
                        "\t\tSet " + key + " = macc(inst,accs,\"" + key + "\""+aArgStr+")",
                        "\tIf Err.Number <> 0 Then",
                        "\t\t" + key + " = macc(inst,accs,\"" + key + "\""+aArgStr+")",
                        "\tEnd If",
                        "\tOn Error Goto 0",
                        "\tEnd Function"
                    );
                }else{
                    if(!(key in self.__accs__)){
                        self.__accs__[key] = {
                            get : function(){
                                return this[key];
                            },
                            set : function(val){
                                this[key] = val;
                            }
                        };
                    }
                    self.__accs__[key].get&&buffer.push(
                        "\tPublic Property Get " + key + "",
                        "\tOn Error Resume Next",
                        "\t\tSet " + key + " = facc(inst,accs,\"" + key + "\")",
                        "\tIf Err.Number <> 0 Then",
                        "\t\t" + key + " = facc(inst,accs,\"" + key + "\")",
                        "\tEnd If",
                        "\tOn Error Goto 0",
                        "\tEnd Property"
                    );
                    self.__accs__[key].set&&buffer.push(
                        "\tPublic Property Let " + key + "(val)",
                        "\t\tCall facc(inst,accs, \"" + key + "\", val)",
                        "\tEnd Property",
                        "\tPublic Property Set " + key + "(val)",
                        "\t\tCall facc(inst,accs, \"" + key + "\", val)",
                        "\tEnd Property"
                    );
                }
            });
            buffer.push(
                "\tPublic Property Get type____",
                "\t\ttype____ = \"__Proxy__\"",
                "\tEnd Property",
                "\tPublic Function serialize ()",
                "\t\tserialize = mirror.stringify(inst)",
                "\tEnd Function",
                "\tPublic Function hashCode ()",
                "\t\thashCode = mirror.hashCode(inst)",
                "\tEnd Function",
                "\tPublic Function each(func,filter)",
                "\t\tmirror.each(inst,func,filter)",
                "\tEnd Function",
                "End Class"
            );
            m.window.parseVB(buffer.join("\r\n"));
            m.window.parseVB([
                "Function " + className + "Factory(inst,accs,facc,macc)",
                "\tDim result",
                "\tSet result = (New " + className + ")(inst,accs,facc,macc)",
                "\tSet " + className + "Factory = result",
                "End Function"
            ].join("\r\n"));
            return m.window[className + "Factory"](self.__inst__,self.__accs__,self.__facc__,self.__macc__);
        };
    }else{
        methodAccessor = function (instance, accessors, name, args) {
            return accessors[name].apply(instance, args);
        };
        __Proxy__.prototype.create = function(){
            var self = this;
            var desc = {};
            m.each(self.__inst__,function(key,value){
                if(m.isOne(value,"Function")){
                    self.__accs__[key] = value;
                    self.__macc__[key] = function(){
                        return this.__macc__(this.__inst__,this.__accs__,key,arguments);
                    };
                }else{
                    desc[key] = {};
                    if(key in self.__accs__){
                        self.__accs__[key].get&&(desc[key].get=function(){
                            return this.__facc__(this.__inst__,this.__accs__,key);
                        });
                        self.__accs__[key].set&&(desc[key].set=function(val){
                            this.__facc__(this.__inst__,this.__accs__,key,val);
                        });
                    }else{
                        desc[key].get=function(){
                            return this.__inst__[key];
                        };
                        desc[key].set=function(val){
                            this.__inst__[key] = val;
                        };
                    }
                }
            });
            return def(this,desc);
        };
    }
    m.extend({
        defObject: function (instance, accessors) {
            return new __Proxy__(instance, accessors,fieldAccessor,methodAccessor).create();
        }
    });

    var rawCache = {},
        hookCache = {},
        mock = function(obj,hash){
            if(m.isOne(obj,"Object")){
                return mockObject(obj,hash);
            }else if(m.isOne(obj,"Array")){
                return mockArray(obj,hash);
            }else{
                return obj;
            }
        },
        mockObject = function(obj,hash){
            var desc = {};
            var hook = {};
            m.each(obj,function(key,value){
                hook[key] = {
                    before : [],
                    after  : []
                };
                desc[key] = {
                    get : function() {
                        return this[key];
                    },
                    set : function(val) {
                        var resume = true;
                        for(var i = 0;i<hook[key].before.length;i++){
                            if((resume = (hook[key].before[i])(val))===false){
                                break;
                            }
                        }
                        if(resume){
                            this[key] = val;
                            for(var i = 0;i<hook[key].after.length;i++){
                                (hook[key].after[i])(val);
                            }
                        }
                    }
                };
                obj[key] = m.mock(value);
            });
            hookCache[hash] = hook;
            return m.defObject(obj,desc);
        },
        mockArray = function(obj,hash){
            var hook = {
                add : {before:[],after:[]},
                del : {before:[],after:[]},
                srt : {before:[],after:[]},
                set : {before:[],after:[]}
            };
            m.inject(obj).before("pop",function(jp){
                var resume = true;
                var mockEvent = {
                    type:"del",
                    index:jp.proxy.length-1,
                    target:jp.proxy[jp.proxy.length-1],
                    owner:jp.proxy
                };
                for(var i = 0;i<hook.del.before.length;i++){
                    if((resume = (hook.del.before[i])(mockEvent))===false){
                        break;
                    }
                }
                if(resume){
                    jp.invoke();
                    for(var i = 0;i<hook.del.after.length;i++){
                        (hook.del.after[i])(mockEvent);
                    }
                }
            }).before("shift",function(jp){
                var resume = true;
                var mockEvent = {
                    type:"del",
                    index:0,
                    target:jp.proxy[0],
                    owner:jp.proxy
                };
                for(var i = 0;i<hook.del.before.length;i++){
                    if((resume = (hook.del.before[i])(mockEvent))===false){
                        break;
                    }
                }
                if(resume){
                    jp.invoke();
                    for(var i = 0;i<hook.del.after.length;i++){
                        (hook.del.after[i])(mockEvent);
                    }
                }
            }).before("push",function(jp){
                var resume = true;
                var mockEvent = {
                    type:"add",
                    index:jp.proxy.length,
                    target:jp.args,
                    owner:jp.proxy
                };
                for(var i = 0;i<hook.add.before.length;i++){
                    if((resume = (hook.add.before[i])(mockEvent))===false){
                        break;
                    }
                }
                if(resume){
                    jp.invoke();
                    for(var i = 0;i<hook.del.after.length;i++){
                        (hook.add.after[i])(mockEvent);
                    }
                }
            }).before("unshift",function(jp){
                var resume = true;
                var mockEvent = {
                    type:"add",
                    index:0,
                    target:jp.args,
                    owner:jp.proxy
                };
                for(var i = 0;i<hook.add.before.length;i++){
                    if((resume = (hook.add.before[i])(mockEvent))===false){
                        break;
                    }
                }
                if(resume){
                    jp.invoke();
                    for(var i = 0;i<hook.del.after.length;i++){
                        (hook.add.after[i])(mockEvent);
                    }
                }
            }).flush();
        };
    m.extend({
        mock : function(obj){
            var hash = rawObject.hashCode(obj);
            return rawCache[hash]||(rawCache[hash] = mock(obj,hash))
        }
    })
})(mirror);