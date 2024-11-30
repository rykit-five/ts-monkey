import { assert, assertEquals, assertThrows } from "jsr:@std/assert";
import { LetStatement, Statement } from "../ast/ast.ts";
import { Lexer } from "../lexer/lexer.ts";
import { Parser, New } from "./parser.ts";

Deno.test("TestLetStatements", () =>{
    const input = `
let x = 5;
let y = 16;
let foobar = 838383;
\\0
    `;

    const l = new Lexer(input);
    const p = New(l);

    const program = p.ParseProgram();
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
                throw new Error(`Program.statements does not contain 3 statements. got=${program.statements.length}`);
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

function TestLetStatement(s: Statement, name: string): boolean {
    if (s.TokenLiteral() != "let") {
        console.error(`s.TokenLiteral not 'let'. got=${s.TokenLiteral()}`);
        return false;
    }

    if (!IsLetStatement(s)) {
        console.error(`s not LetStatement. got=${typeof(s)}`);
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
