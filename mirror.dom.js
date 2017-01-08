/**
 * Created by shyy_work on 2016/12/16.
 */
;(function (m) {
    var sizzle = mirror.using("mirror.sizzle")
        , eventHook = {
            input: "input"
        }
        , attrHook = {}
        , isEmptyExp = (function (exp) {
            m.inject(exp).after("test", function () {
                this.restore();
            }).flush();
            return exp;
        })(/^\s*$/g);

    function Dom(selector, context) {
        if (m.isOne(selector, "String")) {
            sizzle(selector, context, this);
        } else if (m.isOne(selector, "Array")) {
            this.push.apply(this, selector);
        }
    };
    Dom.on = function (dom, type, func, useCapture) {
        dom.addEventListener(eventHook[type] || type, func, useCapture || false);
    };
    Dom.off = function (dom, type, func, useCapture) {
        dom.removeEventListener(eventHook[type] || type, func, useCapture || false);
    };
    Dom.getText = function (dom) {
        if (dom.nodeType === 3) {
            return dom.nodeValue
        } else {
            var results = [];
            m.each(dom.childNodes, function () {
                results.push(this.nodeValue);
            }, function () {
                return this.nodeType === 3 && !isEmptyExp.test(this.nodeValue)
            });
            return results.join('');
        }
    };
    Dom.setText = function (dom, text) {
        if (dom.nodeType === 3) {
            dom.nodeValue = text;
        } else {
            var did = false;
            m.each(dom.childNodes, function () {
                if (did) {
                    this.nodeValue = "";
                } else {
                    this.nodeValue = text;
                    did = true;
                }
            }, function () {
                return this.nodeType === 3 && !isEmptyExp.test(this.nodeValue)
            });
        }
    };
    Dom.setValue = function (dom, val) {
        dom.value = val;
    };
    Dom.getValue = function (dom) {
        return dom.value;
    };
    Dom.removeAttr = function (dom, attr) {
        return dom.removeAttribute(attrHook[attr] || attr);
    };
    Dom.hasAttr = function (dom, attr) {
        return dom.hasAttribute(attrHook[attr] || attr);
    };
    var attrPolyfill = {
        text: {
            get: Dom.getText,
            set: Dom.setText
        },
        value: {
            get: Dom.getValue,
            set: Dom.setValue
        }
    };
    Dom.getAttr = function (dom, attr) {
        return attrPolyfill[attr] ? attrPolyfill[attr].get(dom) : dom.getAttribute(attrHook[attr] || attr);
    };
    Dom.setAttr = function (dom, attr, val) {
        if (val !== Dom.getAttr(dom, attr)) {
            attrPolyfill[attr] ? attrPolyfill[attr].set(dom, val) : dom.setAttribute(attrHook[attr] || attr, val);
        }
    };
    Dom.getChild = function (dom, hasText) {
        var child = [];
        m.each(dom.childNodes, function () {
            child.push(this);
        }, function () {
            return this.nodeType === 1 || (hasText && this.nodeType === 3);
        });
        return child;
    };
    Dom.getParent = function (dom) {
        return dom.parentNode;
    };
    Dom.append = function (parent, child) {
        parent.appendChild(child);
    };
    Dom.remove = function (child) {
        child.parentNode.removeChild(child);
    };
    Dom.replace = function (oldDom, newDom) {
        oldDom.parentNode.replaceChild(newDom, oldDom);
    };
    Dom.cloneNode = function (dom, dp) {
        return dom.cloneNode(dp);
    };
    Dom.valueOf = function (str) {
        var dom = new Dom(m.parseHTML(str));
        return dom;
    };
    Dom.prototype = [];
    Dom.prototype.each = function (func) {
        m.each(this, func);
        return this;
    };
    Dom.prototype.on = function (type, func, useCapture) {
        return this.each(function () {
            Dom.on(this, type, func, useCapture);
        })
    };
    Dom.prototype.off = function (type, func, useCapture) {
        return this.each(function () {
            Dom.off(this, func, useCapture);
        });
    };
    Dom.prototype.text = function (text) {
        if (arguments.length === 1) {
            return this.each(function () {
                Dom.setText(this, text);
            });
        } else {
            var text = [];
            this.each(function () {
                text.push(Dom.getText(this));
            });
            return text.join(",");
        }
    };
    Dom.prototype.val = function (val) {
        if (arguments.length === 1) {
            return this.each(function () {
                Dom.setValue(this, val);
            });
        } else {
            var val = [];
            this.each(function () {
                val.push(Dom.getValue(this));
            });
            return val.join(",");
        }
    };
    Dom.prototype.attr = function (attr, val) {
        if (arguments.length === 2) {
            return this.each(function () {
                Dom.setAttr(this, attr, val);
            });
        } else {
            var attrVal = [];
            this.each(function () {
                attrVal.push(Dom.getAttr(this, attr));
            });
            return attrVal.join(",");
        }
    };
    Dom.prototype.child = function () {
        var child = new Dom();
        this.each(function () {
            child.push(Dom.getChild(this));
        });
        return child;
    };
    Dom.prototype.parent = function () {
        var parent = new Dom();
        this.each(function () {
            parent.push(Dom.getParent(this));
        });
        return parent;
    };
    Dom.prototype.append = function (dom) {
        return this.each(function () {
            Dom.append(this, dom);
        });
    };
    Dom.prototype.remove = function () {
        return this.each(function () {
            Dom.remove(this);
        });
    };
    Dom.prototype.replace = function (dom) {
        return this.each(function () {
            Dom.replace(this, dom);
        });
    };
    Dom.prototype.clone = function (dp) {
        var clone = new Dom();
        this.each(function () {
            clone.push(Dom.cloneNode(this, dp));
        });
        return clone;
    };
    if (m.isIE8) {
        m.extend(eventHook, {
            input: "propertychange"
        });
        m.extend(Dom, {
            on: function (dom, type, func) {
                var callback = function (o, h) {
                    return function () {
                        h.apply(o, arguments);
                    };
                }(dom, func);
                dom[m.hashCode(func)] = callback;
                dom.attachEvent("on" + (eventHook[type] || type), callback);
            },
            off: function (dom, type, func) {
                var callback = dom[m.hashCode(func)];
                dom.detachEvent("on" + (eventHook[type] || type), callback);
            },
            getText: (function (extraTag) {
                extraTag.test = m.inject(extraTag).after("test", function () {
                    this.restore();
                });
                return function (dom) {
                    if (extraTag.test(dom.nodeName)) {
                        return dom.innerHTML;
                    } else {
                        var results = [];
                        m.each(dom.childNodes, function () {
                            results.push(this.nodeValue);
                        }, function () {
                            return this.nodeType === 3 && !isEmptyExp.test(this.nodeValue)
                        });
                        return results.join('');
                    }
                };
            })(/^(SCRIPT)$/ig)
        });
    }
    return m.extend({
        dom: function (selector, context) {
            return new Dom(selector, context);
        }
    }, Dom);
})(mirror);