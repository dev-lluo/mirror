/**
 * Created by devll on 2016/12/7.
 */
;(function (w, d) {
    var m = {};
    m.window = w;
    m.document = d,
    noop = function(){};
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
            if (!m.isIE8) {
                var textarea = d.createElement("textarea");
                textarea.innerHTML = "<p>ie9</p>";
                return textarea.value && textarea.value == "ie9";
            } else {
                return false;
            }
        })()
    });
    m.extend({
        isChrome: !!w.chrome
    });
    /**************patch******************/
    (function () {
        //Array
        Array.prototype.get = function (index) {
            return this[index];
        };
        Array.prototype.set = function (index, value) {
            this[index] = value;
            return this.length;
        };
        //RegExp
        RegExp.prototype.restore = m.isIE8 ? (function (exec) {
            return function () {
                while (exec.call(this) != null);
            };
        })(RegExp.prototype.exec) : function () {
            this.lastIndex = 0;
        };
        //String
        if (m.isIE8) {
            String.prototype.split = (function () {
                var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined';
                var maxSafe32BitInt = Math.pow(2, 32) - 1;
                var strSplit = String.prototype.split;
                var strSlice = String.prototype.slice;
                var pushCall = Array.prototype.push;
                var arraySlice = Array.prototype.slice;
                return function (separator, limit) {
                    var string = String(this);
                    if (typeof separator === 'undefined' && limit === 0) {
                        return [];
                    }
                    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
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
    m.extend({
        now: function () {
            return Date.now ? Date.now() : new Date().getTime();
        }
    });
    if (console) {
        m.extend({
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error
        });
    } else {
        var cache = [], lock = false;
        setInterval(function () {
            if (!lock && cache.length > 10000) {
                cache.splice(0, cache.length - 5000);
            }
        }, 1000 * 60);
        m.extend({
            log: function () {
                cache.push({type: "log", arguments: arguments});
            },
            info: function () {
                cache.push({type: "info", arguments: arguments});
            },
            warn: function () {
                cache.push({type: "warn", arguments: arguments});
            },
            error: function () {
                cache.push({type: "error", arguments: arguments});
            },
            tail: function (count) {
                lock = true;
                var temp, count = count || 100;
                for (count = count > cache.length ? cache.length : count; count > 0; count--) {
                    temp = cache[cache.length - count];
                    console[temp.type].apply(console, temp.arguments);
                }
                lock = false;
            },
            clear: function () {
                cache.splice(0, cache.length);
            }
        });
    }

    m.extend({
        trace: function (count) {
            var caller = arguments.callee.caller;
            var i = 0;
            count = count || 10;
            m.log("***----------------------------------------  ** " + (i + 1));
            while (caller && i < count) {
                console.log(caller.toString());
                caller = caller.caller;
                i++;
                m.log("***---------------------------------------- ** " + (i + 1));
            }
        }
    })
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
            if (rawType in typeCache) {
                return typeCache[rawType];
            } else {
                typeCache[rawType] = typeAnalyzer.exec(rawType)[1];
                typeAnalyzer.restore();
                m.assertValid(typeCache[rawType]);
                return typeCache[rawType];
            }
        }
    });
    m.extend({
        each: (function () {
            var access = function (indexing, value, func) {
                return (value ? func.call(value, indexing, value) : func(indexing, value)) === false;
            }, doFilter = function (indexing, value, filter) {
                return !!filter && (value ? filter.call(value, indexing, value) : filter(indexing, value)) === false;
            };
            return function (data, func, filter) {
                if (m.isOne(data, "Array")||"length" in data) {
                    for (var i = 0; i < data.length; i++) {
                        if (doFilter(i, data[i], filter))continue;
                        if (access(i, data[i], func))break;
                    }
                } else {
                    for (var ky in data) {
                        if (doFilter(ky, data[ky], filter))continue;
                        if (access(ky, data[ky], func))break;
                    }
                }
            }
        })()
    });
    m.extend({
        isOne: function (data, type) {
            return m.type(data) === type;
        }
    })
    m.extend({
        stringify: function (obj, deep) {
            if (deep === undefined)
                deep = 2;
            if (!deep) return undefined;
            if (m.isOne(obj, "Array")) {
                var buffer = [];
                m.each(obj, function (i, value) {
                    buffer.push(m.stringify(value, deep - 1));
                });
                return "[" + buffer.join(",") + "]";
            } else if (m.isOne(obj, "Object")) {
                var buffer = [];
                m.each(obj, function (key, value) {
                    buffer.push(key + ":" + m.stringify(value, deep - 1));
                }, function (key) {
                    return key !== "hash____";
                });
                return "{" + buffer.join(",") + "}";
            } else if (m.isOne(obj, "Date")) {
                return "\"" + obj + "\"";
            } else if (m.isOne(obj, "Number")) {
                return String(obj);
            } else if (m.isOne(obj, "Boolean")) {
                return String(obj);
            } else if (m.isOne(obj, "Function")) {
                return String(obj).replace(/([\r\n])\s*/g, "");
            } else {
                return "\"" + obj + "\"";
            }
        }
    });
    m.extend({
        eval: (function (eval) {
            return function (data) {
                if (m.isOne(data, "String")) {
                    return eval.call(w,data);
                } else if (m.isOne(data, "Function")) {
                    return (data)();
                } else {
                    return data;
                }
            };
        })(w.eval)
    })
    var HashCache = {}, hashCode = function (objStr) {
        var seed = 5381, i = objStr.length - 1;
        for (; i > -1; i--)
            seed += (seed << 5) + objStr.charCodeAt(i);
        var value = seed & 0x7FFFFFFF;
        var hash = [];
        do {
            hash.push(I64BIT_TABLE[value & 0x3F]);
        } while (value >>= 6);
        return hash.join("");
    };
    m.extend({
        hashCode: function (obj) {
            if (m.isOne(obj, "Object") || m.isOne(obj, "Array")) {
                return obj.hash____ || (obj.hash____ = hashCode(m.stringify(obj) + hashCode(new Date())))
            } else {
                var objStr = m.stringify(obj);
                return HashCache[objStr] || (HashCache[objStr] = hashCode(objStr));
            }
        }
    });
    m.extend({
        equals: function (obj1, obj2) {
            return obj1 == obj2 || m.hashCode(obj1) === m.hashCode(obj2);
        }
    });
    m.extend({
        trim: function (str) {
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
    });
    m.extend({
        assertDefined: function (obj, e) {
            if (obj === undefined)throw e || "object is undefined...";
        },
        assertNotNull: function (obj, e) {
            if (obj === null)throw e || "object is null...";
        },
        assertValid: function (obj, e) {
            m.assertDefined(obj, e);
            m.assertNotNull(obj, e);
        },
        assertTrue: function (obj, e) {
            if (obj === false)throw  e || "expression result is false...";
        },
        assertFalse: function (obj, e) {
            if (obj === true)throw e || "expression result is true...";
        }
    });

    //from jquery
    var wrapMap = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            area: [1, "<map>", "</map>"],
            _default: [0, "", ""]
        },
        rleadingWhitespace = /^\s+/,
        rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rtagName = /<([\w:]+)/,
        rhtml = /<|&#?\w+;/,
        rscriptType = /\/(java|ecma)script/i;
    m.extend({
        parseHTML: function (elem) {
            if (rhtml.test(elem)) {
                var safe = document.createDocumentFragment();
                var div = document.createElement("div");
                safe.appendChild(div);
                elem = elem.replace(rxhtmlTag, "<$1></$2>");
                tag = ( rtagName.exec(elem) || ["", ""] )[1].toLowerCase();
                wrap = wrapMap[tag] || wrapMap._default;
                depth = wrap[0];
                div.innerHTML = wrap[1] + elem + wrap[2];
                while (depth--) {
                    div = div.lastChild;
                }
                if (!m.isIE8 && rleadingWhitespace.test(elem)) {
                    div.insertBefore(document.createTextNode(rleadingWhitespace.exec(elem)[0]), div.firstChild);
                }
                var scripts = div.getElementsByTagName("script");
                m.each(scripts, function (i, value) {
                    value && value.type && rscriptType.test(value.type) && value.parentNode && value.parentNode.removeChild(value);
                });
                elem = [];
                m.each(div.childNodes,function () {
                    elem.push(this)
                });
            } else {
                elem = [document.createTextNode(elem)];
            }
            return elem;
        }
    });
    m.extend({
        parseXML: function (data) {
            if (typeof data !== "string" || !data) {
                return null;
            }
            var xml, tmp;
            try {
                if (window.DOMParser) { // Standard
                    tmp = new DOMParser();
                    xml = tmp.parseFromString(data, "text/xml");
                } else { // IE
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = "false";
                    xml.loadXML(data);
                }
            } catch (e) {
                xml = undefined;
            }
            if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
                throw "Invalid XML: " + data;
            }
            return xml;
        }
    });
    var rvalidchars = /^[\],:{}\s]*$/,
        rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
    m.extend({
        parseJSON: function (data) {
            if (typeof data !== "string" || !data) {
                return null;
            }
            data = m.trim(data);

            // Attempt to parse using the native JSON parser first
            if (window.JSON && window.JSON.parse) {
                return window.JSON.parse(data);
            }
            // Make sure the incoming data is actual JSON
            // Logic borrowed from http://json.org/json2.js
            if (rvalidchars.test(data.replace(rvalidescape, "@")
                    .replace(rvalidtokens, "]")
                    .replace(rvalidbraces, ""))) {
                return ( new Function("return " + data) )();
            }
            throw "Invalid JSON: " + data;
        }
    });

    function __Inject__(obj) {
        this.__obj__ = obj;
    };
    m.extend(__Inject__.prototype, {
        flush: function () {
            this.__obj__ = undefined;
        },
        before: function (funcName, injFunc) {
            this.__obj__[funcName] = m.inject.before(this.__obj__[funcName], injFunc);
            return this;
        },
        after: function (funcName, injFunc) {
            this.__obj__[funcName] = m.inject.after(this.__obj__[funcName], injFunc);
            return this;
        },
        around: function (funcName, injFunc) {
            this.__obj__[funcName] = m.inject.around(this.__obj__[funcName], injFunc);
            return this;
        },
        throwing: function (funcName, injFunc) {
            this.__obj__[funcName] = m.inject.throwing(this.__obj__[funcName], injFunc);
            return this;
        }
    });
    m.extend({
        inject: function (obj) {
            return new __Inject__(obj);
        }
    });
    m.extend(m.inject, {
        before: function (func, proxy) {
            return function () {
                var joinPoint = {
                    args: arguments,
                    proxy: this,
                    resume: true,
                    result: undefined
                };
                proxy.apply(this, [joinPoint]);
                return joinPoint.resume ? func.apply(this, joinPoint.args) : joinPoint.result;
            };
        },
        after: function (func, proxy) {
            return function () {
                var joinPoint = {
                    result: undefined,
                    proxy: this
                };
                joinPoint.result = func.apply(this, arguments);
                proxy.apply(this, [joinPoint]);
                return joinPoint.result;
            };
        },
        around: function (func, proxy) {
            return function () {
                var joinPoint = {
                    invoke: function () {
                        return this.result = this.func.apply(this.proxy, this.args);
                    },
                    func: func,
                    args: arguments,
                    result: undefined,
                    proxy: this
                };
                return proxy.apply(this, [joinPoint]) || joinPoint.result;
            };
        },
        throwing: function (func, proxy) {
            return function () {
                try {
                    return func.apply(this, arguments);
                } catch (e) {
                    proxy(e);
                }
            };
        }
    });

    function PromiseHooks() {};
    PromiseHooks.prototype = [];
    m.extend(PromiseHooks.prototype,{
        freeze: function (p,mul) {
            this.p = p;
            this.m = mul;
            m.inject(this).after('push',function(jp){
                this.call();
            });
            return this;
        },
        call: function () {
            while(this.length) {
                var func = this.shift();
                this.m?func.apply(window,this.p):func.call(window,this.p);
            }
        }
    });
    m.extend({
        deferred: function () {
            var d = {
                status:-1,
                validate: function (code) {
                    this.status++;
                    if(this.status>code) throw 'status error';
                },
                start: function (c,m) {
                    this.validate(0)
                    this.hookGroup____.startHooks.freeze(c,m).call();
                },
                complete: function (v,m) {
                    this.validate(1);
                    this.hookGroup____.completeHooks.freeze(v,m).call();
                },
                success: function (v,m) {
                    this.validate(1);
                    this.hookGroup____.successHooks.freeze(v,m).call();
                },
                fail: function (e) {
                    this.validate(1);
                    this.hookGroup____.failHooks.freeze(e).call();
                },
                cancel: function (e,m) {
                    this.validate(0);
                    this.hookGroup____.cancelHooks.freeze(e).call();
                },
                hookGroup____: {
                    startHooks: new PromiseHooks(),
                    completeHooks: new PromiseHooks(),
                    successHooks: new PromiseHooks(),
                    failHooks: new PromiseHooks(),
                    cancelHooks: new PromiseHooks()
                }
            };
            return m.extend(d,{
                promise____: {
                    start: function (func) {
                        d.hookGroup____.startHooks.push(func);
                        return this;
                    },
                    complete: function (func) {
                        d.hookGroup____.completeHooks.push(func);
                        return this;
                    },
                    success: function (func) {
                        d.hookGroup____.successHooks.push(func);
                        return this;
                    },
                    fail: function (func) {
                        d.hookGroup____.failHooks.push(func);
                        return this;
                    },
                    cancel: function (func) {
                        d.hookGroup____.cancelHooks.push(func);
                        return this;
                    }
                },
                promise: function () {
                    return this.promise____;
                }
            });
        }
    });
    m.extend({
        promises: function () {
            var deferred = m.deferred();
            var mw = {
                expected: arguments.length,
                s0____: 0,
                a0____: [],
                start: function (i,c) {
                    this.s0____++;
                    this.a0____[i] = c;
                    this.expected===this.s0____&&deferred.start(this.a0____,true);
                },
                s1____: 0,
                a1____: [],
                complete: function (i,v) {
                    this.s1____++;
                    this.a1____[i] = v;
                    this.expected===this.s1____&&deferred.complete(this.a1____,true);
                },
                s2____: 0,
                a2____: [],
                success: function (i,v) {
                    this.s2____++;
                    this.a2____[i] = v;
                    this.expected===this.s2____&&deferred.success(this.a2____,true);
                },
                fail: function (i,e) {
                    deferred.fail(e);
                },
                cancel: function (i,e) {
                    deferred.cancel(e);
                }
            };
            m.each(arguments,function (i, promise) {
                promise.start(function (c) {
                    mw.start(i,c);
                }).complete(function(v){
                    mw.complete(i,v);
                }).success(function (v) {
                    mw.success(i,v);
                }).fail(function (e) {
                    mw.fail(i,e);
                }).cancel(function (e) {
                    mw.cancel(i,e);
                })
            });
            if(!mw.expected){
                mw.start();
                mw.success();
            }
            return deferred.promise();
        }
    });

    var ajaxCache = {},
        noCache = /^no-(cache|store)$/ig;
    //from jquery
    rhash = /#.*$/,
        defaultConfig = {
            url: location.href,
            global: true,
            method: "GET",
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
            timeout: 10000,
            xhr: function () {
                return new m.window.XMLHttpRequest();
            },
            responseFields: {xml: 'responseXML', text: "responseText"},
            contents: {"html": /html/, "json": /json/, "script": /javascript|ecmascript/, "xml": /xml/},
            converters: {
                "* text": m.stringify,
                "text html": true,
                "text json": m.parseJSON,
                "text xml": m.parseXML,
                "text script": m.eval
            },
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": ["*/"] + ["*"]
            },
        },
        hooksExecutor = function (hooks, event) {
            if (!hooks)return;
            for (var i = 0; i < hooks.length; i++) {
                hooks[i]&&(hooks[i])(event);
            }
        },
        core_rspace = /\s+/,
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,
        preparedResponse = function (xhr, config) {
            var ct, type, finalDataType, firstDataType, responseHeadersString = xhr.getAllResponseHeaders(), response = {}, responseHeaders = {}, match;
            while (( match = rheaders.exec(responseHeadersString) )) {
                responseHeaders[match[1].toLowerCase()] = match[2];
            }
            for (type in config.responseFields) {
                if (xhr[config.responseFields[type]]) {
                    response[type] = xhr[config.responseFields[type]];
                }
            }
            while (config.dataTypes[0] === "*") {
                config.dataTypes.shift();
                if (ct === undefined) {
                    ct = config.mimeType || responseHeaders["content-type"];
                }
            }
            if (ct) {
                for (type in config.contents) {
                    if (config.contents[type] && config.contents[type].test(ct)) {
                        config.dataTypes.unshift(type);
                        break;
                    }
                }
            }
            if (config.dataTypes[0] in response) {
                finalDataType = config.dataTypes[0];
            } else {
                // Try convertible dataTypes
                for (type in response) {
                    if (!config.dataTypes[0] || config.converters[type + " " + config.dataTypes[0]]) {
                        finalDataType = type;
                        break;
                    }
                    if (!firstDataType) {
                        firstDataType = type;
                    }
                }
                // Or just use first one
                finalDataType = finalDataType || firstDataType;
            }
            if (finalDataType) {
                if (finalDataType !== config.dataTypes[0]) {
                    config.dataTypes.unshift(finalDataType);
                }
            }
            return response = m.extend(response, {
                responseHeadersString: responseHeadersString,
                responseHeaders: responseHeaders,
                responseType: xhr.responseType,
                responseURL: xhr.responseURL,
                status: xhr.status
            });
        },
        ajaxConverter = function (config, response) {
            var conv, conv2, current, tmp,
                dataTypes = config.dataTypes.slice(),
                prev = dataTypes[0],
                converters = {},
                i = 0;
            if (dataTypes[1]) {
                for (conv in config.converters) {
                    converters[conv.toLowerCase()] = config.converters[conv];
                }
            } else {
                response.responseData = response[prev];
            }
            for (; (current = dataTypes[++i]);) {
                if (current !== "*") {
                    if (prev !== "*" && prev !== current) {
                        conv = converters[prev + " " + current] || converters["* " + current];
                        if (!conv) {
                            for (conv2 in converters) {
                                tmp = conv2.split(" ");
                                if (tmp[1] === current) {
                                    conv = converters[prev + " " + tmp[0]] ||
                                        converters["* " + tmp[0]];
                                    if (conv) {
                                        if (conv === true) {
                                            conv = converters[conv2];
                                        } else if (converters[conv2] !== true) {
                                            current = tmp[0];
                                            dataTypes.splice(i--, 0, current);
                                        }

                                        break;
                                    }
                                }
                            }
                        }
                        if (conv !== true) {
                            try {
                                response.responseData = conv(response[prev]);
                            } catch (e) {
                                response.isSucceed = false;
                                response.e = "No conversion from " + prev + " to " + current;
                                return;
                            }
                        } else {
                            response.responseData = response[prev];
                        }
                    }
                    prev = current;
                }
            }
            response.isSucceed = true;
        };
    function AjaxTask(config) {
        config.dataTypes = m.trim(config.dataType || "*").toLowerCase().split(core_rspace);
        this.config = config;
        this.xhr = this.config.xhr();
    };
    AjaxTask.prototype.adapted = function (deferred) {
        if (this.config.async) {
            this.xhr.timeout = this.config.timeout;
            m.inject(this).before("start", function (jp) {
                deferred.start({config: this.config, type: 'prepared'});
            }).flush();
            var config = this.config;
            this.xhr.onreadystatechange = function (e) {
                if (this.readyState === 4) {
                    var response = preparedResponse(this, config)
                    deferred.complete({type: 'completed', response: response});
                    if (this.status >= 200 && this.status < 300) {
                        ajaxConverter(config, response);
                        if (!noCache.test(response.responseHeaders["cache-control"])) {
                            var hash = m.hashCode(m.hashCode(config.url) + config.data);
                            var cacheItem = ajaxCache[hash] = {
                                lastModified: response.responseHeaders["last-modified"],
                                etag: response.responseHeaders["etag"],
                                expires: response.responseHeaders["expires"],
                                data: response.responseData
                            };
                            if (cacheItem.expires) {
                                setTimeout(function () {
                                    ajaxCache[hash] = undefined;
                                }, new Date(cacheItem.expires) - m.now());
                            }
                        }
                    } else if (this.status === 304) {
                        var hash = m.hashCode(m.hashCode(config.url) + config.data);
                        response.responseData = ajaxCache[hash].data;
                    }
                    if (response.isSucceed) {
                        deferred.success(response.responseData);
                    } else {
                        deferred.fail(response);
                    }
                }
            };
            this.xhr.ontimeout = function (e) {
                deferred.fail({e: 'timeout', time: config.timeout});
            }
        } else {
            m.inject(this).before("start", function (jp) {
                deferred.start({config: this.config, type: 'prepared'});
            }).after("send", function (jp) {
                if (this.xhr.readyState === 4) {
                    var response = preparedResponse(this.xhr, this.config)
                    deferred.complete({type: 'completed', response: response});
                    ( this.xhr.status >= 200 && this.xhr.status < 300 || this.xhr.status === 304 ) && ajaxConverter(this.config, response);
                    if (response.isSucceed) {
                        deferred.success(response.responseData);
                    } else {
                        deferred.fail(response);
                    }
                }
            }).flush();
        }
        return this;
    };
    AjaxTask.prototype.send = function () {
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
        this.xhr.send();
    };
    var megreConfig = function (cfg) {
        var config = m.extend({}, defaultConfig);
        config = m.extend(config, cfg);
        config.url = config.url.replace(rhash, "");
        return config;
    };
    m.extend({
        ajaxSetup: function (config) {
            return m.extend(defaultConfig, config);
        },
        ajax: function (cfg) {
            var config = megreConfig(cfg);
            var deferred = m.deferred();
            var ajax = new AjaxTask(config).adapted(deferred).send();
            return deferred.promise();
        },
        getXML: function (cfg) {
            cfg.dataType = "xml";
            return m.ajax(cfg);
        },
        getJSON: function (cfg) {
            cfg.dataType = "json";
            return m.ajax(cfg);
        }
    });
    var env = {
        path: "",
        cache: {}
    };
    m.extend({
        using: function (qname) {
            var lib = env.cache[qname]||(env.cache[qname] = {core:noop})
                ,url = [env.path,qname,'.js'].join('');
            if(lib.core===noop){
                m.ajax({url:url,async:false}).success(function (v) {
                    lib.core = v;
                }).fail(function (e) {
                    lib.e = e;
                });
            }
            return lib.core;
        }
    });
    window.mirror = m;
})(window, document);
