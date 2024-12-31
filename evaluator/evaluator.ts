import {
    BooleanLiteral,
    Expression,
    ExpressionStatement,
    IntegerLiteral,
    Node,
    Program,
    Statement,
} from "../ast/ast.ts";
import { Boolean, Integer, Object } from "../object/object.ts";

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
    }

    return null;
}

function evaluateStatements(stmts: Statement[]): Object | null {
    let result: Object | null = new Object();

    stmts.forEach((statement) => {
        result = evaluate(statement);
    });

    return result;
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
