import {
    Expression,
    ExpressionStatement,
    Identifier,
    LetStatement,
    Program,
    ReturnStatement,
    Statement,
} from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Token, TokenKind } from "../token/token.ts";

type PrefixParseFn = () => Expression;
type InfixParseFn = () => Expression;

enum Precedence {
    LOWEST = 1,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL,
}

export function New(lexer: Lexer): Parser {
    const p = new Parser(lexer);

    // どちらでもよい
    // p.prefixParseFns.set(TokenKind.IDENT, p.ParseIdentifier.bind(p));
    p.prefixParseFns.set(TokenKind.IDENT, () => p.ParseIdentifier());

    return p;
}

export class Parser {
    l: Lexer;
    errors: Array<string>;

    curToken: Token;
    peekToken: Token;

    prefixParseFns: Map<TokenKind, PrefixParseFn>;
    infixParseFns: Map<TokenKind, InfixParseFn>;

    constructor(l: Lexer) {
        this.l = l;
        this.errors = [];

        this.curToken = new Token("", "");
        this.peekToken = new Token("", "");

        this.prefixParseFns = new Map<TokenKind, PrefixParseFn>();
        this.infixParseFns = new Map<TokenKind, InfixParseFn>();

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
                return this.ParseExpressionStatement();
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

    ParseExpressionStatement(): ExpressionStatement | null {
        const stmt = new ExpressionStatement(this.curToken);

        stmt.expression = this.ParseExpression(Precedence.LOWEST);

        // 5 + 4 のような式文を可能とするためにセミコロンは省略可能とする
        if (this.PeekTokenIs(TokenKind.SEMICOLON)) {
            this.NextToken();
        }

        return stmt;
    }

    ParseExpression(prec: Precedence): Expression | null {
        let prefix: PrefixParseFn | undefined = undefined;
        if (prec == Precedence.LOWEST) {
            prefix = this.prefixParseFns.get(this.curToken.type);
        }
        if (prefix == undefined) {
            return null;
        }
        const leftExp = prefix();

        return leftExp;
    }

    ParseIdentifier(): Expression {
        return new Identifier(this.curToken, this.curToken.literal);
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
        const msg =
            `expected next token to be ${t}, got ${this.peekToken.type} instead`;
        this.errors.push(msg);
    }
}
