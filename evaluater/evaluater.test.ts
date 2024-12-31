import { assert, assertEquals } from "jsr:@std/assert";
import { Lexer } from "../lexer/lexer.ts";
import { Integer, Object } from "../object/object.ts";
import { New, Parser } from "../parser/parser.ts";
import { evaluate } from "./evaluater.ts";

Deno.test("TestEvalIntegerExpression", () => {
    type Test = {
        input: string;
        expected: number;
    };

    const tests: Test[] = [
        { input: "5\\0", expected: 5 },
        { input: "10\\0", expected: 10 },
    ];

    tests.forEach((tt) => {
        const evaluated = testEval(tt.input);
        testIntegerObject(evaluated, tt.expected);
    });
});

function testEval(input: string): Object | null {
    const l = new Lexer(input);
    const p = New(l);
    const program = p.parseProgram();

    return evaluate(program);
}

function testIntegerObject(obj: Object | null, expected: number): boolean {
    if (!IsInteger(obj)) {
        console.error(`object is not Integer. got=${typeof obj}`);
        return false;
    }
    const result = obj;
    if (result.value != expected) {
        console.error(
            `object has wrong value. got=${result.value}, want=${expected}`,
        );
        return false;
    }

    return true;
}

function IsInteger(o: Object | null): o is Integer {
    return o instanceof Integer;
}
