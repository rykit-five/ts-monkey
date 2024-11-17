import { assertEquals } from "jsr:@std/assert";
import { Token, TokenKind, TokenType } from "./token.ts";
import { Lexer } from "./lexer.ts";


Deno.test("next token test", () => {
    const input = "let five = 5;";

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
