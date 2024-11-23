import { Program } from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Token, TokenKind } from "../token/token.ts";

export function New(lexer: Lexer): Parser {
    return new Parser(lexer);
}

export class Parser {
    l: Lexer;
    curToken: Token;
    peekToken: Token;

    constructor(l: Lexer) {
        this.l = l;
        this.curToken = new Token("", "");
        this.peekToken = new Token("", "");

        // Read two tokens, so curToken and peekToken are both set
        this.NextToken();
        this.NextToken();
    }

    NextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.l.NextToken();
    }

    ParseProgram(): Program {
        return new Program();
    }
}
