/**
 * Created by devll on 2016/12/7.
 */
;(function(m){
    var config = {
        beforeSend:function(){
            console.log(arguments);
            return true;
        }
    };
    m.extend({
        ajaxSetup:function(cfg){
            config = m.extend(config,cfg);
        },
        ajax:function(config){

        }
    });
})(window.mirror);