import {
    BlockStatement,
    BooleanLiteral,
    ExpressionStatement,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    Node,
    PrefixExpression,
    Program,
    ReturnStatement,
    Statement,
    StringLiteral,
} from "../ast/ast.ts";
import {
    Boolean,
    Environment,
    Error,
    Integer,
    Null,
    Object,
    ObjectKind,
    ReturnValue,
    String,
} from "../object/object.ts";

export const NULL = new Null();
export const TRUE = new Boolean(true);
export const FALSE = new Boolean(false);

export function evaluate(node: Node | null, env: Environment): Object | null {
    if (IsProgram(node)) {
        return evaluateProgram(node.statements, env);
    } else if (IsExpressionStatement(node)) {
        return evaluate(node.expression, env);
    } else if (IsLetStatement(node)) {
        const val = evaluate(node.value, env);
        if (isError(val)) {
            return val;
        }
        env.Set(node.name.value, val);
    } else if (IsReturnStatement(node)) {
        const val = evaluate(node.returnValue, env);
        if (isError(val)) {
            return val;
        }
        return new ReturnValue(val);
    } else if (IsBlockStatement(node)) {
        return evaluateBlockStatement(node, env);
    } else if (IsIdentifier(node)) {
        return evaluateIdentifier(node, env);
    } else if (IsIntegerLiteral(node)) {
        return new Integer(node.value);
    } else if (IsStringLiteral(node)) {
        return new String(node.value);
    } else if (IsBooleanLiteral(node)) {
        return nativeBoolToBooleanObject(node.value);
    } else if (IsPrefixExpression(node)) {
        const right = evaluate(node.right, env);
        if (isError(right)) {
            return right;
        }
        return evaluatePrefixExpression(node.operator, right);
    } else if (IsInfixExpression(node)) {
        const left = evaluate(node.left, env);
        if (isError(left)) {
            return left;
        }
        const right = evaluate(node.right, env);
        if (isError(right)) {
            return right;
        }
        return evaluateInfixExpression(node.operator, left, right);
    } else if (IsIfExpression(node)) {
        return evaluateIfExpression(node, env);
    }

    return null;
}

function evaluateProgram(stmts: Statement[], env: Environment): Object | null {
    let result: Object | null = null;

    for (let i = 0; i < stmts.length; i++) {
        result = evaluate(stmts[i], env);

        if (result instanceof ReturnValue) {
            return result.value;
        } else if (result instanceof Error) {
            return result;
        }
    }

    return result;
}

function evaluateBlockStatement(block: BlockStatement, env: Environment): Object | null {
    let result: Object | null = null;

    for (let i = 0; i < block.statements.length; i++) {
        result = evaluate(block.statements[i], env);

        if (result != null) {
            const rt = result.Type();
            if (rt == ObjectKind.RETURN_VALUE_OBJ || ObjectKind.ERROR_OBJ) {
                return result;
            }
        }
    }

    return result;
}

function evaluateIdentifier(node: Identifier, env: Environment): Object {
    const [val, ok] = env.Get(node.value);
    if (!ok) {
        return newError(`identifier not found: ${node.value}`);
    }

    return val;
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
        return newError(`unknown operator: -${right?.Type()}`);
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
    } else if (left?.Type() != right?.Type()) {
        return newError(
            `type mismatch: ${left?.Type()} ${operator} ${right?.Type()}`,
        );
    } else {
        return newError(
            `unknown operator: ${left?.Type()} ${operator} ${right?.Type()}`,
        );
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
            return newError(
                `unknown operator: ${left.Type()} ${operator} ${right.Type()}`,
            );
    }
}

function evaluateIfExpression(ie: IfExpression, env: Environment): Object | null {
    const condition = evaluate(ie.condition, env);
    if (isError(condition)) {
        return condition;
    }

    if (isTruthy(condition)) {
        return evaluate(ie.consequence, env);
    } else if (ie.alternative != null) {
        return evaluate(ie.alternative, env);
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

function isError(obj: Object | null): boolean {
    if (obj != null) {
        return obj.Type() == ObjectKind.ERROR_OBJ;
    }
    return false;
}

function newError(a: string): Error {
    return new Error(a);
}

function IsProgram(n: Node | null): n is Program {
    return n instanceof Program;
}

function IsExpressionStatement(n: Node | null): n is ExpressionStatement {
    return n instanceof ExpressionStatement;
}

function IsLetStatement(n: Node | null): n is LetStatement {
    return n instanceof LetStatement;
}

function IsReturnStatement(n: Node | null): n is ReturnStatement {
    return n instanceof ReturnStatement;
}

function IsIdentifier(n: Node | null): n is Identifier {
    return n instanceof Identifier;
}

function IsIntegerLiteral(n: Node | null): n is IntegerLiteral {
    return n instanceof IntegerLiteral;
}

function IsStringLiteral(n: Node | null): n is StringLiteral {
    return n instanceof StringLiteral;
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
