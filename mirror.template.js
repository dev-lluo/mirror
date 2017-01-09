/**
 * Created by shyy_work on 2016/12/16.
 */
(function (m) {
    var ESCAPE = {
            "n": "\n",
            "f": "\f",
            "r": "\r",
            "t": "\t",
            "v": "\v",
            "'": "'",
            '"': '"',
            "{": "{",
            "}": "}",
            "[": "[",
            "]": "]"
        },
        UNESCAPE = {
            "\r": "\\r",
            "\n": "\\n",
            '"': "\"",
            "'": "\'"
        },
        isEscapeChar = function (ch) {
            return '\\' === ch;
        },
        isBraceLChar = function (ch) {
            return '{' === ch;
        },
        isBraceRChar = function (ch) {
            return '}' === ch;
        },
        isBracketLChar = function (ch) {
            return '[' === ch;
        },
        isBracketRChar = function (ch) {
            return ']' === ch;
        },
        isParenthesisLChar = function (ch) {
            return '(' === ch;
        },
        isParenthesisRChar = function (ch) {
            return ')' === ch;
        },
        isCommaChar = function (ch) {
            return ',' === ch;
        },
        isDotChar = function (ch) {
            return '.' === ch;
        },
        baseOnImm = function (queue, type) {
            return queue[0].type === type;
        },
        baseOn = function (queue, type) {
            for (var i = queue.length - 1; i >= 0; i--) {
                if (queue[i].type === type) return true;
            }
            return false;
        },
        parser = {
            $root: function (tokenGroup) {
                var cv = [];
                m.each(tokenGroup, function () {
                    if (m.isOne(this, 'String')) {
                        cv.push('"' + this + '"');
                    } else {
                        cv.push('(' + parse(this) + ')(context)');
                    }
                });
                return 'function(context){ return ' + cv.join('+') + ';}';
            },
            $expr: function (tokenGroup) {
                var cv = [];
                cv.push(
                    'function(context){',
                    'var data=context;'
                );
                m.each(tokenGroup, function () {
                    if (m.isOne(this, 'String')) {
                        cv.push('data=data["' + this + '"];');
                    } else if (this.type === '$invoke') {
                        cv.push('data=data(' + parse(this) + ');');
                    } else {
                        cv.push('data=data[(' + parse(this) + ')(context)];');
                    }
                });
                cv.push(
                    'return data;',
                    '}'
                );
                return cv.join('');
            },
            $invoke: function (tokenGroup) {
                var cv = [];
                m.each(tokenGroup, function () {
                    if (m.isOne(this, 'String')) {
                        cv.push(this);
                    } else {
                        cv.push('(' + parse(this) + ')(context)');
                    }
                });
                return cv.join(',');
            }
        },
        parse = function (tokenGroup) {
            return parser[tokenGroup.type](tokenGroup);
        },
        complie = function (text) {
            var lexer = new Lexer(text);
            var tokenGroup = lexer.lex().getTokenGroup();
            var code = parse(tokenGroup);
            return Function('return ' + code)();
        };

    function Lexer(text) {
        m.assertDefined(text);
        this.text = text;
        this.index = 0;
        this.cache = [];
        this.queue = [new TokenGroup('$root')];
        this.lexed = false;
    }

    Lexer.prototype.peek = function (i) {
        i = i || 0;
        return ((i = this.index + i) < this.text.length) ? this.text.charAt(i) : false;
    }
    Lexer.prototype.roll = function (i) {
        i = i || 1;
        return this.index = this.index + i;
    }
    Lexer.prototype.branch = function (type) {
        this.trySnatch();
        var tokenGroup = new TokenGroup(type);
        this.queue[0].push(tokenGroup);
        this.queue.unshift(tokenGroup);
    }
    Lexer.prototype.base = function (type) {
        this.trySnatch();
        var tokenGroup = this.queue.shift();
        if (tokenGroup.type !== type) {
            throw 'lexer error';
        }
    }
    Lexer.prototype.baseOn = function (type, imm) {
        return imm ? baseOnImm(this.queue, type) : baseOn(this.queue, type);
    }
    Lexer.prototype.clear = function () {
        if (!this.cache.length)throw 'lexer error';
        try {
            return this.cache.join("");
        } finally {
            this.cache.length = 0;
        }
    }
    Lexer.prototype.snatch = function () {
        this.queue[0].push(this.clear());
    }
    Lexer.prototype.trySnatch = function () {
        if (this.cache.length) {
            this.snatch();
        }
    }
    Lexer.prototype.lex = function () {
        if (this.lexed) return this;
        var ch, needEscape;
        while ((ch = this.peek()) !== false) {
            if (needEscape) {
                needEscape = false;
                if (ESCAPE[ch]) {
                    this.cache.push(ESCAPE[ch]);
                } else {
                    this.cache.push('\\', ch);
                }
                this.roll();
            } else {
                if (isEscapeChar(ch)) {
                    needEscape = true;
                    this.roll();
                } else if (isBraceLChar(ch)) {
                    ch = this.peek(1);
                    if (isBraceLChar(ch)) {
                        this.branch('$expr');
                        this.roll(2);
                    } else {
                        throw 'unsupported'
                    }
                } else if (isBraceRChar(ch)) {
                    ch = this.peek(1);
                    if (isBraceRChar(ch)) {
                        this.base('$expr');
                        this.roll(2);
                    } else {
                        throw 'unsupported'
                    }
                } else {
                    if (this.baseOn('$expr')) {
                        if (isDotChar(ch)) {
                            this.snatch();
                        } else if (isBracketLChar(ch)) {
                            this.branch('$root');
                        } else if (isBracketRChar(ch)) {
                            this.base('$root');
                        } else if (isParenthesisLChar(ch)) {
                            this.branch('$invoke')
                        } else if (isParenthesisRChar(ch)) {
                            this.base('$invoke');
                        } else if (isCommaChar(ch) && this.baseOn('$invoke', true)) {
                            this.trySnatch();
                        } else {
                            this.cache.push(ch);
                        }
                    } else {
                        this.cache.push(UNESCAPE[ch] || ch);
                    }
                    this.roll();
                }
            }
        }
        this.trySnatch();
        this.lexed = true;
        return this;
    }
    Lexer.prototype.getTokenGroup = function () {
        if (this.queue.length !== 1 && !this.base('$root', true)) {
            throw 'lexer error';
        }
        return this.queue[0];
    }
    function TokenGroup(type) {
        this.type = type;
    }

    TokenGroup.prototype = [];

    var d = m.using("mirror.dom"),
        template = {},
        attrHook = {
            '*': ['id', 'class', 'style', 'title', 'accesskey', 'dir', 'lang', 'tabindex'],
            'a': ['href', 'target'],
            'img': ['src', 'width', 'height', 'alt', 'border'],
            'table': ['width', 'border', 'cellpadding', 'cellspacing'],
            'thead': ['align', 'char', 'charoff', 'valign'],
            'tbody': ['align', 'char', 'charoff', 'valign'],
            'tfoot': ['align', 'char', 'charoff', 'valign'],
            'tr': ['align', 'char', 'charoff', 'valign'],
            'td': ['abbr', 'align', 'axis', 'char', 'charoff', 'colspan', 'headers', 'rowspan', 'scope', 'valign'],
            'th': ['abbr', 'align', 'axis', 'char', 'charoff', 'colspan', 'headers', 'rowspan', 'scope', 'valign'],
            'form': ['action', 'name', 'target', 'method', 'enctype'],
            'label': ['for'],
            'input': ['type', 'name', 'value', 'checked', 'disabled', 'src']
        },
        actionHook = [
            '$$each',
            '$$var',
            '$$grant'
        ],
        $textNode = '#text';

    function analyzeNode(node) {
        var vd = new VDom(node);
        if ($textNode.includes(vd.name)) {
            vd.initd.push({
                name: 'text',
                expr: complie(d.getText(node))
            });
        } else {
            m.each(attrHook['*'], function () {
                if (d.hasAttr(node, this)) {
                    vd.initd.push({
                        name: vd.name,
                        expr: complie(d.getAttr(node, this))
                    });
                }
            });
            if (attrHook[vd.name]) {
                m.each(attrHook[vd.name], function () {
                    if (d.hasAttr(node, this)) {
                        vd.initd.push({
                            name: vd.name,
                            expr: complie(d.getAttr(node, this))
                        });
                    }
                });
            }
            m.each(d.getChild(node, true), function () {
                vd.push(analyzeNode(this));
            });
        }
        return vd;
    }

    function VDom(node) {
        this.node = node;
        this.name = node.nodeName;
        this.initd = [];

    }

    VDom.prototype = [];
    VDom.prototype.dataBinding = function (data) {
        var realNode = d.cloneNode(this.node);
        m.each(this.initd, function () {
            d.setAttr(realNode, this.name, this.expr(data));
        });
        m.each(this, function () {
            d.append(realNode, this.dataBinding(data));
        });
        return realNode;
    }
    function Template(model, parent) {
        this.model = model;
        this.parent = parent;
        this.initd = false;
    }

    Template.prototype = [];
    Template.prototype.init = function () {
        var dom = d.valueOf(this.model)
            , container = this;
        dom.each(function () {
            container.push(analyzeNode(this));
        });
        this.initd = true;
    };
    Template.prototype.renderTo = function (selector, data) {
        if (!this.initd) {
            this.init();
        }
        var parent, child;
        m.each(this, function () {
            child = this.dataBinding(data);
            d.dom(selector).each(function () {
                parent = this;
                d.append(parent, child);
            });
        })
    };
    d.dom("script[type='text/template']").each(function () {
        var id = d.getAttr(this, "id");
        m.assertDefined(id);
        template[id] = new Template(m.trim(d.getText(this)));
    });
    return template;
})(mirror);