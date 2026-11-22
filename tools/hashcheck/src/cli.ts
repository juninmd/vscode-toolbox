#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { ALGOS, isAlgo, hashString, verify, algoFromLength, type Algo } from "./hash";

const C = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

const HELP = `hashcheck — hash & verify

Usage:
  hashcheck <text> [-a <algo>] [--all]
  hashcheck -f <file> [-a <algo>] [-c <expected>]

Options:
  -a, --algo <algo>   ${ALGOS.join(" | ")}   (default: sha256)
  -f, --file <path>   hash a file (streamed)
  -c, --check <hex>   verify against an expected digest (algo auto-detected)
  --all               print md5/sha1/sha256/sha512 (cannot be combined with -c)
  -h, --help`;

function opt(argv: string[], ...names: string[]): string | undefined {
  for (const n of names) {
    const i = argv.indexOf(n);
    if (i > -1) return argv[i + 1];
  }
  return undefined;
}

/** Hashes a file with every algo in one streamed read. */
function hashFileMany(path: string, algos: readonly Algo[]): Promise<Record<Algo, string>> {
  return new Promise((resolve, reject) => {
    const hs = algos.map((a) => [a, createHash(a)] as const);
    createReadStream(path)
      .on("data", (d) => {
        for (const [, h] of hs) h.update(d);
      })
      .on("end", () => resolve(Object.fromEntries(hs.map(([a, h]) => [a, h.digest("hex")])) as Record<Algo, string>))
      .on("error", reject);
  });
}

async function main(argv: string[]): Promise<number> {
  if (argv.includes("-h") || argv.includes("--help") || argv.length === 0) {
    console.log(HELP);
    return argv.length === 0 ? 2 : 0;
  }

  const algoArg = opt(argv, "-a", "--algo");
  if (algoArg && !isAlgo(algoArg)) {
    console.error(C.red(`error: unknown algo "${algoArg}" (${ALGOS.join(", ")})`));
    return 2;
  }
  const algo: Algo = (algoArg as Algo) ?? "sha256";
  const file = opt(argv, "-f", "--file");
  const check = opt(argv, "-c", "--check");
  const all = argv.includes("--all");
  if (all && check !== undefined) {
    console.error(C.red("error: --all cannot be combined with --check"));
    return 2;
  }

  // Positional text = first non-flag arg that is not the value right after a value-taking option.
  // Compare positions, not values: `-a md5 md5` must still hash the text "md5".
  const VALUE_OPTS = new Set(["-a", "--algo", "-f", "--file", "-c", "--check"]);
  const text = argv.find((a, i) => !a.startsWith("-") && !VALUE_OPTS.has(argv[i - 1] ?? ""));

  if (file === undefined && text === undefined) {
    console.error(C.red("error: give <text> or -f <file>"));
    return 2;
  }
  // One read of the file per run: --all hashes every algo in the same pass, -c only the algo it compares.
  const algos: readonly Algo[] = all ? ALGOS : [check !== undefined ? (algoFromLength(check) ?? algo) : algo];
  let digests: Record<Algo, string>;
  try {
    digests = file
      ? await hashFileMany(file, algos)
      : (Object.fromEntries(algos.map((a) => [a, hashString(a, text!)])) as Record<Algo, string>);
  } catch (err) {
    console.error(C.red(`error: ${err instanceof Error ? err.message : err}`));
    return 1;
  }

  if (all) {
    for (const a of ALGOS) console.log(`${a.padEnd(7)} ${digests[a]}`);
    return 0;
  }

  const [only] = algos as [Algo];
  if (check !== undefined) {
    const actual = digests[only];
    const ok = verify(actual, check);
    console.log(`${only}: ${ok ? C.green("MATCH ✓") : C.red("MISMATCH ✗")}`);
    if (!ok) console.log(C.dim(`  expected ${check.trim().toLowerCase()}\n  actual   ${actual}`));
    return ok ? 0 : 1;
  }

  console.log(digests[only]);
  return 0;
}

main(process.argv.slice(2)).then((c) => process.exit(c));
