/**
 * Created by devll on 2016/12/7.
 */
;(function (w, d) {
    var m = {};
    m.window = w;
    m.document = d;
    m.extend = function (target, source) {
        if (arguments.length === 1) {
            return m.extend(m, target);
        } else {
            for (var ky in source) {
                target[ky] = source[ky];
            }
            return target;
        }
    };
    m.extend({
        isIE8: w == d && d != w
    });
    m.extend({
        isIE9: (function () {
            if(!m.isIE8){
                var textarea = d.createElement("textarea");
                textarea.innerHTML = "<p>ie9</p>";
                return textarea.value && textarea.value == "ie9";
            }else{
                return false;
            }
        })()
    });
    m.extend({
        isChrome: !!w.chrome
    });
    /**************patch******************/
    (function(){
        //Array
        Array.prototype.get = function(index){
            return this[index];
        };
        Array.prototype.set = function(index,value){
            this[index] = value;
            return this.length;
        };
        //RegExp
        RegExp.prototype.restore = m.isIE8?(function(exec){
            return function(){
                while(exec.call(this)!=null);
            };
        })(RegExp.prototype.exec):function(){
            this.lastIndex = 0;
        };
        //String
        if(m.isIE8){
            String.prototype.split = (function(){
                var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined';
                var maxSafe32BitInt = Math.pow(2, 32) - 1;
                var strSplit = String.prototype.split;
                var strSlice = String.prototype.slice;
                var pushCall = Array.prototype.push;
                var arraySlice  = Array.prototype.slice;
                return function (separator, limit) {
                    var string = String(this);
                    if (typeof separator === 'undefined' && limit === 0) {
                        return [];
                    }
                    if (Object.prototype.toString.call(separator)!=="[object RegExp]") {
                        return strSplit.apply(this, [separator, limit]);
                    }
                    var output = [];
                    var flags = (separator.ignoreCase ? 'i' : '') +
                            (separator.multiline ? 'm' : '') +
                            (separator.unicode ? 'u' : '') +
                            (separator.sticky ? 'y' : ''),
                        lastLastIndex = 0,
                        separator2, match, lastIndex, lastLength;
                    var separatorCopy = new RegExp(separator.source, flags + 'g');
                    if (!compliantExecNpcg) {
                        separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
                    }
                    var splitLimit = typeof limit === 'undefined' ? maxSafe32BitInt : parseInt(limit);
                    match = separatorCopy.exec(string);
                    while (match) {
                        lastIndex = match.index + match[0].length;
                        if (lastIndex > lastLastIndex) {
                            pushCall.call(output, strSlice.apply(string, [lastLastIndex, match.index]));
                            if (!compliantExecNpcg && match.length > 1) {
                                match[0].replace(separator2, function () {
                                    for (var i = 1; i < arguments.length - 2; i++) {
                                        if (typeof arguments[i] === 'undefined') {
                                            match[i] = void 0;
                                        }
                                    }
                                });
                            }
                            if (match.length > 1 && match.index < string.length) {
                                pushCall.apply(output, arraySlice.apply(match, [1]));
                            }
                            lastLength = match[0].length;
                            lastLastIndex = lastIndex;
                            if (output.length >= splitLimit) {
                                break;
                            }
                        }
                        if (separatorCopy.lastIndex === match.index) {
                            separatorCopy.lastIndex++;
                        }
                        match = separatorCopy.exec(string);
                    }
                    if (lastLastIndex === string.length) {
                        if (lastLength || !separatorCopy.test('')) {
                            pushCall.call(output, '');
                        }
                    } else {
                        pushCall.call(output, strSlice.apply(string, [lastLastIndex]));
                    }
                    return output.length > splitLimit ? arraySlice(output, 0, splitLimit) : output;
                };
            }());
        }
    })();
    /**************patch******************/
    var I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    m.extend({
        UUID: function () {
            var len = isNaN(arguments[0]) ? 32 : arguments[0];
            var radix = isNaN(arguments[1]) || arguments[1] > 62 ? 62 : arguments[1];
            var uuid = null;
            radix = radix == 0 ? I64BIT_TABLE.length : radix;
            if (len > 0) {
                uuid = new Array(len);
                for (var i = 0; i < len; i++) uuid[i] = I64BIT_TABLE[parseInt(Math.random() * radix)];
            } else {
                // rfc4122, version 4 form
                var r;
                len = 36;
                uuid = new Array(len);
                // rfc4122 requires these characters
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';
                for (var i = 0; i < len; i++) {
                    if (!uuid[i]) {
                        r = parseInt(Math.random() * 16);
                        uuid[i] = I64BIT_TABLE[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }
            return uuid.join("");
        }
    });
    var ObjectProtStr = w.Object.prototype.toString,
        typeAnalyzer = /^\[object ([a-zA-Z_\$]{1}[a-zA-Z0-9_\$]{0,})\]$/,
        typeCache = {};
    m.extend({
        type: function (obj) {
            var rawType = ObjectProtStr.apply(obj);
            if(rawType in typeCache){
                return typeCache[rawType];
            }else{
                typeCache[rawType] = typeAnalyzer.exec(rawType)[1];
                typeAnalyzer.restore();
                m.assertValid(typeCache[rawType]);
                return typeCache[rawType];
            }
        }
    });
    m.extend({
        each:(function(){
            var access = function(indexing,value,func){
                return (value?func.call(value,indexing,value):func(indexing,value))===false;
            };
            return function(data,func){
                if(m.isOne(data,"Array")){
                    for(var i = 0;i<data.length;i++){
                        if(access(i,data[i],func))break;
                    }
                }else{
                    for(var ky in data){
                        if(access(ky,data[ky],func))break;
                    }
                }
            }
        })()
    });
    m.extend({
        isOne : function(data,type){
            return m.type(data)===type;
        }
    })
    m.extend({
        stringify: function (obj) {
            return JSON.stringify(obj);
        }
    });
    var HashCache = {};
    m.extend({
        hashCode: function(obj){
            var objStr = m.stringify(obj);
            if(HashCache[objStr])
                return HashCache[objStr];
            else{
                var seed = 5381,i = objStr.length - 1;
                for (; i > -1; i--)
                    seed += (seed << 5) + objStr.charCodeAt(i);
                var value = seed & 0x7FFFFFFF;
                var hash = [];
                do{
                    hash.push(I64BIT_TABLE[value & 0x3F]);
                }while(value >>= 6);
                return HashCache[objStr] = hash.join("");
            }
        }
    });
    m.extend({
        trim: function(str){
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
    });
    m.extend({
        assertDefined:function(obj,e){
            if(obj===undefined)throw e||"object is undefined...";
        },
        assertNotNull:function(obj,e){
            if(obj===null)throw e||"object is null...";
        },
        assertValid:function(obj,e){
            m.assertDefined(obj,e);
            m.assertNotNull(obj,e);
        }
    });
    window.mirror = m;
})(window, document);
