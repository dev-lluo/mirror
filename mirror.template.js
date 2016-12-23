/**
 * Created by shyy_work on 2016/12/16.
 */
(function(m){
    var d = m.using("mirror.dom"),
        template = {};
    function analyzeNode(node) {
        var vd = new VDom(node);
        m.each(d.getChild(node,true),function () {
            vd.push(analyzeNode(this));
        });
        return vd;
    }
    function VDom(node){
        this.node = node;
    }
    VDom.prototype = [];
    VDom.prototype.dataBinding = function (data) {
        var realNode = d.cloneNode(this.node);
        m.each(this,function () {
            d.append(realNode,this.dataBinding(data));
        });
        return realNode;
    }
    function Template(model,parent){
        this.model = model;
        this.parent = parent;
        this.initd = false;
    }
    Template.prototype = [];
    Template.prototype.init = function () {
        var dom = d.valueOf(this.model)
            ,container = this;
        dom.each(function () {
            container.push(analyzeNode(this));
        });
        this.initd = true;
    };
    Template.prototype.renderTo = function (selector, data) {
        if(!this.initd){
            this.init();
        }
        var parent,child;
        m.each(this,function () {
            child = this.dataBinding(data);
            d.dom(selector).each(function () {
                parent = this;
                d.append(parent,child);
            });
        })
    };
    d.dom("script[type='text/template']").each(function () {
        var id = d.getAttr(this,"id");
        m.assertDefined(id);
        template[id] = new Template(m.trim(d.getText(this)));
    });
    return template;
})(mirror);