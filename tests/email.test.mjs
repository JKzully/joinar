import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../lib/email.js", import.meta.url), "utf8");

test("transactional email checks Resend response errors", () => {
  assert.match(source, /const \{ data, error \} = await resend\.emails\.send/);
  assert.match(source, /if \(error\)/);
  assert.match(source, /return \{ success: true, id: data\?\.id \|\| null \}/);
});
