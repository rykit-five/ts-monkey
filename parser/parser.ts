import {
    Expression,
    ExpressionStatement,
    Identifier,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
} from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Token, TokenType } from "../token/token.ts";

type prefixParseFn = () => Expression;
type infixParseFn = () => Expression;

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
    p.registerPrefix(TokenType.IDENT, p.parseIdentifier.bind(p));
    // p.registerPrefix(TokenType.IDENT, () => p.parseIdentifier());
    p.registerPrefix(TokenType.INT, p.parseIntgerLiteral.bind(p));
    p.registerPrefix(TokenType.BANG, p.parsePrefixExpression.bind(p));
    p.registerPrefix(TokenType.MINUS, p.parsePrefixExpression.bind(p));

    return p;
}

export class Parser {
    l: Lexer;
    errors: Array<string>;

    curToken: Token;
    peekToken: Token;

    prefixParseFns: Map<TokenType, prefixParseFn>;
    infixParseFns: Map<TokenType, infixParseFn>;

    constructor(l: Lexer) {
        this.l = l;
        this.errors = [];

        this.curToken = new Token(TokenType.EOF, "");
        this.peekToken = new Token(TokenType.EOF, "");

        this.prefixParseFns = new Map<TokenType, prefixParseFn>();
        this.infixParseFns = new Map<TokenType, infixParseFn>();

        // Read two tokens, so curToken and peekToken are both set
        this.nextToken();
        this.nextToken();
    }

    nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.l.NextToken();
    }

    parseProgram(): Program {
        const program = new Program();

        while (this.curToken.type != TokenType.TERMINAL) {
            const stmt = this.parseStatement();
            if (stmt != null) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }

        return program;
    }

    parseStatement(): Statement | null {
        switch (this.curToken.type) {
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.RETURN:
                return this.parseReturnStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    parseLetStatement(): LetStatement | null {
        const stmt = new LetStatement(this.curToken);

        if (!this.expectPeek(TokenType.IDENT)) {
            return null;
        }

        stmt.name = new Identifier(this.curToken, this.curToken.literal);

        if (!this.expectPeek(TokenType.ASSIGN)) {
            return null;
        }

        while (!this.curTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    parseReturnStatement(): ReturnStatement | null {
        const stmt = new ReturnStatement(this.curToken);

        while (!this.curTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    parseExpressionStatement(): ExpressionStatement | null {
        const stmt = new ExpressionStatement(this.curToken);

        stmt.expression = this.parseExpression(Precedence.LOWEST);

        // 5 + 4 のような式文を可能とするためにセミコロンは省略可能とする
        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    parseExpression(prec: Precedence): Expression | null {
        const prefix = this.prefixParseFns.get(this.curToken.type);
        if (prefix == undefined) {
            this.noPrefixParseFnError(this.curToken.type);
            return null;
        }
        const leftExp = prefix();

        return leftExp;
    }

    parseIdentifier(): Expression {
        return new Identifier(this.curToken, this.curToken.literal);
    }

    parseIntgerLiteral(): Expression {
        const lit = new IntegerLiteral(this.curToken);

        const value = parseInt(this.curToken.literal);
        if (Number.isNaN(value)) {
            const msg = `could not parse ${this.curToken.literal} as integer`;
            this.errors.push(msg);
        }

        lit.value = value;

        return lit;
    }

    parsePrefixExpression(): Expression {
        const expression = new PrefixExpression(
            this.curToken,
            this.curToken.literal,
        );

        this.nextToken();

        expression.right = this.parseExpression(Precedence.PREFIX);

        return expression;
    }

    curTokenIs(t: TokenType): boolean {
        return this.curToken.type == t;
    }

    peekTokenIs(t: TokenType): boolean {
        return this.peekToken.type == t;
    }

    expectPeek(t: TokenType): boolean {
        if (this.peekTokenIs(t)) {
            this.nextToken();
            return true;
        } else {
            this.peekError(t);
            return false;
        }
    }

    Errors(): string[] {
        return this.errors;
    }

    peekError(t: TokenType) {
        const msg =
            `expected next token to be ${t}, got ${this.peekToken.type} instead`;
        this.errors.push(msg);
    }

    noPrefixParseFnError(t: TokenType) {
        const msg = `no prefix parse function for ${t} found`;
        this.errors.push(msg);
    }

    registerPrefix(tokenType: TokenType, fn: prefixParseFn) {
        this.prefixParseFns.set(tokenType, fn);
    }

    registerInfix(tokenType: TokenType, fn: infixParseFn) {
        this.infixParseFns.set(tokenType, fn);
    }
}
