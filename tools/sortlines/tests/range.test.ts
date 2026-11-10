import { expect, test } from "bun:test";
import { selectionToLineRange } from "../src/range";

const p = (line: number, character: number) => ({ line, character });

test("selection ending at column 0 excludes the next line", () => {
  expect(selectionToLineRange(p(0, 0), p(3, 0))).toEqual({ startLine: 0, endLine: 2 });
});

test("other selections keep their end line", () => {
  expect(selectionToLineRange(p(0, 2), p(2, 1))).toEqual({ startLine: 0, endLine: 2 });
  expect(selectionToLineRange(p(0, 0), p(0, 3))).toEqual({ startLine: 0, endLine: 0 });
  expect(selectionToLineRange(p(1, 0), p(1, 0))).toEqual({ startLine: 1, endLine: 1 });
});
