import { Token, TokenType } from "../token/token.ts";
import { Lexer } from "../lexer/lexer.ts";
import { New, Parser } from "../parser/parser.ts";
import { evaluate } from "../evaluator/evaluator.ts";

const PROMPT: string = ">> ";

export async function start() {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    // TODO: 標準入力からEOFを受け付けて構文解析する
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

        const evaluated = evaluate(program);
        if (evaluated != null) {
            Deno.stdout.write(encoder.encode(evaluated.Inspect()));
            Deno.stdout.write(encoder.encode("\n"));
        }
    }
}

function printParseErrors(errors: string[]) {
    for (let i = 0; i < errors.length; i++) {
        console.log(`\t${errors[i]}\n`);
    }
}
