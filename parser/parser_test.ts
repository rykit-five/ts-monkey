import { assert, assertEquals, assertThrows } from "jsr:@std/assert";
import {
    Boolean,
    Expression,
    ExpressionStatement,
    Identifier,
    IfExpression,
    InfixExpression,
    IntegerLiteral,
    LetStatement,
    PrefixExpression,
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
        `program.statements[0] not ExpressionStatement. got=${typeof program
            .statements[0]}`,
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

Deno.test("TestIntegerLiteralExpressoin", () => {
    const input = "5;\\0";

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
        `program.statements[0] not ExpressionStatement. got=${typeof program
            .statements[0]}`,
    );
    const stmt = program.statements[0];

    assert(
        IsIntegerLiteral(stmt.expression),
        `exp not IntegerLiteral. got=${stmt.expression}`,
    );
    const literal = stmt.expression;

    assertEquals(
        literal.value,
        5,
        `literal.value not 5. got=${literal.value}`,
    );

    assertEquals(
        literal.TokenLiteral(),
        "5",
        `literal.TokenLiteral() not 5. got=${literal.TokenLiteral()}`,
    );
});

Deno.test("TestParsingPrefixExpressions", () => {
    class PrefixTest {
        input: string;
        operator: string;
        integerValue: number | boolean;

        constructor(
            input: string,
            operator: string,
            integerValue: number | boolean,
        ) {
            this.input = input;
            this.operator = operator;
            this.integerValue = integerValue;
        }
    }

    const prefixTests: PrefixTest[] = [
        new PrefixTest("!5\\0", "!", 5),
        new PrefixTest("-15\\0", "-", 15),
        new PrefixTest("!true\\0", "!", true),
        new PrefixTest("!false\\0", "!", false),
    ];

    for (let i = 0; i < prefixTests.length; i++) {
        const l = new Lexer(prefixTests[i].input);
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
            `program.statements[0] is not ExpressionStatement. got=${typeof program
                .statements[0]}`,
        );
        const stmt = program.statements[0];

        assert(
            IsPrefixExpression(stmt.expression),
            `stmt is not PrefixExpression. got=${typeof stmt.expression}`,
        );
        const exp = stmt.expression;

        assertEquals(
            exp.operator,
            prefixTests[i].operator,
            `exp.operator is not ${
                prefixTests[i].operator
            }. got=${exp.operator}`,
        );

        assert(TestLiteralExpression(exp.right, prefixTests[i].integerValue));
    }
});

Deno.test("TestParsingInfixExpressions", () => {
    class InfixTest {
        input: string;
        leftValue: number | boolean;
        operator: string;
        rightValue: number | boolean;

        constructor(
            input: string,
            leftValue: number | boolean,
            operator: string,
            rightValue: number | boolean,
        ) {
            this.input = input;
            this.leftValue = leftValue;
            this.operator = operator;
            this.rightValue = rightValue;
        }
    }

    const infixTests: InfixTest[] = [
        new InfixTest("5 + 5\\0", 5, "+", 5),
        new InfixTest("5 - 5\\0", 5, "-", 5),
        new InfixTest("5 * 5\\0", 5, "*", 5),
        new InfixTest("5 / 5\\0", 5, "/", 5),
        new InfixTest("5 > 5\\0", 5, ">", 5),
        new InfixTest("5 < 5\\0", 5, "<", 5),
        new InfixTest("5 == 5\\0", 5, "==", 5),
        new InfixTest("5 != 5\\0", 5, "!=", 5),
        new InfixTest("true == true\\0", true, "==", true),
        new InfixTest("true != false\\0", true, "!=", false),
        new InfixTest("false == false\\0", false, "==", false),
    ];

    for (let i = 0; i < infixTests.length; i++) {
        const l = new Lexer(infixTests[i].input);
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
            `program.statements[0] is not ExpressionStatement. got=${typeof program
                .statements[0]}`,
        );
        const stmt = program.statements[0];

        assert(
            TestInfixExpression(
                stmt.expression,
                infixTests[i].leftValue,
                infixTests[i].operator,
                infixTests[i].rightValue,
            ),
        );
    }
});

