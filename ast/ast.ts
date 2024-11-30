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
        let out: Array<string> = [];

        for (let i = 0; i < this.statements.length; i++) {
            out.push(this.statements[i].String());
        }

        return out.join("");
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
        let out: Array<string> = [];

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
        let out: Array<string> = [];

        out.push(this.TokenLiteral() + " ");

        if (this.returnValue != null) {
            out.push(this.returnValue.String());
        }

        out.push(";");

        return out.join("");
    }
}

export interface ExpressionStatement {
    token: Token;
    expression: Expression;
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

export interface Identifier {
    token: Token;
    value: string;
}

export class Identifier implements Identifier {
    constructor(token: Token, value: string) {
        this.token = token;
        this.value = value;
    }

    ExpressionNode() {}

    TokenLiteral(): string {
        return this.token.literal;
    }

    String(): string {
        return this.value;
    }
}
