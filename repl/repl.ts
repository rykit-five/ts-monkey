import { Token, TokenType } from "../token/token.ts";
import { Lexer } from "../lexer/lexer.ts";
import { New, Parser } from "../parser/parser.ts";

const PROMPT: string = ">> ";

export async function start() {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    Deno.stdout.write(encoder.encode(PROMPT));
    for await (const chunk of Deno.stdin.readable) {
        Deno.stdout.write(encoder.encode(PROMPT));

        const line = decoder.decode(chunk);
        const l = new Lexer(line);
        const p = New(l);

        const program = p.parseProgram();
        if (p.errors.length != 0) {
            printParseErrors(p.errors);
            continue;
        }

        Deno.stdout.write(encoder.encode(program.String()));
        Deno.stdout.write(encoder.encode("\n"));

        // for (
        //     let tok: Token = l.NextToken();
        //     tok.type != TokenType.EOF;
        //     tok = l.NextToken()
        // ) {
        //     // await Deno.stdout.write(tok);
        //     console.log(`{Type: ${tok.type} Literal: ${tok.literal}}`);
        // }
    }
}

function printParseErrors(errors: string[]) {
    for (let i = 0; i < errors.length; i++) {
        console.log(`\t${errors[i]}\n`);
    }
}
