(function (m) {
    var __MockObject__ = function (instance, accessors, fieldAccessor, methodAccessor) {
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
        methodAccessor;
    if (m.isIE8) {
        m.inject(m).before("each", function (jp) {
            if (jp.args[0] && jp.args[0].isVBClass) {
                jp.args[0].forEach(jp.args[1] || function () {
                    }, jp.args[2] || function () {});
                jp.resume = false;
            }
        }).before("hashCode", function (jp) {
            jp.result = jp.args[0] && jp.args[0].isVBClass && jp.args[0].hashCode();
            jp.resume = !jp.result;
        }).before("stringify", function (jp) {
            jp.result = jp.args[0] && jp.args[0].isVBClass && jp.args[0].serialize();
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
        __MockObject__.prototype.create = function () {
            var className = "VBClass" + m.UUID();
            var buffer = [
                "Class " + className,
                "\tPrivate inst,accs,facc,macc",
                "\tPublic Default Function VBConstructor(o, a, fc, mc)",
                "\t\tSet inst = o : set accs = a : set facc = fc : set macc = mc ",
                "\t\tSet VBConstructor = Me",
                "\tEnd Function"
            ];
            var self = this;
            m.each(self.__inst__, function (key, value) {
                if (m.isOne(value, "Function")) {
                    self.__accs__[key] = value;
                    var fArgStr = buildArgString(value.length);
                    var aArgStr = fArgStr === "" ? "" : ("," + fArgStr);
                    buffer.push(
                        "\tPublic Function " + key + "(" + fArgStr + ")",
                        "\tOn Error Resume Next",
                        "\t\tSet " + key + " = macc(inst,accs,\"" + key + "\"" + aArgStr + ")",
                        "\tIf Err.Number <> 0 Then",
                        "\t\t" + key + " = macc(inst,accs,\"" + key + "\"" + aArgStr + ")",
                        "\tEnd If",
                        "\tOn Error Goto 0",
                        "\tEnd Function"
                    );
                } else {
                    if (!(key in self.__accs__)) {
                        self.__accs__[key] = {
                            get: function () {
                                return this[key];
                            },
                            set: function (val) {
                                this[key] = val;
                            }
                        };
                    }
                    self.__accs__[key].get && buffer.push(
                        "\tPublic Property Get " + key + "",
                        "\tOn Error Resume Next",
                        "\t\tSet " + key + " = facc(inst,accs,\"" + key + "\")",
                        "\tIf Err.Number <> 0 Then",
                        "\t\t" + key + " = facc(inst,accs,\"" + key + "\")",
                        "\tEnd If",
                        "\tOn Error Goto 0",
                        "\tEnd Property"
                    );
                    self.__accs__[key].set && buffer.push(
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
                "\tPublic Property Get isVBClass",
                "\t\tisVBClass = true",
                "\tEnd Property",
                "\tPublic Function serialize ()",
                "\t\tserialize = mirror.stringify(inst)",
                "\tEnd Function",
                "\tPublic Function hashCode ()",
                "\t\thashCode = mirror.hashCode(inst)",
                "\tEnd Function",
                "\tPublic Function forEach(func,filter)",
                "\t\tmirror[\"each\"](inst,func,filter)",
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
            return m.window[className + "Factory"](self.__inst__, self.__accs__, self.__facc__, self.__macc__);
        };
    } else {
        methodAccessor = function (instance, accessors, name, args) {
            return accessors[name].apply(instance, args);
        };
        __MockObject__.prototype.create = function () {
            var self = this;
            var desc = {};
            m.each(self.__inst__, function (key, value) {
                if (m.isOne(value, "Function")) {
                    self.__accs__[key] = value;
                    self.__macc__[key] = function () {
                        return this.__macc__(this.__inst__, this.__accs__, key, arguments);
                    };
                } else {
                    desc[key] = {};
                    if (key in self.__accs__) {
                        self.__accs__[key].get && (desc[key].get = function () {
                            return this.__facc__(this.__inst__, this.__accs__, key);
                        });
                        self.__accs__[key].set && (desc[key].set = function (val) {
                            this.__facc__(this.__inst__, this.__accs__, key, val);
                        });
                    } else {
                        desc[key].get = function () {
                            return this.__inst__[key];
                        };
                        desc[key].set = function (val) {
                            this.__inst__[key] = val;
                        };
                    }
                }
            });
            return def(this, desc);
        };
    }
    m.extend({
        defObject: function (instance, accessors) {
            return new __MockObject__(instance, accessors, fieldAccessor, methodAccessor).create();
        }
    });

    var rawCache = {},
        hookCache = {},
        mock = function (obj, hash) {
            if (m.isOne(obj, "Object")) {
                return mockObject(obj, hash);
            } else if (m.isOne(obj, "Array")) {
                return mockArray(obj, hash);
            } else {
                return obj;
            }
        },
        eventFactory = {
            get : function (owner,indexing) {
                return {
                    type : "get",
                    indexing : indexing,
                    value : owner[indexing],
                    owner : owner,
                    destroy : function(){
                        this.type = this.indexing = this.value = this.owner = undefined;
                    }
                };
            },
            set : function (owner,indexing,value) {
                return {
                    type : "set",
                    indexing : indexing,
                    oldValue : owner[indexing],
                    value : value,
                    owner : owner,
                    destroy : function(){
                        this.type = this.indexing = this.oldValue = this.value = this.owner = undefined;
                    }
                };
            },
            del : function (owner,indexing) {
                return {
                    type : "del",
                    indexing : indexing,
                    value : owner[indexing],
                    owner : owner,
                    destroy : function(){
                        this.type = this.indexing = this.value = this.owner = undefined;
                    }
                };
            },
            add : function (owner,indexing,value) {
                return {
                    type : "add",
                    indexing : indexing,
                    value : value,
                    owner : owner,
                    destroy : function(){
                        this.type = this.indexing = this.value = this.owner = undefined;
                    }
                };
            },
            srt : function (owner) {
                return {
                    type : "srt",
                    owner : owner,
                    destroy : function(){
                        this.type = this.owner = undefined;
                    }
                };
            }
        },
        hookExecutor = function(hook,type,event,joinPoint){
            for (var i = 0; i < hook[type].before.length; i++) {
                if ((hook[type].before[i])(event) === false) {
                    return;
                }
            }
            joinPoint.invoke();
            for (var i = 0; i < hook[type].after.length; i++) {
                (hook[type].after[i])(event);
            }
            event.destroy();
        },
        mockObject = function (obj, hash) {
            var desc = {};
            var hook = hookCache[hash] = {};
            m.each(obj, function (key, value) {
                hook[key] = {
                    get : {before: [], after: []},
                    set : {before: [], after: []}
                };
                desc[key] = {
                    get: function () {
                        return this[key];
                    },
                    set: function (val) {
                        this[key] = val;
                    }
                };
                m.inject(desc[key]).around("get",function(jp){
                    hookExecutor(hook[key],"get",eventFactory.get(this,key),jp);
                }).around("set",function(jp){
                    hookExecutor(hook[key],"set",eventFactory.set(this,key,jp.args[0]),jp);
                });
            });
            return m.defObject(obj, desc);
        },
        mockArray = function (obj, hash) {
            var hook = hookCache[hash] = {
                add: {before: [], after: []},
                del: {before: [], after: []},
                srt: {before: [], after: []},
                set: {before: [], after: []},
                get: {before: [], after: []}
            };
            m.inject(obj).around("pop", function (jp) {
                hookExecutor(hook,"del",eventFactory.del(this,jp.proxy.length - 1),jp);
            }).around("shift", function (jp) {
                hookExecutor(hook,"del",eventFactory.del(this,0),jp);
            }).around("push", function (jp) {
                hookExecutor(hook,"add",eventFactory.add(this,jp.proxy.length,jp.args),jp);
            }).around("unshift", function (jp) {
                hookExecutor(hook,"add",eventFactory.add(this,0,jp.args),jp);
            }).around("reverse", function (jp) {
                hookExecutor(hook,"srt",eventFactory.srt(this),jp);
            }).around("sort", function (jp) {
                hookExecutor(hook,"srt",eventFactory.srt(this),jp);
            }).around("set", function (jp) {
                hookExecutor(hook,"set",eventFactory.set(this,jp.args[0],jp.args[1]),jp);
            }).around("get", function(jp){
                hookExecutor(hook,"get",eventFactory.get(this,jp.args[0]),jp);
            }).flush();
            return obj;
        };
    var watch = function(hook,type,cut,func){
        hook[type][cut].push(func);
    };
    var unwatch = function(hook,type,cut,func){
        var removeIndex;
        m.each(hook[type][cut],function(index,cpFunc){
            if(m.equals(func,cpFunc)){
                removeIndex = index;
                return false;
            }
        })
        if(removeIndex!==undefined){
            hook[type][cut].splice(removeIndex,1);
        }
    };
    return m.extend({},{
        mock: function (obj) {
            var hash = mirror.hashCode(obj);
            return rawCache[hash] || (rawCache[hash] = mock(obj, hash))
        },
        watch: function (obj, type,cut, func, prop) {
            var hash = m.hashCode(obj);
            m.assertTrue(hash in rawCache,"object must be a MockObject");
            var hook = hookCache[hash];
            if(mirror.isOne(obj,"Object")){
                if(prop){
                    watch(hook[prop],type,cut,func);
                }else{
                    m.each(hook,function(key,value){
                        watch(value,type,cut,func);
                    });
                }
            }else {
                watch(hook,type,cut,func);
            }
        },
        unwatch: function (obj,type, cut, func, prop) {
            var hash = m.hashCode(obj);
            m.assertTrue(hash in rawCache,"object must be a MockObject");
            var hook = hookCache[hash];
            if(mirror.isOne(obj,"Object")){
                if(prop){
                    unwatch(hook[prop],type,cut,func);
                }else{
                    m.each(hook,function(key,value){
                        unwatch(value,type,cut,func);
                    });
                }
            }else {
                unwatch(hook,type,cut,func);
            }
        }
    });

})(mirror);