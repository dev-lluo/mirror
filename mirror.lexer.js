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
        snatch: function (i) {
            if(this.tokens.state===1){
                this.tokens.push(this.text.substring(this.tokens.cursor,this.index));
                this.tokens.state = 2;
            }
            this.roll(i);
            this.tokens.cursor = this.index;
        },
        trySnatch: function (i) {
            if(this.tokens.state===1){
                this.tokens.push(this.text.substring(this.tokens.cursor,this.index));
                this.tokens.state = 2;
            }
            if(this.tokens.type==='$load'){
                this.base();
            }
            this.roll(i);
            this.tokens.cursor = this.index;
        },
        lex: function () {
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
                }else if('}'==ch){
                    debugger;
                    ch = this.peek(1);
                    if(ch==='}'){
                        this.trySnatch(2);
                        this.base();
                    }
                }else if(ch==='('){
                    this.roll();
                    this.branch("$push");
                    continue;
                }else if(')'===ch){
                    this.trySnatch();
                    this.base();
                    continue;
                }else{
                    if(this.tokens.type!=='$load'){
                        this.branch("$load");
                    }
                    if(this.tokens.state === 0){
                       throw 'error state';
                    }else if(this.tokens.state===2||!this.tokens.state){
                        this.tokens.state = 0;
                    }
                    if('[].,'.includes(ch)){
                        this.snatch();
                    }else{
                        this.roll();
                        this.tokens.state = 1;
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