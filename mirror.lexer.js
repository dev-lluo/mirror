/**
 * Created by shyy_work on 2016/12/26.
 */
;(function (m) {
    var ESCAPE = {"n": "\n", "f": "\f", "r": "\r", "t": "\t", "v": "\v", "'": "'", '"': '"'},
        lowercase = function (data) {
            return String(data).toLowerCase();
        };

    function Token(type,parent){
        this.type = type;
        this.parent = parent;
    }
    Token.prototype = [];
    /**
     * {{name}}
     * {{[name]}}
     * {{object.name}}
     * {{object[name]}}
     * {{object[{{name}}]}}
     * {{(arg0,arg1...)->func}}
     * */
    function Lexer(text) {
        m.assertDefined(text);
        this.text = text;
        this.index = 0;
        this.tokens = new Token("$root");
    }

    m.extend(Lexer.prototype, {
        peek: function (i) {
            var num = i || 0;
            return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
        },
        roll: function (i) {
            var num = i || 1;
            return this.index = this.index + i;
        },
        branch: function (type) {
            var branch = new Token(type,this.tokens);
            return this.tokens = branch;
        },
        base: function () {
            return this.tokens = this.tokens.parent;
        },
        lex: function () {
            var ch = this.peek();
            while(this.index<this.text.length){
                if(ch==='{'){
                    ch = this.peek(1);
                    if(ch==='{'){
                        this.tokens.branch("$expr");
                        this.roll(2);
                        continue;
                    }else{
                        throw 'error expr : '+this.text;
                    }
                }else if(ch==='['){
                    this.tokens.branch("$load");
                    this.roll();
                    continue;
                }else if(ch==='('){
                    this.tokens.branch("$push");
                    this.roll();
                    continue;
                }else {

                }
            }
        }
    });
    return {
        lex: function (text) {
            return new Lexer(text).lex();
        }
    };
})(mirror);