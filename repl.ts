import { Token, TokenList } from "./token.ts";
import { Lexer } from "./lexer.ts";

const PROMPT: string = ">> "

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

        // for (const tok: Token = ; tok.type != TokenList.EOF; tok = l.nextToken()) {
        //     // await Deno.stdout.write(tok);
        //     console.log(`${tok}`);
        // }
    }
}
