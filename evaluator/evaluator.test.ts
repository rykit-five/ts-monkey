import { assert, assertEquals } from "jsr:@std/assert";
import { Lexer } from "../lexer/lexer.ts";
import { Boolean, Integer, Object } from "../object/object.ts";
import { New, Parser } from "../parser/parser.ts";
import { evaluate } from "./evaluator.ts";

Deno.test("TestEvalIntegerExpression", () => {
    type Test = {
        input: string;
        expected: number;
    };

    const tests: Test[] = [
        { input: "5\\0", expected: 5 },
        { input: "10\\0", expected: 10 },
        { input: "-5\\0", expected: -5 },
        { input: "-10\\0", expected: -10 },
    ];

    tests.forEach((tt) => {
        const evaluated = testEval(tt.input);
        assert(testIntegerObject(evaluated, tt.expected));
    });
});

Deno.test("TestEvalBooleanExpression", () => {
    type Test = {
        input: string;
        expected: boolean;
    };

    const tests: Test[] = [
        { input: "true\\0", expected: true },
        { input: "false\\0", expected: false },
    ];

    tests.forEach((tt) => {
        const evaluated = testEval(tt.input);
        assert(testBooleanObject(evaluated, tt.expected));
    });
});

Deno.test("TestEvalBooleanExpression", () => {
    type Test = {
        input: string;
        expected: boolean;
    };

    const tests: Test[] = [
        { input: "!true\\0", expected: false },
        { input: "!false\\0", expected: true },
        { input: "!5\\0", expected: false },
        { input: "!!true\\0", expected: true },
        { input: "!!false\\0", expected: false },
        { input: "!!5\\0", expected: true },
    ];

    tests.forEach((tt) => {
        const evaluated = testEval(tt.input);
        assert(testBooleanObject(evaluated, tt.expected));
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

function testBooleanObject(obj: Object | null, expected: boolean): boolean {
    if (!IsBoolean(obj)) {
        console.error(`object is not Boolean. got=${typeof obj}`);
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

function IsBoolean(o: Object | null): o is Boolean {
    return o instanceof Boolean;
}
