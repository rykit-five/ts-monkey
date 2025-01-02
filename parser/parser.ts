import {
    BlockStatement,
    BooleanLiteral,
    CallExpression,
    Expression,
    ExpressionStatement,
    FunctionLiteral,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
    StringLiteral,
} from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Token, TokenType } from "../token/token.ts";

type prefixParseFn = () => Expression | null;
type infixParseFn = (left: Expression | null) => Expression;

enum Precedence {
    LOWEST = 1,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL,
}

const precedences = new Map([
    [TokenType.EQ, Precedence.EQUALS],
    [TokenType.NOT_EQ, Precedence.EQUALS],
    [TokenType.LT, Precedence.LESSGREATER],
    [TokenType.GT, Precedence.LESSGREATER],
    [TokenType.PLUS, Precedence.SUM],
    [TokenType.MINUS, Precedence.SUM],
    [TokenType.SLASH, Precedence.PRODUCT],
    [TokenType.ASTERISK, Precedence.PRODUCT],
    [TokenType.LPAREN, Precedence.CALL],
]);

export function New(lexer: Lexer): Parser {
    const p = new Parser(lexer);

    // どちらでもよい
    // p.registerPrefix(TokenType.IDENT, () => p.parseIdentifier());
    p.registerPrefix(TokenType.IDENT, p.parseIdentifier.bind(p));
    p.registerPrefix(TokenType.INT, p.parseIntgerLiteral.bind(p));
    p.registerPrefix(TokenType.STRING, p.parseStringLiteral.bind(p));
    p.registerPrefix(TokenType.BANG, p.parsePrefixExpression.bind(p));
    p.registerPrefix(TokenType.MINUS, p.parsePrefixExpression.bind(p));
    p.registerPrefix(TokenType.TRUE, p.parseBooleanLiteral.bind(p));
    p.registerPrefix(TokenType.FALSE, p.parseBooleanLiteral.bind(p));
    p.registerPrefix(TokenType.LPAREN, p.parseGroupedExpression.bind(p));
    p.registerPrefix(TokenType.IF, p.parseIfExpression.bind(p));
    p.registerPrefix(TokenType.FUNCTION, p.parseFunctionLiteral.bind(p));

    p.registerInfix(TokenType.PLUS, p.parseInfixExpression.bind(p));
    p.registerInfix(TokenType.MINUS, p.parseInfixExpression.bind(p));
    p.registerInfix(TokenType.SLASH, p.parseInfixExpression.bind(p));
    p.registerInfix(TokenType.ASTERISK, p.parseInfixExpression.bind(p));
    p.registerInfix(TokenType.EQ, p.parseInfixExpression.bind(p));
    p.registerInfix(TokenType.NOT_EQ, p.parseInfixExpression.bind(p));
    p.registerInfix(TokenType.LT, p.parseInfixExpression.bind(p));
    p.registerInfix(TokenType.GT, p.parseInfixExpression.bind(p));
    p.registerInfix(TokenType.LPAREN, p.parseCallExpression.bind(p));

    return p;
}

export class Parser {
    l: Lexer;
    errors: string[];

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

        this.nextToken();

