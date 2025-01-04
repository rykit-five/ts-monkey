import { start } from "./repl/repl.ts";

const encoder = new TextEncoder();

Deno.stdout.write(
    encoder.encode("Hello, This is the tsmonkey programming language!\n"),
);
Deno.stdout.write(encoder.encode("Feel free to type in commands\n"));

start();
