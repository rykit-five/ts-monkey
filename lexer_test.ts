import { assertEquals } from "jsr:@std/assert";
import { Token, TokenKind, TokenType } from "./token.ts";
import { Lexer } from "./lexer.ts";


Deno.test("next token test", () => {
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
    `;

    class Test {
        expectedType: TokenType;
        expectedLiteral: string;

        constructor(type_: TokenType, literal: string) {
            this.expectedType = type_;
            this.expectedLiteral = literal;
        }
    }

    const tests: Test[] = [
        new Test(TokenKind.LET, "let"),
        new Test(TokenKind.IDENT, "five"),
        new Test(TokenKind.ASSIGN, "="),
        new Test(TokenKind.INT, "5"),
        new Test(TokenKind.SEMICOLON, ";"),
        new Test(TokenKind.LET, "let"),
        new Test(TokenKind.IDENT, "ten"),
        new Test(TokenKind.ASSIGN, "="),
        new Test(TokenKind.INT, "10"),
        new Test(TokenKind.SEMICOLON, ";"),
        new Test(TokenKind.LET, "let"),
		new Test(TokenKind.IDENT, "add"),
		new Test(TokenKind.ASSIGN, "="),
		new Test(TokenKind.FUNCTION, "fn"),
		new Test(TokenKind.LPAREN, "("),
		new Test(TokenKind.IDENT, "x"),
		new Test(TokenKind.COMMA, ","),
		new Test(TokenKind.IDENT, "y"),
		new Test(TokenKind.RPAREN, ")"),
		new Test(TokenKind.LBRACE, "{"),
		new Test(TokenKind.IDENT, "x"),
		new Test(TokenKind.PLUS, "+"),
		new Test(TokenKind.IDENT, "y"),
		new Test(TokenKind.SEMICOLON, ";"),
		new Test(TokenKind.RBRACE, "}"),
		new Test(TokenKind.SEMICOLON, ";"),
        new Test(TokenKind.LET, "let"),
		new Test(TokenKind.IDENT, "result"),
		new Test(TokenKind.ASSIGN, "="),
		new Test(TokenKind.IDENT, "add"),
		new Test(TokenKind.LPAREN, "("),
		new Test(TokenKind.IDENT, "five"),
		new Test(TokenKind.COMMA, ","),
		new Test(TokenKind.IDENT, "ten"),
		new Test(TokenKind.RPAREN, ")"),
		new Test(TokenKind.SEMICOLON, ";"),
		new Test(TokenKind.BANG, "!"),
		new Test(TokenKind.MINUS, "-"),
		new Test(TokenKind.SLASH, "/"),
		new Test(TokenKind.ASTERISK, "*"),
		new Test(TokenKind.INT, "5"),
		new Test(TokenKind.SEMICOLON, ";"),
		new Test(TokenKind.INT, "5"),
		new Test(TokenKind.LT, "<"),
		new Test(TokenKind.INT, "10"),
		new Test(TokenKind.GT, ">"),
		new Test(TokenKind.INT, "5"),
		new Test(TokenKind.SEMICOLON, ";"),
		new Test(TokenKind.IF, "if"),
		new Test(TokenKind.LPAREN, "("),
		new Test(TokenKind.INT, "5"),
		new Test(TokenKind.LT, "<"),
		new Test(TokenKind.INT, "10"),
		new Test(TokenKind.RPAREN, ")"),
		new Test(TokenKind.LBRACE, "{"),
		new Test(TokenKind.RETURN, "return"),
		new Test(TokenKind.TRUE, "true"),
		new Test(TokenKind.SEMICOLON, ";"),
		new Test(TokenKind.RBRACE, "}"),
		new Test(TokenKind.ELSE, "else"),
		new Test(TokenKind.LBRACE, "{"),
		new Test(TokenKind.RETURN, "return"),
		new Test(TokenKind.FALSE, "false"),
		new Test(TokenKind.SEMICOLON, ";"),
		new Test(TokenKind.RBRACE, "}"),
		new Test(TokenKind.INT, "10"),
		new Test(TokenKind.EQ, "=="),
		new Test(TokenKind.INT, "10"),
		new Test(TokenKind.SEMICOLON, ";"),
		new Test(TokenKind.INT, "10"),
		new Test(TokenKind.NOT_EQ, "!="),
		new Test(TokenKind.INT, "9"),
		new Test(TokenKind.SEMICOLON, ";"),
		new Test(TokenKind.STRING, "foobar"),
		new Test(TokenKind.STRING, "foo bar"),
		new Test(TokenKind.LBRACKET, "["),
		new Test(TokenKind.INT, "1"),
		new Test(TokenKind.COMMA, ","),
		new Test(TokenKind.INT, "2"),
		new Test(TokenKind.RBRACKET, "]"),
		new Test(TokenKind.SEMICOLON, ";"),
		new Test(TokenKind.LBRACE, "{"),
		new Test(TokenKind.STRING, "foo"),
		new Test(TokenKind.COLON, ":"),
		new Test(TokenKind.STRING, "bar"),
		new Test(TokenKind.RBRACE, "}"),
		new Test(TokenKind.EOF, ""),
    ];

    const l = new Lexer(input);

    for (let i = 0; i < tests.length; i++) {
        const tok = l.NextToken();
        
        assertEquals(tok.type_, tests[i].expectedType,
            `tests[${i}] - tokentype wrong. expected=${tests[i].expectedType}, got=${tok.type_}`
        );
        
        assertEquals(tok.literal, tests[i].expectedLiteral,
            `tests[${i}] - literal wrong. expected=${tests[i].expectedLiteral}, got=${tok.literal}`
        );
    }
});