        stmt.value = this.parseExpression(Precedence.LOWEST);

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    parseReturnStatement(): ReturnStatement {
        const stmt = new ReturnStatement(this.curToken);

        this.nextToken();

        stmt.returnValue = this.parseExpression(Precedence.LOWEST);

        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    parseExpressionStatement(): ExpressionStatement {
        const stmt = new ExpressionStatement(this.curToken);

        stmt.expression = this.parseExpression(Precedence.LOWEST);

        // 5 + 4 のような式文を可能とするためにセミコロンは省略可能とする
        if (this.peekTokenIs(TokenType.SEMICOLON)) {
            this.nextToken();
        }

        return stmt;
    }

    parseBlockStatement(): BlockStatement {
        const block = new BlockStatement(this.curToken);

        this.nextToken();

        // TODO: !this.curTokenIs(TokenType.TERMINAL) -> !this.curTokenIs(TokenType.EOF)
        while (
            !this.curTokenIs(TokenType.RBRACE) &&
            !(this.curTokenIs(TokenType.EOF) ||
                this.curTokenIs(TokenType.TERMINAL))
        ) {
            const stmt = this.parseStatement();
            if (stmt != null) {
                block.statements.push(stmt);
            }
            this.nextToken();
        }

        return block;
    }

    parseExpression(precedence: Precedence): Expression | null {
        const prefix = this.prefixParseFns.get(this.curToken.type);
        if (prefix == undefined) {
            this.noPrefixParseFnError(this.curToken.type);
            return null;
        }
        let leftExp = prefix();

        while (
            !this.peekTokenIs(TokenType.SEMICOLON) &&
            precedence < this.peekPrecedence()
        ) {
            const infix = this.infixParseFns.get(this.peekToken.type);
            if (infix == undefined) {
                return null;
            }

            this.nextToken();

            leftExp = infix(leftExp);
        }

        return leftExp;
    }

    parseIdentifier(): Expression {
        return new Identifier(this.curToken, this.curToken.literal);
    }

    parseBooleanLiteral(): BooleanLiteral {
        return new BooleanLiteral(
            this.curToken,
            this.curTokenIs(TokenType.TRUE),
        );
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

    parseStringLiteral(): Expression {
        return new StringLiteral(this.curToken, this.curToken.literal);
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

    parseInfixExpression(left: Expression | null): Expression {
        const expression = new InfixExpression(
            this.curToken,
            this.curToken.literal,
            left,
        );

        const precedence = this.curPrecedence();
        this.nextToken();
        expression.right = this.parseExpression(precedence);

        return expression;
    }

    parseGroupedExpression(): Expression | null {
        this.nextToken();

        const exp = this.parseExpression(Precedence.LOWEST);
        if (!this.expectPeek(TokenType.RPAREN)) {
            return null;
        }
        return exp;
    }

    parseIfExpression(): IfExpression | null {
        const expression = new IfExpression(this.curToken);

        if (!this.expectPeek(TokenType.LPAREN)) {
            return null;
        }

        this.nextToken();
        expression.condition = this.parseExpression(Precedence.LOWEST);

        if (!this.expectPeek(TokenType.RPAREN)) {
            return null;
        }

        if (!this.expectPeek(TokenType.LBRACE)) {
            return null;
        }

        expression.consequence = this.parseBlockStatement();

        if (this.peekTokenIs(TokenType.ELSE)) {
            this.nextToken();

            if (!this.expectPeek(TokenType.LBRACE)) {
                return null;
            }

            expression.alternative = this.parseBlockStatement();
        } else {
            expression.alternative = null;
        }

        return expression;
    }

    parseFunctionLiteral(): FunctionLiteral | null {
        const lit = new FunctionLiteral(this.curToken);

        if (!this.expectPeek(TokenType.LPAREN)) {
            return null;
        }

        lit.parameters = this.parseFunctionParameters();

        if (!this.expectPeek(TokenType.LBRACE)) {
            return null;
        }

        lit.body = this.parseBlockStatement();

        return lit;
    }

    parseFunctionParameters(): Identifier[] | null {
        const identifiers: Identifier[] = [];

        if (this.peekTokenIs(TokenType.RPAREN)) {
            this.nextToken();
            return identifiers;
        }

        this.nextToken();

        const ident = new Identifier(this.curToken, this.curToken.literal);
        identifiers.push(ident);

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            const ident = new Identifier(this.curToken, this.curToken.literal);
            identifiers.push(ident);
        }

        if (!this.expectPeek(TokenType.RPAREN)) {
            return null;
        }

        return identifiers;
    }

    parseCallExpression(func: Expression | null): CallExpression {
        const exp = new CallExpression(this.curToken, func);
        exp.arguments = this.parseCallArguments();
        return exp;
    }

    parseCallArguments(): (Expression | null)[] | null {
        const args: (Expression | null)[] = [];

        if (this.peekTokenIs(TokenType.RPAREN)) {
            this.nextToken();
            return args;
        }

        this.nextToken();
        args.push(this.parseExpression(Precedence.LOWEST));

        while (this.peekTokenIs(TokenType.COMMA)) {
            this.nextToken();
            this.nextToken();
            args.push(this.parseExpression(Precedence.LOWEST));
        }

        if (!this.expectPeek(TokenType.RPAREN)) {
            return null;
        }

        return args;
    }

    curTokenIs(t: TokenType): boolean {
        return this.curToken.type == t;
    }

    peekTokenIs(t: TokenType): boolean {
        return this.peekToken.type == t;
    }

    curPrecedence(): Precedence {
        const p = precedences.get(this.curToken.type);
        if (p != undefined) {
            return p;
        }

        return Precedence.LOWEST;
    }

    peekPrecedence(): Precedence {
        const p = precedences.get(this.peekToken.type);
        if (p != undefined) {
            return p;
        }

        return Precedence.LOWEST;
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
