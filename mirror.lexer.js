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
     * {{func<-(arg0,arg1...)}}
     * */
    function Lexer(text) {
        m.assertDefined(text);
        this.raw = text;
        this.index = 0;
        this.tokens = [];
    }
    m.extend(Lexer.prototype,{
        is: function (ch,chars) {
            return chars.indexOf(ch) !== -1;
        },
        peek: function(i) {
            var num = i || 1;
            return (this.index + num < this.text.length) ? this.text.charAt(this.index + num) : false;
        },
        isNumber: function(ch) {
            return ('0' <= ch && ch <= '9') && typeof ch === "string";
        },
        lex: function() {
            var ch;
            while(this.length<this.text.length){
                ch = this.text.charAt(this.index);
                if(ch==="'"||ch==='"'){
                    this.readString(ch);
                }else if ( ch === '.' && this.isNumber(this.peek())){
                    this.readNumber();
                }else if (this.isWhitespace(ch)) {
                    this.index++;
                }else {

                }
            }
            return this.tokens;
        },
        readString: function(quote) {
            var start = this.index;
            this.index++;
            var string = '';
            var rawString = quote;
            var escape = false;
            while (this.index < this.text.length) {
                var ch = this.text.charAt(this.index);
                rawString += ch;
                if (escape) {
                    if (ch === 'u') {
                        var hex = this.text.substring(this.index + 1, this.index + 5);
                        if (!hex.match(/[\da-f]{4}/i)) {
                            this.throwError('Invalid unicode escape [\\u' + hex + ']');
                        }
                        this.index += 4;
                        string += String.fromCharCode(parseInt(hex, 16));
                    } else {
                        var rep = ESCAPE[ch];
                        string = string + (rep || ch);
                    }
                    escape = false;
                } else if (ch === '\\') {
                    escape = true;
                } else if (ch === quote) {
                    this.index++;
                    this.tokens.push({
                        index: start,
                        text: rawString,
                        constant: true,
                        value: string
                    });
                    return;
                } else {
                    string += ch;
                }
                this.index++;
            }
            this.throwError('Unterminated quote', start);
        },
        readNumber: function() {
            var number = '';
            var start = this.index;
            while (this.index < this.text.length) {
                var ch = lowercase(this.text.charAt(this.index));
                if (ch === '.' || this.isNumber(ch)) {
                    number += ch;
                } else {
                    var peekCh = this.peek();
                    if (ch === 'e' && this.isExpOperator(peekCh)) {
                        number += ch;
                    } else if (this.isExpOperator(ch) &&
                        peekCh && this.isNumber(peekCh) &&
                        number.charAt(number.length - 1) === 'e') {
                        number += ch;
                    } else if (this.isExpOperator(ch) &&
                        (!peekCh || !this.isNumber(peekCh)) &&
                        number.charAt(number.length - 1) === 'e') {
                        this.throwError('Invalid exponent');
                    } else {
                        break;
                    }
                }
                this.index++;
            }
            this.tokens.push({
                index: start,
                text: number,
                constant: true,
                value: Number(number)
            });
        },
        throwError: function(error, start, end) {
            end = end || this.index;
            var colStr = (m.isDefined(start)
                ? 's ' + start +  '-' + this.index + ' [' + this.text.substring(start, end) + ']'
                : ' ' + end);
            throw 'Lexer Error: '+error+' at column'+colStr+' in expression ['+this.text+'].';
        },
    });
})(mirror);