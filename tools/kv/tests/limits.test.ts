import { expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { KVStore } from "../src/store";

process.env.KV_TOKEN = "t";
process.env.MAX_VALUE_BYTES = "16";
process.env.DATA_DIR ??= mkdtempSync(join(tmpdir(), "kv-"));
const { app } = await import("../src/index");
const put = (body: string) =>
  app.request("/api/kv/k", { method: "PUT", body, headers: { authorization: "Bearer t" } });

test("value limit counts UTF-8 bytes, not characters", async () => {
  // 11 characters but 20 bytes: passed the old raw.length check.
  expect((await put(`"${"ã".repeat(9)}"`)).status).toBe(413);
  expect((await put(`"${"a".repeat(9)}"`)).status).not.toBe(413);
});

test("list reports the value size in bytes", async () => {
  const s = new KVStore(false);
  await s.set("acc", "ação");
  expect(s.list()[0]!.bytes).toBe(Buffer.byteLength('"ação"')); // 8, not 6
});
