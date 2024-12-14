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
    constructor() {
        this.statements = [];
    }

    TokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].TokenLiteral();
        } else {
            return "";
        }
    }

    String(): string {
        const out: Array<string> = [];

        for (let i = 0; i < this.statements.length; i++) {
            out.push(this.statements[i].String());
        }

        return out.join("");
    }
}

export interface LetStatement extends Statement {
    token: Token;
    name: Identifier;
    value: Expression | null;
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
        const out: Array<string> = [];

        out.push(this.TokenLiteral() + " ");
        out.push(this.name.String());
        out.push(" = ");

        if (this.value != null) {
            out.push(this.value.String());
        }

        out.push(";");

        return out.join("");
    }
}

export interface ReturnStatement extends Statement {
    token: Token;
    returnValue: Expression | null;
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
        const out: Array<string> = [];

        out.push(this.TokenLiteral() + " ");

        if (this.returnValue != null) {
            out.push(this.returnValue.String());
        }

        out.push(";");

        return out.join("");
    }
}

export interface ExpressionStatement extends Statement {
    token: Token;
    expression: Expression | null;
}

export class ExpressionStatement implements ExpressionStatement {
    constructor(token: Token) {
        this.token = token;
    }

    StatementNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        if (this.expression != null) {
            return this.expression.String();
        }
        return "";
    }
}

export interface Identifier extends Expression {
    token: Token;
    value: string;
}

export class Identifier implements Identifier {
    constructor(token: Token, value: string) {
        this.token = token;
        this.value = value;
    }

    ExpressionNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        return this.value;
    }
}

export interface IntegerLiteral extends Expression {
    token: Token;
    value: number;
}

export class IntegerLiteral implements IntegerLiteral {
    constructor(token: Token) {
        this.token = token;
        this.value = 0;
    }

    ExpressionNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        return this.value.toString();
    }
}

export interface PrefixExpression extends Expression {
    token: Token;
    operator: string;
    right: Expression | null;
}

export class PrefixExpression implements PrefixExpression {
    constructor(token: Token, operator: string) {
        this.token = token;
        this.operator = operator;
    }

    ExpressionNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        if (this.right != null) {
            return `(${this.operator}${this.right.String()})`;
        }
        return `(${this.operator}`;
    }
}

export interface InfixExpression extends Expression {
    token: Token;
    left: Expression | null;
    operator: string;
    right: Expression | null;
}

export class InfixExpression implements InfixExpression {
    constructor(token: Token, operator: string, left: Expression | null) {
        this.token = token;
        this.operator = operator;
        this.left = left;
    }

    ExpressionNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        if (this.left != null && this.right != null) {
            return `(${this.left.String()} ${this.operator} ${this.right.String()})`;
        }
        return `( ${this.operator} )`;
    }
}

export interface Boolean extends Expression {
    token: Token;
    value: boolean;
}

export class Boolean implements Boolean {
    constructor(token: Token, value: boolean) {
        this.token = token;
        this.value = value;
    }

    ExpressionNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        return this.token.literal;
    }
}
