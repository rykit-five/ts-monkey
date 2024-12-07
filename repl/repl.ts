import { Token, TokenType } from "../token/token.ts";
import { Lexer } from "../lexer/lexer.ts";

const PROMPT: string = ">> ";

export async function start() {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    Deno.stdout.write(encoder.encode(PROMPT));
    for await (const chunk of Deno.stdin.readable) {
        Deno.stdout.write(encoder.encode(PROMPT));
        const line = decoder.decode(chunk);
        // if (!line) {
        //     return;
        // }

        const l = new Lexer(line);

        for (
            let tok: Token = l.NextToken();
            tok.type != TokenType.EOF;
            tok = l.NextToken()
        ) {
            // await Deno.stdout.write(tok);
            console.log(`{Type: ${tok.type} Literal: ${tok.literal}}`);
        }
    }
}
