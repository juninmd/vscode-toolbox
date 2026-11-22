import { expect, test } from "bun:test";

const run = (...args: string[]) => {
  const p = Bun.spawnSync(["bun", "run", "src/cli.ts", ...args]);
  return { code: p.exitCode, out: p.stdout.toString(), err: p.stderr.toString() };
};

test("--all combined with -c is a usage error, not a silent pass", () => {
  const r = run("abc", "--all", "-c", "0".repeat(64));
  expect(r.code).toBe(2);
  expect(r.err).toContain("--all cannot be combined with --check");
  expect(r.out).toBe("");
});

test("--all alone still lists every algorithm", () => {
  const r = run("abc", "--all");
  expect(r.code).toBe(0);
  expect(r.out).toContain("sha256");
});

test("positional text equal to an option value is still hashed", () => {
  const md5 = run("-a", "md5", "md5");
  expect(md5.code).toBe(0);
  expect(md5.out.trim()).toBe("1bc29b36f623ba82aaf6724fd3b16718"); // md5("md5")
  const sha = run("hello", "-a", "sha1");
  expect(sha.out.trim()).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"); // sha1("hello")
  expect(run("-c", "hello", "hello").code).toBe(1); // compared, not "give <text>"
test("-f --all hashes a file with every algo (single read) and matches the text digests", () => {
  const path = `${require("node:os").tmpdir()}/hashcheck-${process.pid}.txt`;
  require("node:fs").writeFileSync(path, "abc");
  const fromFile = run("-f", path, "--all");
  const fromText = run("abc", "--all");
  expect(fromFile.code).toBe(0);
  expect(fromFile.out).toBe(fromText.out);
  const sha256 = fromText.out.split("\n").find((l) => l.startsWith("sha256"))!.split(/\s+/)[1]!;
  expect(run("-f", path, "-c", sha256).code).toBe(0);
  expect(run("-f", path, "-c", "0".repeat(64)).code).toBe(1);
});
