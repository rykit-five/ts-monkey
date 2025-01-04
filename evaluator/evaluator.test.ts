import { assert, assertEquals } from "jsr:@std/assert";
import { Lexer } from "../lexer/lexer.ts";
import {
    Boolean,
    Error,
    Function,
    Integer,
    NewEnvironment,
    Object,
} from "../object/object.ts";
import { New } from "../parser/parser.ts";
import { evaluate, NULL } from "./evaluator.ts";

Deno.test("TestEvalIntegerExpression", () => {
    type Test = {
        input: string;
        expected: number;
    };

    const tests: Test[] = [
        { input: "5", expected: 5 },
        { input: "10", expected: 10 },
        { input: "-5", expected: -5 },
        { input: "-10", expected: -10 },
        { input: "1 + 2 + 3 + 4 + 5", expected: 15 },
        { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
        { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
        { input: "-50 + 100 + -50", expected: 0 },
        { input: "5 * 2 + 10", expected: 20 },
        { input: "5 + 2 * 10", expected: 25 },
        { input: "20 + 2 * -10", expected: 0 },
        { input: "50 / 2 * 2 + 10", expected: 60 },
        { input: "2 * (5 + 10)", expected: 30 },
        { input: "3 * 3 * 3 + 10", expected: 37 },
        { input: "3 * (3 * 3) + 10", expected: 37 },
        { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
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
        { input: "true", expected: true },
        { input: "false", expected: false },
        { input: "1 < 2", expected: true },
        { input: "1 > 2", expected: false },
        { input: "1 < 1", expected: false },
        { input: "1 > 1", expected: false },
        { input: "1 == 1", expected: true },
        { input: "1 != 1", expected: false },
        { input: "1 == 2", expected: false },
        { input: "1 != 2", expected: true },
        { input: "true == true", expected: true },
        { input: "false == false", expected: true },
        { input: "true == false", expected: false },
        { input: "true != false", expected: true },
        { input: "false != true", expected: true },
        { input: "(1 < 2) == true", expected: true },
        { input: "(1 < 2) == false", expected: false },
        { input: "(1 > 2) == true", expected: false },
        { input: "(1 > 2) == false", expected: true },
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
        { input: "!true", expected: false },
        { input: "!false", expected: true },
        { input: "!5", expected: false },
        { input: "!!true", expected: true },
        { input: "!!false", expected: false },
        { input: "!!5", expected: true },
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
        { input: "if (true) { 10 }", expected: 10 },
        { input: "if (false) { 10 }", expected: null },
        { input: "if (1) { 10 }", expected: 10 },
        { input: "if (1 < 2) { 10 }", expected: 10 },
        { input: "if (1 > 2) { 10 }", expected: null },
        { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
        { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
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
        { input: "return 10;", expected: 10 },
        { input: "return 10; 9;", expected: 10 },
        { input: "return 2 * 5; 9;", expected: 10 },
        { input: "9; return 2 * 5; 9;", expected: 10 },
        {
            input: `
if (10 > 1) {
  if (10 > 1) {
    return 10;
  }

  return 1;
}
`,
            expected: 10,
        },
    ];

    tests.forEach((tt) => {
        const evaluated = testEval(tt.input);
        assert(testIntegerObject(evaluated, tt.expected));
    });
});

Deno.test("TestErrorHandling", () => {
    type Test = {
        input: string;
        expectedMessage: string;
    };

    const tests: Test[] = [
        {
            input: "5 + true;",
            expectedMessage: "type mismatch: INTEGER + BOOLEAN",
        },
        {
            input: "5 + true; 5;",
            expectedMessage: "type mismatch: INTEGER + BOOLEAN",
        },
        {
            input: "-true",
            expectedMessage: "unknown operator: -BOOLEAN",
        },
        {
            input: "true + false;",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "true + false + true + false;",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "5; true + false; 5",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: `"Hello" - "World"`,
            expectedMessage: "unknown operator: STRING - STRING",
        },
        {
            input: "if (10 > 1) { true + false; }",
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: `
if (10 > 1) {
  if (10 > 1) {
    return true + false;
  }

  return 1;
}
`,
            expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
        },
        {
            input: "foobar",
            expectedMessage: "identifier not found: foobar",
        },
    ];

    tests.forEach((tt, i) => {
        const evaluated = testEval(tt.input);

        assert(
            IsError(evaluated),
            `no error object returned. got=${typeof evaluated}`,
        );
        const errObj = evaluated;

        assertEquals(
            errObj?.message,
            tt.expectedMessage,
            `wrong error message. got=${errObj?.message}, want=${tt.expectedMessage} ${i}`,
        );
    });
});

Deno.test("TestLetStatements", () => {
    type Test = {
        input: string;
        expected: number;
    };

    const tests: Test[] = [
        { input: "let a = 5; a;", expected: 5 },
        { input: "let a = 5 * 5; a;", expected: 25 },
        { input: "let a = 5; let b = a; b;", expected: 5 },
        {
            input: "let a = 5; let b = a; let c = a + b + 5; c;",
            expected: 15,
        },
    ];

    tests.forEach((tt) => {
        const evaluated = testEval(tt.input);
        assert(testIntegerObject(evaluated, tt.expected));
    });
});

Deno.test("TestFunctionObject", () => {
    const input = "fn(x) { x + 2; };";

    const evaluated = testEval(input);
    assert(
        IsFunction(evaluated),
        `object is not function. got=${typeof evaluated}`,
    );
    const fn = evaluated;

    if (fn?.parameters != null) {
        assertEquals(
            fn?.parameters.length,
            1,
            `function has wrong parameters. got=${fn?.parameters}`,
        );

        assertEquals(
            fn?.parameters[0].String(),
            "x",
            `parameter is not 'x'. got=${fn.parameters[0]}`,
        );
    }

    const expectedBody = "(x + 2)";

    assertEquals(
        fn?.body.String(),
        expectedBody,
        `body is not ${expectedBody}. got=${fn?.body.String()}`,
    );
});

Deno.test("TestFunctionApplication", () => {
    type Test = {
        input: string;
        expected: number;
    };

    const tests: Test[] = [
        { input: "let identity = fn(x) { x; }; identity(5);", expected: 5 },
        {
            input: "let identity = fn(x) { return x; }; identity(5);",
            expected: 5,
        },
        { input: "let double = fn(x) { x * 2; }; double(5);", expected: 10 },
        { input: "let add = fn(x, y) { x + y; }; add(5, 5);", expected: 10 },
        {
            input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));",
            expected: 20,
        },
        { input: "fn(x) { x; }(5)", expected: 5 },
    ];

    tests.forEach((tt) => {
        const evaluated = testEval(tt.input);
        assert(testIntegerObject(evaluated, tt.expected));
    });
});

function testEval(input: string): Object | null {
    const l = new Lexer(input + "\\0");
    const p = New(l);
    const program = p.parseProgram();
    const env = NewEnvironment();

    return evaluate(program, env);
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

function IsFunction(o: Object | null): o is Function {
    return o instanceof Function;
}

function IsError(o: Object | null): o is Error {
    return o instanceof Error;
}
