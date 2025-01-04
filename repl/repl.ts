import { Lexer } from "../lexer/lexer.ts";
import { New } from "../parser/parser.ts";
import { evaluate } from "../evaluator/evaluator.ts";
import { NewEnvironment } from "../object/object.ts";

const PROMPT: string = ">> ";

export async function start() {
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const buffer = new Uint8Array(1024);
    const env = NewEnvironment();

    while (true) {
        Deno.stdout.write(encoder.encode(PROMPT));

        const bytesRead = await Deno.stdin.read(buffer);
        if (bytesRead === null) {
            Deno.stdout.write(encoder.encode("\n"));
            Deno.stdout.write(encoder.encode("Bye\n"));
            break;
        }

        const input = buffer.subarray(0, bytesRead);
        const line = decoder.decode(input) + "\\0"; // EOFを表す\\0を付与
        const l = new Lexer(line);
        const p = New(l);

        const program = p.parseProgram();
        if (p.errors.length != 0) {
            printParseErrors(p.errors);
            continue;
        }

        const evaluated = evaluate(program, env);
        if (evaluated != null) {
            Deno.stdout.write(encoder.encode(evaluated.Inspect()));
            Deno.stdout.write(encoder.encode("\n"));
        }
    }

    // TODO: 標準入力からEOFを受け付けて構文解析する
    // Deno.stdout.write(encoder.encode(PROMPT));
    // for await (const chunk of Deno.stdin.readable) {
    //     Deno.stdout.write(encoder.encode(PROMPT));

    //     const line = decoder.decode(chunk);
    //     const l = new Lexer(line);
    //     const p = New(l);

    //     const program = p.parseProgram();
    //     if (p.errors.length != 0) {
    //         printParseErrors(p.errors);
    //         continue;
    //     }

    //     const env = NewEnvironment();
    //     const evaluated = evaluate(program, env);
    //     if (evaluated != null) {
    //         Deno.stdout.write(encoder.encode(evaluated.Inspect()));
    //         Deno.stdout.write(encoder.encode("\n"));
    //     }
    // }
}

function printParseErrors(errors: string[]) {
    for (let i = 0; i < errors.length; i++) {
        console.log(`\t${errors[i]}\n`);
    }
}
