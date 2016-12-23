/**
 * Created by shyy_work on 2016/12/16.
 */
(function(m){
    function VDom(){

    }
    VDom.prototype = [];
    VDom.prototype.each = function (func) {

    }
    function Template(model,parent){
        this.model = model;
        this.parent = parent;
        this.initd = false;
    }
    Template.prototype.init = function () {
        var model = d.valueOf(this.model);
    };
    Template.prototype.renderTo = function (selector, data) {
        if(!this.initd){
            this.init();
        }
        var parent,child;
        this.model.each(function(){
            child = this;
            d.dom(selector).each(function () {
                parent = this;
                d.append(parent,child);
            });
        })
    };
    var d = m.using("mirror.dom"),
        template = {};
    d.dom("script[type='text/template']").each(function () {
        var id = d.getAttr(this,"id");
        m.assertDefined(id);
        template[id] = new Template(d.getText(this));
    });
    return template;
})(mirror);