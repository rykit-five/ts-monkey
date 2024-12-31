import {
    Expression,
    ExpressionStatement,
    IntegerLiteral,
    Node,
    Program,
    Statement,
} from "../ast/ast.ts";
import { Integer, Object } from "../object/object.ts";

export function evaluate(node: Node | null): Object | null {
    if (IsProgram(node)) {
        return evaluateStatements(node.statements);
    } else if (IsExpressionStatement(node)) {
        return evaluate(node.expression);
    }
    if (IsIntegerLiteral(node)) {
        return new Integer(node.value);
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

function IsProgram(n: Node | null): n is Program {
    return n instanceof Program;
}

function IsExpressionStatement(n: Node | null): n is ExpressionStatement {
    return n instanceof ExpressionStatement;
}

function IsIntegerLiteral(n: Node | null): n is IntegerLiteral {
    return n instanceof IntegerLiteral;
}
