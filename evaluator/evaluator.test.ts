import { assert } from "jsr:@std/assert";
import { Lexer } from "../lexer/lexer.ts";
import { Boolean, Integer, Object } from "../object/object.ts";
import { New } from "../parser/parser.ts";
import { evaluate, NULL } from "./evaluator.ts";

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
        { input: "1 + 2 + 3 + 4 + 5\\0", expected: 15 },
        { input: "5 + 5 + 5 + 5 - 10\\0", expected: 10 },
        { input: "2 * 2 * 2 * 2 * 2\\0", expected: 32 },
        { input: "-50 + 100 + -50\\0", expected: 0 },
        { input: "5 * 2 + 10\\0", expected: 20 },
        { input: "5 + 2 * 10\\0", expected: 25 },
        { input: "20 + 2 * -10\\0", expected: 0 },
        { input: "50 / 2 * 2 + 10\\0", expected: 60 },
        { input: "2 * (5 + 10)\\0", expected: 30 },
        { input: "3 * 3 * 3 + 10\\0", expected: 37 },
        { input: "3 * (3 * 3) + 10\\0", expected: 37 },
        { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10\\0", expected: 50 },
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
        { input: "1 < 2\\0", expected: true },
        { input: "1 > 2\\0", expected: false },
        { input: "1 < 1\\0", expected: false },
        { input: "1 > 1\\0", expected: false },
        { input: "1 == 1\\0", expected: true },
        { input: "1 != 1\\0", expected: false },
        { input: "1 == 2\\0", expected: false },
        { input: "1 != 2\\0", expected: true },
        { input: "true == true\\0", expected: true },
        { input: "false == false\\0", expected: true },
        { input: "true == false\\0", expected: false },
        { input: "true != false\\0", expected: true },
        { input: "false != true\\0", expected: true },
        { input: "(1 < 2) == true\\0", expected: true },
        { input: "(1 < 2) == false\\0", expected: false },
        { input: "(1 > 2) == true\\0", expected: false },
        { input: "(1 > 2) == false\\0", expected: true },
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

Deno.test("TestIfElseExpressions", () => {
    type Test = {
        input: string;
        expected: number | null;
    };

    const tests: Test[] = [
        { input: "if (true) { 10 }\\0", expected: 10 },
        { input: "if (false) { 10 }\\0", expected: null },
        { input: "if (1) { 10 }\\0", expected: 10 },
        { input: "if (1 < 2) { 10 }\\0", expected: 10 },
        { input: "if (1 > 2) { 10 }\\0", expected: null },
        { input: "if (1 > 2) { 10 } else { 20 }\\0", expected: 20 },
        { input: "if (1 < 2) { 10 } else { 20 }\\0", expected: 10 },
    ];

    tests.forEach((tt) => {
        const evaluated = testEval(tt.input);
        if (typeof tt.expected == "number") {
            assert(testIntegerObject(evaluated, tt.expected));
        } else {
            assert(testNullObject(evaluated));
        }
    });
});

Deno.test("TestReturnStatements", () => {
    type Test = {
        input: string;
        expected: number;
    };

    const tests: Test[] = [
        { input: "return 10;\\0", expected: 10 },
        { input: "return 10; 9;\\0", expected: 10 },
        { input: "return 2 * 5; 9;\\0", expected: 10 },
        { input: "9; return 2 * 5; 9;\\0", expected: 10 },
        {
            input: `
if (10 > 1) {
  if (10 > 1) {
    return 10;
  }

  return 1;
}
\\0`,
            expected: 10,
        },
    ];

    tests.forEach((tt) => {
        const evaluated = testEval(tt.input);
        assert(testIntegerObject(evaluated, tt.expected));
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

function testNullObject(obj: Object | null): boolean {
    if (obj != NULL) {
        console.error(`object is not NULL. got=${typeof obj}`);
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
