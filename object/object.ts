import { BlockStatement, Identifier } from "../ast/ast.ts";

type ObjectType = string;

export enum ObjectKind {
    NULL_OBJ = "NULL",
    ERROR_OBJ = "ERROR",

    INTEGER_OBJ = "INTEGER",
    BOOLEAN_OBJ = "BOOLEAN",
    STRING_OBJ = "STRING",

    FUNCTION_OBJ = "FUNCTION",

    RETURN_VALUE_OBJ = "RETURN_VALUE",
}

export function NewEnclosedEnvironment(outer: Environment): Environment {
    const env = NewEnvironment();
    env.outer = outer;
    return env;
}

export function NewEnvironment(): Environment {
    const s = new Map<string, Object>([]);
    return new Environment(s, null);
}

export interface Environment {
    store: Map<string, Object>;
    outer: Environment | null;
}

export class Environment implements Environment {
    constructor(store: Map<string, Object>, outer: Environment | null) {
        this.store = store;
        this.outer = outer;
    }

    Get(name: string): [Object, boolean] {
        let obj = this.store.get(name);
        let ok = false;

        if (obj == undefined) {
            if (this.outer != null) {
                [obj, ok] = this.outer.Get(name);
            } else {
                [obj, ok] = [new Null(), false];
            }
        } else {
            ok = true;
        }

        return [obj, ok];
    }

    Set(name: string, val: Object | null): Object | null {
        if (val != null) {
            this.store.set(name, val);
            return val;
        }
        return null;
    }
}

export interface Object {
    Type(): ObjectType;
    Inspect(): string;
}

export class Null implements Object {
    constructor() {}

    Type(): ObjectType {
        return ObjectKind.NULL_OBJ;
    }

    Inspect(): string {
        return "null";
    }
}

export interface Integer extends Object {
    value: number;
}

export class Integer implements Integer {
    constructor(value: number) {
        this.value = value;
    }

    Type(): ObjectType {
        return ObjectKind.INTEGER_OBJ;
    }

    Inspect(): string {
        return `${this.value}`;
    }
}

export interface String extends Object {
    value: string;
}

export class String implements String {
    constructor(value: string) {
        this.value = value;
    }

    Type(): ObjectType {
        return ObjectKind.STRING_OBJ;
    }

    Inspect(): string {
        return this.value;
    }
}

export interface Boolean extends Object {
    value: boolean;
}

export class Boolean implements Boolean {
    constructor(value: boolean) {
        this.value = value;
    }

    Type(): ObjectType {
        return ObjectKind.BOOLEAN_OBJ;
    }

    Inspect(): string {
        return `${this.value}`;
    }
}

export interface ReturnValue extends Object {
    value: Object | null;
}

export class ReturnValue implements ReturnValue {
    constructor(value: Object | null) {
        this.value = value;
    }

    Type(): ObjectType {
        return ObjectKind.RETURN_VALUE_OBJ;
    }

    Inspect(): string {
        if (this.value != null) {
            return this.value.Inspect();
        }

        return "";
    }
}

export interface Function extends Object {
    parameters: Identifier[] | null;
    body: BlockStatement;
    env: Environment;
}

export class Function implements Function {
    constructor(
        parameters: Identifier[] | null,
        body: BlockStatement,
        env: Environment,
    ) {
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }

    Type(): ObjectType {
        return ObjectKind.FUNCTION_OBJ;
    }

    Inspect(): string {
        const out: string[] = [];

        const params: string[] = [];
        if (this.parameters != null) {
            for (let i = 0; i < this.parameters.length; i++) {
                params.push(this.parameters[i].String());
            }
        }

        out.push("fn");
        out.push("(");
        out.push(params.join(", "));
        out.push(") {\n");
        out.push(this.body.String());
        out.push("\n}");

        return out.join("");
    }
}

export interface Error extends Object {
    message: string;
}

export class Error implements Error {
    constructor(message: string) {
        this.message = message;
    }

    Type(): ObjectType {
        return ObjectKind.ERROR_OBJ;
    }

    Inspect(): string {
        return `ERROR: ${this.message}`;
    }
}
