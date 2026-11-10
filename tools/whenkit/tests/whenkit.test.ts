import { test, expect } from "bun:test";
import { parseDuration, formatDuration, humanize, toUnit } from "../src/index";

test("parseDuration: compound and units", () => {
  expect(parseDuration("1h30m")).toBe(5_400_000);
  expect(parseDuration("2.5h")).toBe(9_000_000);
  expect(parseDuration("90 m")).toBe(5_400_000);
  expect(parseDuration("1w")).toBe(604_800_000);
  expect(parseDuration("-1d")).toBe(-86_400_000);
});

test("parseDuration: bare numbers are ms; number passthrough", () => {
  expect(parseDuration("500")).toBe(500);
  expect(parseDuration(1234)).toBe(1234);
});

test("parseDuration: rejects garbage", () => {
  expect(() => parseDuration("")).toThrow();
  expect(() => parseDuration("banana")).toThrow();
  expect(() => parseDuration("5 months")).toThrow();
  expect(() => parseDuration("1h foo 30m")).toThrow();
});

test("formatDuration: compact + parts cap", () => {
  expect(formatDuration(5_400_000)).toBe("1h 30m");
  expect(formatDuration(90_061_000, { parts: 2 })).toBe("1d 1h");
  expect(formatDuration(0)).toBe("0ms");
  expect(formatDuration(-5_400_000)).toBe("-1h 30m");
  expect(formatDuration(1_500, { separator: "" })).toBe("1s500ms");
});

test("parse/format round-trip", () => {
  const ms = parseDuration("3d 4h 5m");
  expect(formatDuration(ms)).toBe("3d 4h 5m");
});

test("humanize: past, future, now", () => {
  const now = new Date("2026-07-15T12:00:00Z").getTime();
  expect(humanize(now - 3 * 3_600_000, now)).toBe("3 hours ago");
  expect(humanize(now + 2 * 86_400_000, now)).toBe("in 2 days");
  expect(humanize(now - 1 * 60_000, now)).toBe("1 minute ago");
  expect(humanize(now - 500, now)).toBe("just now");
});

test("toUnit converts", () => {
  expect(toUnit("2h", "m")).toBe(120);
  expect(toUnit("1d", "h")).toBe(24);
});

test("humanize: invalid dates throw instead of 'just now'", () => {
  expect(() => humanize(new Date("nope"))).toThrow();
  expect(() => humanize(NaN, 0)).toThrow();
  expect(() => humanize(0, new Date("nope"))).toThrow();
});