Deno.test("TestOperetorPrecedenceParsing", () => {
    class Test {
        input: string;
        expected: string;

        constructor(input: string, expected: string) {
            this.input = input;
            this.expected = expected;
        }
    }

    const tests: Array<Test> = [
        new Test(
            "-a * b\\0",
            "((-a) * b)",
        ),
        new Test(
            "!-a\\0",
            "(!(-a))",
        ),
        new Test(
            "a + b + c\\0",
            "((a + b) + c)",
        ),
        new Test(
            "a + b - c\\0",
            "((a + b) - c)",
        ),
        new Test(
            "a * b * c\\0",
            "((a * b) * c)",
        ),
        new Test(
            "a * b / c\\0",
            "((a * b) / c)",
        ),
        new Test(
            "a + b / c\\0",
            "(a + (b / c))",
        ),
        new Test(
            "a * b + c\\0",
            "((a * b) + c)",
        ),
        new Test(
            "a + b * c + d / e - f\\0",
            "(((a + (b * c)) + (d / e)) - f)",
        ),
        new Test(
            "3 + 4; -5 * 5\\0",
            "(3 + 4)((-5) * 5)",
        ),
        new Test(
            "5 > 4 == 3 < 4\\0",
            "((5 > 4) == (3 < 4))",
        ),
        new Test(
            "5 < 4 != 3 > 4\\0",
            "((5 < 4) != (3 > 4))",
        ),
        new Test(
            "3 + 4 * 5 == 3 * 1 + 4 * 5\\0",
            "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
        ),
        new Test(
            "true\\0",
            "true",
        ),
        new Test(
            "false\\0",
            "false",
        ),
        new Test(
            "3 > 5 == false\\0",
            "((3 > 5) == false)",
        ),
        new Test(
            "3 < 5 == true\\0",
            "((3 < 5) == true)",
        ),
        new Test(
            "1 + (2 + 3) + 4\\0",
            "((1 + (2 + 3)) + 4)",
        ),
        new Test(
            "(5 + 5) * 2\\0",
            "((5 + 5) * 2)",
        ),
        new Test(
            "2 / (5 + 5)\\0",
            "(2 / (5 + 5))",
        ),
        new Test(
            "(5 + 5) * 2 * (5 + 5)\\0",
            "(((5 + 5) * 2) * (5 + 5))",
        ),
        new Test(
            "-(5 + 5)\\0",
            "(-(5 + 5))",
        ),
        new Test(
            "!(true == true)\\0",
            "(!(true == true))",
        ),
        // new Test(
        //     "a + add(b * c) + d\\0",
        //     "((a + add((b * c))) + d)",
        // ),
        // new Test(
        //     "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))\\0",
        //     "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
        // ),
        // new Test(
        //     "add(a + b + c * d / f + g)\\0",
        //     "add((((a + b) + ((c * d) / f)) + g))",
        // ),
        // new Test(
        //     "a * [1, 2, 3, 4][b * c] * d\\0",
        //     "((a * ([1, 2, 3, 4][(b * c)])) * d)",
        // ),
        // new Test(
        //     "add(a * b[2], b[1], 2 * [1, 2][1])\\0",
        //     "add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))",
        // ),
    ];

    for (let i = 0; i < tests.length; i++) {
        const l = new Lexer(tests[i].input);
        const p = New(l);

        const program = p.parseProgram();
        CheckParseErrors(p);

        const actual = program.String();
        assertEquals(
            actual,
            tests[i].expected,
            `expected=${tests[i].expected}, got=${actual}`,
        );
    }
});

Deno.test("TestBooleanExpressions", () => {
    class Test {
        input: string;
        expectedBoolean: boolean;

        constructor(input: string, expectedBoolean: boolean) {
            this.input = input;
            this.expectedBoolean = expectedBoolean;
        }
    }

    const tests: Array<Test> = [
        new Test("true\\0", true),
        new Test("false\\0", false),
    ];

    for (let i = 0; i < tests.length; i++) {
        const l = new Lexer(tests[i].input);
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
            `program.statements[0] is not ExpressionStatement. got=${typeof program
                .statements[0]}`,
        );
        const stmt = program.statements[0];

        assert(
            IsBoolean(stmt.expression),
            `stmt.expression is not BooleanExpression. got=${typeof stmt
                .expression}`,
        );
        const bool = stmt.expression;

        assertEquals(
            bool.value,
            tests[i].expectedBoolean,
            `bool.value is not ${tests[i].expectedBoolean}. got=${bool.value}`,
        );
    }
});

Deno.test("TestIfExpressions", () => {
    const input = `if (x < y) { x }\\0`;

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
        `program.statements[0] is not ExpressionStatement. got=${typeof program
            .statements[0]}`,
    );
    const stmt = program.statements[0];

    assert(
        IsIfExpression(stmt.expression),
        `stmt.expression is not IfExpression. got=${typeof stmt.expression}`,
    );
    const exp = stmt.expression;

    assert(TestInfixExpression(exp.condition, "x", "<", "y"));

    assert(
        IsExpressionStatement(exp.consequence.statements[0]),
        `statements[0] is not ExpressionStatement. got=${typeof exp.condition}`,
    );
    const consequence = exp.consequence.statements[0];

    assert(TestIdentifier(consequence.expression, "x"));
    assertEquals(
        exp.alternative,
        null,
        `exp.alternative.statements was not null. got=${exp.alternative}`,
    );
});

