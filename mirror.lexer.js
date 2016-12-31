/**
 * Created by shyy_work on 2016/12/26.
 */
;(function (m) {
    var ESCAPE = {"n": "\n", "f": "\f", "r": "\r", "t": "\t", "v": "\v", "'": "'", '"': '"'},
        lowercase = function (data) {
            return String(data).toLowerCase();
        };

    function Token(type,cursor,parent){
        this.type = type;
        this.cursor = cursor;
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
        this.tokens = new Token("$root",0);
    }

    m.extend(Lexer.prototype, {
        peek: function (i) {
            var num = i || 0;
            return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
        },
        roll: function (i) {
            var num = i || 1;
            return this.index = this.index + num;
        },
        branch: function (type) {
            var branch = new Token(type,this.index,this.tokens);
            branch.parent.push(branch);
            return this.tokens = branch;
        },
        base: function () {
            return this.tokens = this.tokens.parent;
        },
        lex: function () {
            debugger;
            var ch;
            while(ch = this.peek()){
                if(ch==='{'){
                    ch = this.peek(1);
                    if(ch==='{'){
                        this.roll(2);
                        this.branch("$expr");
                        continue;
                    }else{
                        throw 'error expr : '+this.text;
                    }
                }else if(ch==='['){
                    this.roll();
                    this.branch("$load");
                    continue;
                }else if(ch==='('){
                    this.roll();
                    this.branch("$push");
                    continue;
                }else {
                    if('])'.includes(ch)){
                        this.tokens.push(this.text.substring(this.tokens.cursor,this.index));
                        this.base();
                        this.roll();
                        continue;
                    }else if('}'==ch){
                        ch = this.peek(1);
                        if(ch==='}'){
                            this.tokens.push(this.text.substring(this.tokens.cursor,this.index));
                            this.roll(2);
                            this.base();
                            continue;
                        }
                    }else{
                        this.roll();
                        continue;
                    }
                }
            }
            return this.tokens;
        }
    });
    return {
        lex: function (text) {
            return new Lexer(text).lex();
        }
    };
})(mirror);