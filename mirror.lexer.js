/**
 * Created by shyy_work on 2016/12/26.
 */
;(function(m){
    var ESCAPE = {"n":"\n", "f":"\f", "r":"\r", "t":"\t", "v":"\v", "'":"'", '"':'"'},
        lowercase = function(data){
            return String(data).toLowerCase();
        };
    /**
     * {{name}}
     * {{object.name}}
     * {{object[name]}}
     * {{object[{{name}}]}}
     * {{(arg0,arg1...)->func}}
     * */
    function Lexer(text) {
        m.assertDefined(text);
        this.text = text;
        this.index = 0;
        this.tokens = [];
    }
    m.extend(Lexer.prototype,{
        peek: function(i) {
            var num = i || 0;
            return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
        },
        roll: function () {
            return this.index++;
        },
        lex: function() {
            var ch;
            while(this.length<this.text.length){
                ch = this.peek();
                if(ch==='{'){

                }
            }
            return this.tokens;
        }
    });
})(mirror);