Deno.test("TestIfElseExpressions", () => {
    const input = `if (x < y) { x } else { y }\\0`;

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
        `program.statements[0] is not ExpressionStatement. got=${typeof program
            .statements[0]}`,
    );
    const stmt = program.statements[0];

    assert(
        IsIfExpression(stmt.expression),
        `stmt.expression is not IfExpression. got=${typeof stmt.expression}`,
    );
    const exp = stmt.expression;

    assert(TestInfixExpression(exp.condition, "x", "<", "y"));

    assert(
        IsExpressionStatement(exp.consequence.statements[0]),
        `statements[0] is not ExpressionStatement. got=${typeof exp.condition}`,
    );
    const consequence = exp.consequence.statements[0];

    assert(TestIdentifier(consequence.expression, "x"));

    if (exp.alternative != null) {
        assert(
            IsExpressionStatement(exp.alternative.statements[0]),
            `statements[0] is not ExpressionStatement. got=${typeof exp
                .alternative}`,
        );
        const alternative = exp.alternative.statements[0];

        assert(TestIdentifier(alternative.expression, "y"));
    }
});

function CheckParseErrors(p: Parser): void {
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

function TestIntegerLiteral(
    exp: Expression | null,
    value: number | boolean,
): boolean {
    if (!IsIntegerLiteral(exp)) {
        console.error(`exp not IntegerLiteral. got=${typeof exp}`);
        return false;
    }
    const integ = exp;

    if (integ.value != value) {
        console.error(`integ.value not ${value}. got=${integ.value}`);
        return false;
    }

    if (integ.TokenLiteral() != value.toString()) {
        console.error(
            `integ.TokenLiteral not ${value}. got=${integ.TokenLiteral()}`,
        );
        return false;
    }

    return true;
}

function TestBooleanLiteral(exp: Expression | null, value: boolean): boolean {
    if (!IsBoolean(exp)) {
        console.error(`exp not Boolean. got=${typeof exp}`);
        return false;
    }
    const bo = exp;

    if (bo.value != value) {
        console.error(`bo.value not ${value}. got=${bo.value}`);
        return false;
    }

    if (bo.TokenLiteral() != value.toString()) {
        console.error(`bo.TokenLiteral not ${value}. got=${bo.TokenLiteral()}`);
        return false;
    }

    return true;
}

function TestIdentifier(exp: Expression | null, value: string): boolean {
    if (!IsIdentifier(exp)) {
        console.error(`exp not Identifier. got=${typeof exp}`);
        return false;
    }
    const ident = exp;

    if (ident.value != value) {
        console.error(`ident.value not ${value}. got=${ident.value}`);
        return false;
    }

    if (ident.TokenLiteral() != value) {
        console.error(
            `ident.TokenLiteral not ${value}. got=${ident.TokenLiteral()}`,
        );
        return false;
    }

    return true;
}

function TestLiteralExpression(
    exp: Expression | null,
    expected: number | string | boolean,
): boolean {
    switch (typeof expected) {
        case "number":
            return TestIntegerLiteral(exp, expected);
        case "string":
            return TestIdentifier(exp, expected);
        case "boolean":
            return TestBooleanLiteral(exp, expected);
        default:
            console.error(`type of exp not handled. got=${typeof exp}`);
            return false;
    }
}

function TestInfixExpression(
    exp: Expression | null,
    left: number | boolean | string,
    operator: string,
    right: number | boolean | string,
): boolean {
    if (!IsInfixExpression(exp)) {
        console.error(`exp is not InfixExpression. got=${typeof exp}`);
        return false;
    }
    const opExp = exp;

    if (!TestLiteralExpression(opExp.left, left)) {
        return false;
    }

    if (opExp.operator != operator) {
        console.error(`exp.operator is not ${operator}. got=${opExp.operator}`);
        return false;
    }

    if (!TestLiteralExpression(opExp.right, right)) {
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

function IsIntegerLiteral(e: Expression | null): e is IntegerLiteral {
    return e instanceof IntegerLiteral;
}

function IsPrefixExpression(e: Expression | null): e is PrefixExpression {
    return e instanceof PrefixExpression;
}

function IsInfixExpression(e: Expression | null): e is InfixExpression {
    return e instanceof InfixExpression;
}

function IsBoolean(e: Expression | null): e is Boolean {
    return e instanceof Boolean;
}

function IsIfExpression(e: Expression | null): e is IfExpression {
    return e instanceof IfExpression;
}
