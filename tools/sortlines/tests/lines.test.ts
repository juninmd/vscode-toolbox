import { test, expect } from "bun:test";
import { naturalCompare, sortLines, unique, reverse, shuffle, splitLines, joinLines } from "../src/lines.js";

test("naturalCompare orders numbers within strings", () => {
  const arr = ["file10", "file2", "file1"];
  expect([...arr].sort(naturalCompare)).toEqual(["file1", "file2", "file10"]);
});

test("sortLines: default, insensitive, descending", () => {
  expect(sortLines(["b", "A", "c"])).toEqual(["A", "b", "c"]); // localeCompare
  expect(sortLines(["b", "A", "c"], { caseInsensitive: true })).toEqual(["A", "b", "c"]);
  expect(sortLines(["a", "b", "c"], { descending: true })).toEqual(["c", "b", "a"]);
});

test("sortLines natural vs lexical", () => {
  expect(sortLines(["x10", "x9", "x1"], { natural: true })).toEqual(["x1", "x9", "x10"]);
  expect(sortLines(["x10", "x9", "x1"])).toEqual(["x1", "x10", "x9"]); // lexical
});

test("unique preserves first occurrence order", () => {
  expect(unique(["a", "b", "a", "c", "b"])).toEqual(["a", "b", "c"]);
});

test("reverse", () => {
  expect(reverse(["a", "b", "c"])).toEqual(["c", "b", "a"]);
});

test("shuffle is a permutation and deterministic with seeded rng", () => {
  const input = ["a", "b", "c", "d", "e"];
  let seed = 0;
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out = shuffle(input, rng);
  expect(out.slice().sort()).toEqual(input.slice().sort()); // same multiset
  expect(out.length).toBe(input.length);
  // does not mutate input
  expect(input).toEqual(["a", "b", "c", "d", "e"]);
});

test("splitLines/joinLines keep the final line break out of the sort", () => {
  const { lines, trailingNewline } = splitLines("b\na\n");
  expect(joinLines(sortLines(lines), "\n", trailingNewline)).toBe("a\nb\n");
});

test("splitLines/joinLines handle CRLF, no final break and empty text", () => {
  const crlf = splitLines("b\r\na\r\n");
  expect(joinLines(sortLines(crlf.lines), "\r\n", crlf.trailingNewline)).toBe("a\r\nb\r\n");
  const bare = splitLines("b\na");
  expect(joinLines(sortLines(bare.lines), "\n", bare.trailingNewline)).toBe("a\nb");
  const empty = splitLines("");
  expect(joinLines(empty.lines, "\n", empty.trailingNewline)).toBe("");
});
