import { Token, TokenList, TokenType } from "./token.ts";


export class Lexer {
    input: string;
    position: number;
    readPosition: number;
    ch: string;

    constructor(input: string) {
        this.input = input;
        this.readChar();
    }

    nextToken(): Token {
        let tok: Token;

        this.skipWhitespace();

        switch (this.ch) {
            case '+':
                tok = new Token(TokenList.PLUS, this.ch);
                break;
        
            default:
                if (isLetter(this.ch)) {
                    const type_ = TokenList.FUNCTION;
                    const literal = this.readIdentifier();
                    tok = new Token(type_, literal);
                } else if (isDigit(this.ch)) {
                    const type_ = TokenList.INT;
                    const literal = this.readNumber();
                    tok = new Token(type_, literal);
                } else {
                    tok = new Token(TokenList.ILLEGAL, this.ch);
                }
                break;
        }
        
        this.readChar();
        return tok;
    }

    skipWhitespace() {
        while (this.ch in [' ', '\t', '\n', '\r']) {
            this.readChar();
        }
    }

    readChar() {
        if (this.readPosition >= this.input.length) {
            this.ch = '';
        } else {
            this.ch = this.input[this.readPosition];
        }
        this.position = this.readPosition;
        this.readPosition++;
    }

    peekChar(): string {
        if (this.readPosition >= this.input.length) {
            return '';
        } else {
            return this.input[this.readPosition];
        }
    }

    readIdentifier(): string {
        const position = this.position;
        while (isLetter(this.ch)) {
            this.readChar();
        }
        return this.input.slice(position, this.position);
    }

    readNumber(): string {
        const position = this.position;
        while (isDigit(this.ch)) {
            this.readChar();
        }
        return this.input.slice(position, this.position);
    }
}

function isLetter(ch: string): boolean {
    return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_';
}

function isDigit(ch: string): boolean {
    return '0' <= ch && ch <= '9';
}

function newToken(tokenType: TokenType, ch: string): Token {
    return new Token(tokenType, ch);
}
