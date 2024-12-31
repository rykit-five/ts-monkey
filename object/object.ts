type ObjectType = string;

enum ObjectKind {
    INTEGER_OBJ = "INTEGER",
    BOOLEAN_OBJ = "BOOLEAN",
    NULL_OBJ = "NULL",
}

export interface Object {
    Type(): ObjectType;
    Inspect(): string;
}

export class Object implements Object {
    constructor() {}
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

export class Null implements Object {
    constructor() {}

    Type(): ObjectType {
        return ObjectKind.NULL_OBJ;
    }

    Inspect(): string {
        return "null";
    }
}
