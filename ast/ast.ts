import { Token } from "../token/token.ts";

export interface Node {
    TokenLiteral(): string;
    String(): string;
}

export interface Statement extends Node {
    StatementNode(): void;
}

export interface Expression extends Node {
    ExpressionNode(): void;
}

export interface Program {
    statements: Array<Statement>;
}

export class Program implements Program {
    TokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].TokenLiteral();
        } else {
            return "";
        }
    }
}

export interface LetStatement extends Statement {
    token: Token;
    name: Identifier;
    value: Expression;
}

export class LetStatement implements LetStatement {
    constructor(token: Token) {
        this.token = token;
    }

    StatementNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        return "";
    }
}

export interface ReturnStatement extends Statement {
    token: Token;
    returnValue: Expression;
}

export class ReturnStatement implements ReturnStatement {
    constructor(token: Token) {
        this.token = token;
    }

    StatementNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        return "";
    }
}

export class Identifier {
    token: Token;
    value: string;

    constructor(token: Token, value: string) {
        this.token = token;
        this.value = value;
    }

    ExpressionNode() {}

    TokenLiteral(): string {
        return this.token.literal;
    }
}

export class ExpressionStatement {
    token: Token;
    expression: Expression;

    constructor(token: Token, expression: Expression) {
        this.token = token;
        this.expression = expression;
    }

    StatementNode() {}

    TokenLiteral(): string {
        return this.token.literal;
    }
}
