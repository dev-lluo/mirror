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
        m.extend({
            type : m.inject.before(m.type,function(jp){
                jp.result = jp.args[0]&&jp.args[0].type____;
                jp.resume = !jp.result;
            })
        });
        m.extend({
            hashCode : m.inject.before(m.hashCode,function(jp){
                jp.result = jp.args[0]&&jp.args[0].type____&&jp.args[0].hashCode();
                jp.resume = !jp.result;
            })
        })
        m.extend({
            stringify : m.inject.before(m.stringify,function(jp){
                jp.result = jp.args[0]&&jp.args[0].type____&&jp.args[0].serialize();
                jp.resume = !jp.result;
            })
        })
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
        mock = function(obj){
            if(m.isOne(obj,"Object")){
                return mockObject(obj);
            }else if(m.isOne(obj,"Array")){
                return mockArray(obj);
            }else{
                return obj;
            }
        },
        mockObject = function(obj){
            m.each(obj,function(key,value){

            });
        },
        mockArray = function(obj){

        };
    m.extend({
        mock : function(obj){
            return rawCache[rawObject.hashCode(obj)]||(rawCache[rawObject.hashCode(obj)] = mock(obj))
        }
    })
})(mirror);