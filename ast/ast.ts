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
    statements: Statement[];
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
        const out: string[] = [];

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
        const out: string[] = [];

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
        const out: string[] = [];

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

export interface BlockStatement extends Statement {
    token: Token;
    statements: Statement[];
}

export class BlockStatement implements BlockStatement {
    constructor(token: Token) {
        this.token = token;
        this.statements = [];
    }

    StatementNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        const out: string[] = [];

        for (let i = 0; i < this.statements.length; i++) {
            out.push(this.statements[i].String());
        }

        return out.join("");
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

export interface StringLiteral extends Expression {
    token: Token;
    value: string;
}

export class StringLiteral implements StringLiteral {
    constructor(token: Token, value: string) {
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

export interface BooleanLiteral extends Expression {
    token: Token;
    value: boolean;
}

export class BooleanLiteral implements BooleanLiteral {
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

export interface IfExpression extends Expression {
    token: Token;
    condition: Expression | null;
    consequence: BlockStatement;
    alternative: BlockStatement | null;
}

export class IfExpression implements IfExpression {
    constructor(token: Token) {
        this.token = token;
    }

    ExpressionNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        const out: string[] = [];

        out.push("if");
        if (this.condition != null) {
            out.push(this.condition.String());
        }
        out.push(" ");
        out.push(this.consequence.String());

        if (this.alternative != null) {
            out.push("else ");
            out.push(this.alternative.String());
        }

        return out.join("");
    }
}

export interface FunctionLiteral extends Expression {
    token: Token;
    parameters: Identifier[] | null;
    body: BlockStatement;
}

export class FunctionLiteral implements FunctionLiteral {
    constructor(token: Token) {
        this.token = token;
    }

    ExpressionNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        const out: string[] = [];

        const params: string[] = [];
        if (this.parameters != null) {
            for (let i = 0; i < this.parameters.length; i++) {
                params.push(this.parameters[i].String());
            }
        }

        out.push(this.TokenLiteral());
        out.push("(");
        out.push(params.join(", "));
        out.push(") ");
        out.push(this.body.String());

        return out.join("");
    }
}

export interface CallExpression extends Expression {
    token: Token;
    func: Expression | null;
    arguments: (Expression | null)[] | null;
}

export class CallExpression implements CallExpression {
    constructor(token: Token, func: Expression | null) {
        this.token = token;
        this.func = func;
    }

    ExpressionNode(): void {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        const out: string[] = [];

        const args: string[] = [];
        if (this.arguments != null) {
            for (let i = 0; i < this.arguments.length; i++) {
                if (this.arguments[i] != null) {
                    // "!"で非nullを明示
                    args.push(this.arguments[i]!.String());
                }
            }
        }

        if (this.func != null) {
            out.push(this.func.String());
        }
        out.push("(");
        out.push(args.join(", "));
        out.push(")");

        return out.join("");
    }
}
