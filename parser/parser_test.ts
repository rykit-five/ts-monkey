import { assert, assertEquals, assertThrows } from "jsr:@std/assert";
import {
    Expression,
    ExpressionStatement,
    Identifier,
    LetStatement,
    ReturnStatement,
    Statement,
} from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { New, Parser } from "./parser.ts";

Deno.test("TestLetStatements", () => {
    const input = `
let x = 5;
let y = 16;
let foobar = 838383;
\\0
    `;

    const l = new Lexer(input);
    const p = New(l);

    const program = p.parseProgram();
    CheckParseErrors(p);
    if (program == null) {
        assertThrows(
            () => {
                throw new Error("ParseProgram() returned null");
            },
            Error,
            "Panic!",
        );
    }
    if (program.statements.length != 3) {
        assertThrows(
            () => {
                throw new Error(
                    `Program.statements does not contain 3 statements. got=${program.statements.length}`,
                );
            },
            Error,
            "Panic!",
        );
    }

    class Test {
        expectedIdentifier: string;

        constructor(expectedIdentifier: string) {
            this.expectedIdentifier = expectedIdentifier;
        }
    }

    const tests: Array<Test> = [
        new Test("x"),
        new Test("y"),
        new Test("foobar"),
    ];

    for (let i = 0; i < tests.length; i++) {
        const stmt = program.statements[i];
        assert(TestLetStatement(stmt, tests[i].expectedIdentifier));
    }
});

Deno.test("TestReturnStatements", () => {
    const input = `
return 5;
return 16;
return 838383;
\\0
    `;

    const l = new Lexer(input);
    const p = New(l);

    const program = p.parseProgram();
    CheckParseErrors(p);
    if (program == null) {
        assertThrows(
            () => {
                throw new Error("ParseProgram() returned null");
            },
            Error,
            "Panic!",
        );
    }
    if (program.statements.length != 3) {
        assertThrows(
            () => {
                throw new Error(
                    `Program.statements does not contain 3 statements. got=${program.statements.length}`,
                );
            },
            Error,
            "Panic!",
        );
    }

    for (let i = 0; i < program.statements.length; i++) {
        const returnStmt = program.statements[i];
        assert(
            IsReturnStatement(returnStmt),
            `stmt not ReturnStatement. got=${typeof returnStmt}`,
        );
        assertEquals(
            returnStmt.TokenLiteral(),
            "return",
            `returnStmt.TokenLiteral not 'return', got ${returnStmt.TokenLiteral()}`,
        );
    }
});

Deno.test("TestIdentifierExpression", () => {
    const input = "foobar;\\0";

    const l = new Lexer(input);
    const p = New(l);

    const program = p.parseProgram();
    CheckParseErrors(p);

    if (program.statements.length != 1) {
        assertThrows(
            () => {
                throw new Error(
                    `Program.statements does not contain 1 statements. got=${program.statements.length}`,
                );
            },
            Error,
            "Panic!",
        );
    }

    assert(
        IsExpressionStatement(program.statements[0]),
        `program.statements[0] not ExpressionStatement. got=${
            program.statements[0]
        }`,
    );
    const stmt = program.statements[0];

    assert(
        IsIdentifier(stmt.expression),
        `exp not Identifier. got=${stmt.expression}`,
    );
    const ident = stmt.expression;

    assertEquals(
        ident.value,
        "foobar",
        `ident.value not foobar. got=${ident.value}`,
    );

    assertEquals(
        ident.TokenLiteral(),
        "foobar",
        `ident.TokenLiteral() not foobar. got=${ident.TokenLiteral()}`,
    );
});

function CheckParseErrors(p: Parser) {
    const errors = p.Errors();
    if (errors.length == 0) {
        return;
    }

    console.error(`paresr has ${errors.length}`);
    for (let i = 0; i < errors.length; i++) {
        console.error(`parser error: ${p.errors[i]}`);
    }
    throw new Error();
}

function TestLetStatement(s: Statement, name: string): boolean {
    if (s.TokenLiteral() != "let") {
        console.error(`s.TokenLiteral not 'let'. got=${s.TokenLiteral()}`);
        return false;
    }

    if (!IsLetStatement(s)) {
        console.error(`s not LetStatement. got=${typeof s}`);
        return false;
    }

    if (s.name.value != name) {
        console.error(`letStmt.name.value not ${name}. got=${s.name.value}`);
        return false;
    }

    if (s.name.TokenLiteral() != name) {
        console.error(`letStmt.name not ${name}. got=${s.name.TokenLiteral()}`);
        return false;
    }

    return true;
}

function IsLetStatement(s: Statement): s is LetStatement {
    return s instanceof LetStatement;
}

function IsReturnStatement(s: Statement): s is ReturnStatement {
    return s instanceof ReturnStatement;
}

function IsExpressionStatement(s: Statement): s is ExpressionStatement {
    return s instanceof ExpressionStatement;
}

function IsIdentifier(e: Expression | null): e is Identifier {
    return e instanceof Identifier;
}
