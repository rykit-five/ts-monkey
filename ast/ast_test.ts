import { assertEquals } from "jsr:@std/assert";
import { Identifier, LetStatement, Program } from "./ast.ts";
import { Token, TokenKind } from "../token/token.ts";

Deno.test("TestString", () => {
    const program = new Program();

    const ls = new LetStatement(new Token(TokenKind.LET, "let"));
    ls.name = new Identifier(new Token(TokenKind.IDENT, "myVar"), "myVar"),
        ls.value = new Identifier(
            new Token(TokenKind.IDENT, "anotherVar"),
            "anotherVar",
        ),
        program.statements.push(ls);

    assertEquals(
        program.String(),
        "let myVar = anotherVar;",
        `program.String() wrong. got=${program.String()}`,
    );
});
