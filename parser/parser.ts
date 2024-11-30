import { Program, Statement, LetStatement, Identifier, ReturnStatement } from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Token, TokenKind } from "../token/token.ts";

export function New(lexer: Lexer): Parser {
    return new Parser(lexer);
}

export class Parser {
    l: Lexer;
    curToken: Token;
    peekToken: Token;
    errors: Array<string>;

    constructor(l: Lexer) {
        this.l = l;
        this.curToken = new Token("", "");
        this.peekToken = new Token("", "");
        this.errors = [];

        // Read two tokens, so curToken and peekToken are both set
        this.NextToken();
        this.NextToken();
    }

    NextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.l.NextToken();
    }

    ParseProgram(): Program {
        const program = new Program();
        program.statements = [];

        while (this.curToken.type != TokenKind.TERMINAL) {
            const stmt = this.ParseStatement();
            if (stmt != null) {
                program.statements.push(stmt);
            }
            this.NextToken();
        }

        return program;
    }

    ParseStatement(): Statement | null {
        switch (this.curToken.type) {
        case TokenKind.LET:
            return this.ParseLetStatement();
        case TokenKind.RETURN:
            return this.ParseReturnStatement();
        default:
            return null;
        }
    }

    ParseLetStatement(): LetStatement | null {
        const stmt = new LetStatement(this.curToken);

        if (!this.ExpectPeek(TokenKind.IDENT)) {
            return null;
        }

        stmt.name = new Identifier(this.curToken, this.curToken.literal);

        if (!this.ExpectPeek(TokenKind.ASSIGN)) {
            return null;
        }

        while (!this.CurTokenIs(TokenKind.SEMICOLON)) {
            this.NextToken();
        }

        return stmt;
    }

    ParseReturnStatement(): ReturnStatement | null {
        const stmt = new ReturnStatement(this.curToken);

        while (!this.CurTokenIs(TokenKind.SEMICOLON)) {
            this.NextToken();
        }

        return stmt;
    }

    CurTokenIs(t: TokenKind): boolean {
        return this.curToken.type == t;
    }

    PeekTokenIs(t: TokenKind): boolean {
        return this.peekToken.type == t;
    }

    ExpectPeek(t: TokenKind): boolean {
        if (this.PeekTokenIs(t)) {
            this.NextToken();
            return true;
        } else {
            this.PeekError(t);
            return false;
        }
    }

    Errors(): string[] {
        return this.errors;
    }

    PeekError(t: TokenKind) {
        const msg = `expected next token to be ${t}, got ${this.peekToken.type} instead`;
        this.errors.push(msg);
    }
}
