/* Ref. https://docs.deno.com/runtime/fundamentals/testing/ */

import { assertEquals } from "jsr:@std/assert";

Deno.test("simple test", () => {
    const x = 1 + 2;
    assertEquals(x, 3);
});

import { delay } from "jsr:@std/async";

Deno.test("async test", async () => {
  const x = 1 + 2;
  await delay(1000);
  assertEquals(x, 3);
});

Deno.test({
    name: "read file test",
    permissions: { read: true },
    fn: () => {
        const data = Deno.readTextFileSync("./somefile.txt");
        assertEquals(data, "expected content");
    },
})
