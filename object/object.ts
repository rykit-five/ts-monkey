type ObjectType = string;

export enum ObjectKind {
    NULL_OBJ = "NULL",
    ERROR_OBJ = "ERROR",

    INTEGER_OBJ = "INTEGER",
    BOOLEAN_OBJ = "BOOLEAN",
    STRING_OBJ = "STRING",

    RETURN_VALUE_OBJ = "RETURN_VALUE",
}

export function NewEnvironment(): Environment {
    const s = new Map<string, Object>([]);
    return new Environment(s);
}

export interface Environment {
    store: Map<string, Object>;
}

export class Environment implements Environment {
    constructor(store: Map<string, Object>) {
        this.store = store;
    }

    Get(name: string): [Object, boolean] {
        const obj = this.store.get(name);
        if (obj != undefined) {
            return [obj, true]
        }
        // objはundefinedであるが、Objectを返したいのでNULLを返す
        return [new Null(), false]
    }

    Set(name: string, val: Object | null) {
        if (val != null) {
            this.store.set(name, val);
            
        return val;
    }
}}

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
