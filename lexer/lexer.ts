import { Token, TokenKind, TokenType, LookupIdent } from "../token/token.ts";

export function New(input: string): Lexer {
    const l = new Lexer(input);
    l.ReadChar();
    return l;
}


export class Lexer {
    input: string = "";
    position: number = 0;
    readPosition: number = 0;
    ch: string = "";

    constructor(input: string) {
        this.input = input;
        this.ReadChar();
    }

    NextToken(): Token {
        let tok: Token;

        this.SkipWhitespace();

        switch (this.ch) {
        case '=':
            if (this.PeekChar() == '=') {
                tok = new Token(TokenKind.EQ, this.MakeTwoCharToken());
            } else {
                tok = new Token(TokenKind.ASSIGN, this.ch);
            }
            break;
        case '+':
            tok = new Token(TokenKind.PLUS, this.ch);
            break;
        case '-':
            tok = new Token(TokenKind.MINUS, this.ch);
            break;
        case '!':
            if (this.PeekChar() == '=') {
                tok = new Token(TokenKind.NOT_EQ, this.MakeTwoCharToken());
            } else {
                tok = new Token(TokenKind.BANG, this.ch);
            }
            break;
        case '/':
            tok = new Token(TokenKind.SLASH, this.ch);
            break;
        case '\\':
            if (this.PeekChar() == '0') {
                tok = new Token(TokenKind.TERMINAL, this.MakeTwoCharToken());
            } else {
                tok = new Token(TokenKind.BACKSLASH, this.ch);
            }
            break;
        case '*':
            tok = new Token(TokenKind.ASTERISK, this.ch);
            break;
        case '<':
            tok = new Token(TokenKind.LT, this.ch);
            break;
        case '>':
            tok = new Token(TokenKind.GT, this.ch);
            break;
        case ';':
            tok = new Token(TokenKind.SEMICOLON, this.ch);
            break;
        case ':':
            tok = new Token(TokenKind.COLON, this.ch);
            break;
        case ',':
            tok = new Token(TokenKind.COMMA, this.ch);
            break;
        case '{':
            tok = new Token(TokenKind.LBRACE, this.ch);
            break;
        case '}':
            tok = new Token(TokenKind.RBRACE, this.ch);
            break;
        case '(':
            tok = new Token(TokenKind.LPAREN, this.ch);
            break;
        case ')':
            tok = new Token(TokenKind.RPAREN, this.ch);
            break;
        case '"':
            tok = new Token(TokenKind.STRING, this.ReadString());
            break;
        case '[':
            tok = new Token(TokenKind.LBRACKET, this.ch);
            break;
        case ']':
            tok = new Token(TokenKind.RBRACKET, this.ch);
            break;
        case '0':
            tok = new Token(TokenKind.EOF, "");
            break;
        default:
            if (IsLetter(this.ch)) {
                const literal = this.ReadIdentifier();
                const type = LookupIdent(literal);
                tok = new Token(type, literal);
                return tok;
            } else if (IsDigit(this.ch)) {
                const type = TokenKind.INT;
                const literal = this.ReadNumber();
                tok = new Token(type, literal);
                return tok;
            } else {
                tok = new Token(TokenKind.ILLEGAL, this.ch);
            }
            break;
        }
        
        this.ReadChar();
        return tok;
    }

    SkipWhitespace() {
        const whitespace = /[\s\t\n\r]/;
        while (this.ch.match(whitespace) != null) {
            this.ReadChar();
        }
    }

    ReadChar() {
        if (this.readPosition >= this.input.length) {
            this.ch = '';
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition++;
    }

    PeekChar(): string {
        if (this.readPosition >= this.input.length) {
            return '';
        } else {
            return this.input[this.readPosition];
        }
    }
    
    MakeTwoCharToken(): string {
        const ch = this.ch;
        this.ReadChar();
        return ch + this.ch;
    }

    ReadIdentifier(): string {
        const position = this.position;
        while (IsLetter(this.ch)) {
            this.ReadChar();
        }
        return this.input.slice(position, this.position);
    }

    ReadNumber(): string {
        const position = this.position;
        while (IsDigit(this.ch)) {
            this.ReadChar();
        }
        return this.input.slice(position, this.position);
    }

    ReadString(): string {
        const position = this.position + 1;
        const regex = /[\"0]/;
        while (true) {
            this.ReadChar();
            if (this.ch.match(regex) != null) {
                break;
            }
        }
        return this.input.slice(position, this.position);
    }
}

function IsLetter(ch: string): boolean {
    return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_';
}

function IsDigit(ch: string): boolean {
    return '0' <= ch && ch <= '9';
}

function NewToken(tokenType: TokenType, ch: string): Token {
    return new Token(tokenType, ch);
}
