import {
    BooleanLiteral,
    ExpressionStatement,
    IntegerLiteral,
    Node,
    PrefixExpression,
    Program,
    Statement,
} from "../ast/ast.ts";
import {
    Boolean,
    Integer,
    Null,
    Object,
    ObjectKind,
} from "../object/object.ts";

const NULL = new Null();
const TRUE = new Boolean(true);
const FALSE = new Boolean(false);

export function evaluate(node: Node | null): Object | null {
    if (IsProgram(node)) {
        return evaluateStatements(node.statements);
    } else if (IsExpressionStatement(node)) {
        return evaluate(node.expression);
    } else if (IsIntegerLiteral(node)) {
        return new Integer(node.value);
    } else if (IsBooleanLiteral(node)) {
        return nativeBoolToBooleanObject(node.value);
    } else if (IsPrefixExpression(node)) {
        const right = evaluate(node.right);
        return evaluatePrefixExpression(node.operator, right);
    }

    return null;
}

function evaluateStatements(stmts: Statement[]): Object | null {
    let result: Object | null = new Null();

    stmts.forEach((statement) => {
        result = evaluate(statement);
    });

    return result;
}

function evaluatePrefixExpression(
    operator: string,
    right: Object | null,
): Object {
    switch (operator) {
        case "!":
            return evaluateBangOperatorExpression(right);
        case "-":
            return evaluateMinusOperatorExpression(right);
        default:
            return NULL;
    }
}

function evaluateBangOperatorExpression(right: Object | null): Object {
    switch (right) {
        case TRUE:
            return FALSE;
        case FALSE:
            return TRUE;
        case NULL:
            return TRUE;
        default:
            return FALSE;
    }
}

function evaluateMinusOperatorExpression(right: Object | null): Object {
    if (right?.Type() != ObjectKind.INTEGER_OBJ) {
        return NULL;
    }

    if (right instanceof Integer) {
        const value = right.value;
        return new Integer(-value);
    }
    // ここに到達することはないが、型システム的に保証するための例外
    return NULL;
}

function nativeBoolToBooleanObject(input: boolean): Object {
    if (input) {
        return TRUE;
    } else {
        return FALSE;
    }
}

function IsProgram(n: Node | null): n is Program {
    return n instanceof Program;
}

function IsExpressionStatement(n: Node | null): n is ExpressionStatement {
    return n instanceof ExpressionStatement;
}

function IsIntegerLiteral(n: Node | null): n is IntegerLiteral {
    return n instanceof IntegerLiteral;
}

function IsBooleanLiteral(n: Node | null): n is BooleanLiteral {
    return n instanceof BooleanLiteral;
}

function IsPrefixExpression(n: Node | null): n is PrefixExpression {
    return n instanceof PrefixExpression;
}
