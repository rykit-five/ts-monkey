import { assertEquals } from "jsr:@std/assert";
import { TokenType } from "../token/token.ts";
import { Lexer } from "./lexer.ts";

Deno.test("TestNextToken", () => {
    const input = `
let five = 5;
let ten = 10;

let add = fn(x, y) {
	x + y;
};

let result = add(five, ten);
!-/*5;
5 < 10 > 5;

if (5 < 10) {
	return true;
} else {
	return false;
}

10 == 10;
10 != 9;

"foobar"
"foo bar"
[1, 2];
{"foo": "bar"}
\\0
    `;

    class Test {
        expectedType: TokenType;
        expectedLiteral: string;

        constructor(type: TokenType, literal: string) {
            this.expectedType = type;
            this.expectedLiteral = literal;
        }
    }

    const tests: Test[] = [
        new Test(TokenType.LET, "let"),
        new Test(TokenType.IDENT, "five"),
        new Test(TokenType.ASSIGN, "="),
        new Test(TokenType.INT, "5"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.LET, "let"),
        new Test(TokenType.IDENT, "ten"),
        new Test(TokenType.ASSIGN, "="),
        new Test(TokenType.INT, "10"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.LET, "let"),
        new Test(TokenType.IDENT, "add"),
        new Test(TokenType.ASSIGN, "="),
        new Test(TokenType.FUNCTION, "fn"),
        new Test(TokenType.LPAREN, "("),
        new Test(TokenType.IDENT, "x"),
        new Test(TokenType.COMMA, ","),
        new Test(TokenType.IDENT, "y"),
        new Test(TokenType.RPAREN, ")"),
        new Test(TokenType.LBRACE, "{"),
        new Test(TokenType.IDENT, "x"),
        new Test(TokenType.PLUS, "+"),
        new Test(TokenType.IDENT, "y"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.RBRACE, "}"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.LET, "let"),
        new Test(TokenType.IDENT, "result"),
        new Test(TokenType.ASSIGN, "="),
        new Test(TokenType.IDENT, "add"),
        new Test(TokenType.LPAREN, "("),
        new Test(TokenType.IDENT, "five"),
        new Test(TokenType.COMMA, ","),
        new Test(TokenType.IDENT, "ten"),
        new Test(TokenType.RPAREN, ")"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.BANG, "!"),
        new Test(TokenType.MINUS, "-"),
        new Test(TokenType.SLASH, "/"),
        new Test(TokenType.ASTERISK, "*"),
        new Test(TokenType.INT, "5"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.INT, "5"),
        new Test(TokenType.LT, "<"),
        new Test(TokenType.INT, "10"),
        new Test(TokenType.GT, ">"),
        new Test(TokenType.INT, "5"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.IF, "if"),
        new Test(TokenType.LPAREN, "("),
        new Test(TokenType.INT, "5"),
        new Test(TokenType.LT, "<"),
        new Test(TokenType.INT, "10"),
        new Test(TokenType.RPAREN, ")"),
        new Test(TokenType.LBRACE, "{"),
        new Test(TokenType.RETURN, "return"),
        new Test(TokenType.TRUE, "true"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.RBRACE, "}"),
        new Test(TokenType.ELSE, "else"),
        new Test(TokenType.LBRACE, "{"),
        new Test(TokenType.RETURN, "return"),
        new Test(TokenType.FALSE, "false"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.RBRACE, "}"),
        new Test(TokenType.INT, "10"),
        new Test(TokenType.EQ, "=="),
        new Test(TokenType.INT, "10"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.INT, "10"),
        new Test(TokenType.NOT_EQ, "!="),
        new Test(TokenType.INT, "9"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.STRING, "foobar"),
        new Test(TokenType.STRING, "foo bar"),
        new Test(TokenType.LBRACKET, "["),
        new Test(TokenType.INT, "1"),
        new Test(TokenType.COMMA, ","),
        new Test(TokenType.INT, "2"),
        new Test(TokenType.RBRACKET, "]"),
        new Test(TokenType.SEMICOLON, ";"),
        new Test(TokenType.LBRACE, "{"),
        new Test(TokenType.STRING, "foo"),
        new Test(TokenType.COLON, ":"),
        new Test(TokenType.STRING, "bar"),
        new Test(TokenType.RBRACE, "}"),
    ];

    const l = new Lexer(input);

    for (let i = 0; i < tests.length; i++) {
        const tok = l.NextToken();

        assertEquals(
            tok.type,
            tests[i].expectedType,
            `tests[${i}] - tokentype wrong. expected=${
                tests[i].expectedType
            }, got=${tok.type}`,
        );

        assertEquals(
            tok.literal,
            tests[i].expectedLiteral,
            `tests[${i}] - literal wrong. expected=${
                tests[i].expectedLiteral
            }, got=${tok.literal}`,
        );
    }
});
