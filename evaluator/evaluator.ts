import {
    BlockStatement,
    BooleanLiteral,
    ExpressionStatement,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    Node,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
} from "../ast/ast.ts";
import {
    Boolean,
    Integer,
    Null,
    Object,
    ObjectKind,
    ReturnValue,
} from "../object/object.ts";

export const NULL = new Null();
export const TRUE = new Boolean(true);
export const FALSE = new Boolean(false);

export function evaluate(node: Node | null): Object | null {
    if (IsProgram(node)) {
        return evaluateProgram(node.statements);
    } else if (IsExpressionStatement(node)) {
        return evaluate(node.expression);
    } else if (IsReturnStatement(node)) {
        const val = evaluate(node.returnValue);
        return new ReturnValue(val);
    } else if (IsBlockStatement(node)) {
        return evaluateBlockStatement(node);
    } else if (IsIntegerLiteral(node)) {
        return new Integer(node.value);
    } else if (IsBooleanLiteral(node)) {
        return nativeBoolToBooleanObject(node.value);
    } else if (IsPrefixExpression(node)) {
        const right = evaluate(node.right);
        return evaluatePrefixExpression(node.operator, right);
    } else if (IsInfixExpression(node)) {
        const left = evaluate(node.left);
        const right = evaluate(node.right);
        return evaluateInfixExpression(node.operator, left, right);
    } else if (IsIfExpression(node)) {
        return evaluateIfExpression(node);
    }

    return null;
}

function evaluateProgram(stmts: Statement[]): Object | null {
    let result: Object | null = null;

    for (let i = 0; i < stmts.length; i++) {
        result = evaluate(stmts[i]);

        if (result instanceof ReturnValue) {
            return result.value;
        }
    }

    return result;
}

function evaluateBlockStatement(block: BlockStatement): Object | null {
    let result: Object | null = null;

    for (let i = 0; i < block.statements.length; i++) {
        result = evaluate(block.statements[i]);

        if (result != null && result.Type() == ObjectKind.RETURN_VALUE_OBJ) {
            return result;
        }
    }

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

function evaluateInfixExpression(
    operator: string,
    left: Object | null,
    right: Object | null,
): Object {
    if (
        left?.Type() == ObjectKind.INTEGER_OBJ &&
        right?.Type() == ObjectKind.INTEGER_OBJ
    ) {
        return evaluateIntegerInfixExpression(operator, left, right);
    } else if (operator == "==") {
        return nativeBoolToBooleanObject(left == right);
    } else if (operator == "!=") {
        return nativeBoolToBooleanObject(left != right);
    } else {
        return NULL;
    }
}

function evaluateIntegerInfixExpression(
    operator: string,
    left: Object | null,
    right: Object | null,
): Object {
    let leftVal = 0;
    let rightVal = 0;

    if (left instanceof Integer) {
        leftVal = left.value;
    } else {
        return NULL;
    }

    if (right instanceof Integer) {
        rightVal = right.value;
    } else {
        return NULL;
    }

    switch (operator) {
        case "+":
            return new Integer(leftVal + rightVal);
        case "-":
            return new Integer(leftVal - rightVal);
        case "*":
            return new Integer(leftVal * rightVal);
        case "/":
            return new Integer(leftVal / rightVal);
        case "<":
            return nativeBoolToBooleanObject(leftVal < rightVal);
        case ">":
            return nativeBoolToBooleanObject(leftVal > rightVal);
        case "==":
            return nativeBoolToBooleanObject(leftVal == rightVal);
        case "!=":
            return nativeBoolToBooleanObject(leftVal != rightVal);
        default:
            return NULL;
    }
}

function evaluateIfExpression(ie: IfExpression): Object | null {
    const condition = evaluate(ie.condition);

    if (isTruthy(condition)) {
        return evaluate(ie.consequence);
    } else if (ie.alternative != null) {
        return evaluate(ie.alternative);
    } else {
        return NULL;
    }
}

function nativeBoolToBooleanObject(input: boolean): Object {
    if (input) {
        return TRUE;
    } else {
        return FALSE;
    }
}

function isTruthy(obj: Object | null): boolean {
    switch (obj) {
        case NULL:
            return false;
        case TRUE:
            return true;
        case FALSE:
            return false;
        default:
            return true;
    }
}

function IsProgram(n: Node | null): n is Program {
    return n instanceof Program;
}

function IsExpressionStatement(n: Node | null): n is ExpressionStatement {
    return n instanceof ExpressionStatement;
}

function IsReturnStatement(n: Node | null): n is ReturnStatement {
    return n instanceof ReturnStatement;
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

function IsInfixExpression(n: Node | null): n is InfixExpression {
    return n instanceof InfixExpression;
}

function IsBlockStatement(n: Node | null): n is BlockStatement {
    return n instanceof BlockStatement;
}

function IsIfExpression(n: Node | null): n is IfExpression {
    return n instanceof IfExpression;
}
