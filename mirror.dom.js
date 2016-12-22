/**
 * Created by shyy_work on 2016/12/16.
 */
;(function(m){
    var sizzle = mirror.using("mirror.sizzle")
        ,eventHook = {
            input: "input"
        }
        ,attrHook = {
        }
        ,attrPolyfill = {
            text : 	{
                get : getText,
                set : setText
            },
            value : {
                get : getVal,
                set : setVal
            }
        }
        ,isEmptyExp = (function(exp){
            m.inject(exp).after("test",function () {
                this.restore();
            }).flush();
            return exp;
        })(/^\s*$/g);;
    var Query = function (selector,context) {
        if(m.isOne(selector,"String")){
            sizzle(selector,context,this);
        }else if(m.isOne(selector,"Array")){
            this.push(selector);
        }
    };
    Query.on = function (dom, type, func, useCapture) {
        dom.addEventListener(eventHook[type]||type,func,useCapture||false);
    };
    Query.off = function(dom,type,func,useCapture){
        dom.removeEventListener(eventHook[type]||type, func,useCapture||false);
    };
    Query.getText = function(dom){
        var results = [];
        m.each(dom.childNodes,function(){
            results.push(this.nodeValue);
        },function(){return this.nodeType===3&&!isEmptyExp.test(this.nodeValue)});
        return results.join('');
    };
    Query.setText = function(dom,text){
        var did = false;
        m.each(dom.childNodes,function(){
            if(did){
                this.nodeValue = "";
            }else{
                this.nodeValue = text;
                did = true;
            }
        },function(){return this.nodeType===3&&!isEmptyExp.test(this.nodeValue)});
    };
    Query.setValue = function(dom,val){
        dom.value = val;
    };
    Query.getValue = function(dom){
        return dom.value;
    };
    Query.removeAttr = function(dom,attr){
        return dom.removeAttribute(attrHook[attr]||attr);
    };
    Query.getAttr = function(dom,attr){
        return dom.getAttribute(attrHook[attr]||attr);
    };
    Query.setAttr = function(dom,attr,val){
        if(val!==Query.getAttr(dom,attr)){
            dom.setAttribute(attrHook[attr]||attr,val);
        }
    };
    Query.getChild = function(dom,hasText){
        var child = [];
        m.each(dom.childNodes,function(){
            child.push(this);
        },function(){return this.nodeType===1||(hasText&&this.nodeType===3);});
        return child;
    };
    Query.getParent  = function(dom){
        return dom.parentNode;
    };
    Query.append = function(parent,child){
        parent.appendChild(child);
    };
    Query.remove = function(child){
        child.parentNode.removeChild(child);
    };
    Query.replace = function(oldDom,newDom){
        oldDom.parentNode.replaceChild(newDom,oldDom);
    };
    Query.cloneNode = function(dom,dp){
        return dom.cloneNode(dp);
    };
    Query.valueOf = function (str) {
        var query = new Query(m.parseHTML(str));
        return query;
    };
    Query.prototype = [];
    Query.prototype.each = function (func) {
        m.each(this,func);
        return this;
    };
    Query.prototype.on = function (type,func,useCapture) {
        return this.each(function () {
            Query.on(this,type,func,useCapture);
        })
    };
    Query.prototype.off = function (type, func, useCapture) {
        return this.each(function(){
           Query.off(this,func,useCapture);
        });
    };
    Query.prototype.text = function(text){
        if(arguments.length===1){
            return this.each(function(){
                Query.setText(this,text);
            });
        }else{
            var text = [];
            this.each(function(){
                text.push(Query.getText(this));
            });
            return text.join(",");
        }
    };
    Query.prototype.val = function(val){
        if(arguments.length===1){
            return this.each(function(){
                Query.setValue(this,val);
            });
        }else{
            var val = [];
            this.each(function(){
                val.push(Query.getValue(this));
            });
            return val.join(",");
        }
    };
    Query.prototype.attr = function(attr,val){
        if(arguments.length===2){
            return this.each(function(){
                attrPolyfill[attr]?attrPolyfill[attr].set(this,val):Query.setAttr(this,attr,val);
            });
        }else{
            var attrVal = [];
            this.each(function(){
                attrVal.push(attrPolyfill[attr]?attrPolyfill[attr].get(this):Query.getAttr(this,attr));
            });
            return attrVal.join(",");
        }
    };
    Query.prototype.child = function(){
        var child = new Query();
        this.each(function(){
            child.push(Query.getChild(this));
        });
        return child;
    };
    Query.prototype.parent = function(){
        var parent = new Query();
        this.each(function(){
            parent.push(Query.getParent(this));
        });
        return parent;
    };
    Query.prototype.append = function(dom){
        return this.each(function(){
            Query.append(this,dom);
        });
    };
    Query.prototype.remove = function(){
        return this.each(function(){
            Query.remove(this);
        });
    };
    Query.prototype.replace = function(dom){
        return this.each(function(){
            Query.replace(this,dom);
        });
    };
    Query.prototype.clone = function(dp){
        var clone = new Query();
        this.each(function(){
            clone.push(Query.cloneNode(this,dp));
        });
        return clone;
    };
    if(m.isIE8){
        m.extend(eventHook,{
            input: "propertychange"
        });
        m.extend(Query,{
            on: function(dom,type,func){
                var callback = function(o,h){
                    return function(){
                        h.apply(o,arguments);
                    };
                }(dom,func);
                dom[m.hashCode(func)] = callback;
                dom.attachEvent("on" + (eventHook[type]||type), callback);
            },
            off: function(dom,type,func){
                var callback = dom[m.hashCode(func)];
                dom.detachEvent("on" + (eventHook[type]||type), callback);
            },
            getText: (function(extraTag){
                extraTag.test = m.inject(extraTag).after("test",function(){
                    this.restore();
                });
                return function(dom){
                    if(extraTag.test(dom.nodeName)){
                        return dom.innerHTML;
                    }else{
                        var results = [];
                        m.each(dom.childNodes,function(){
                            results.push(this.nodeValue);
                        },function(){return this.nodeType===3&&!isEmptyExp.test(this.nodeValue)});
                        return results.join('');
                    }
                };
            })(/^(SCRIPT)$/ig)
        });
    }
    return Query;
})(mirror);