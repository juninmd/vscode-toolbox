import { test, expect } from "bun:test";
import { splitWords, convert, TARGETS } from "../src/cases.js";

test("splitWords handles every input style", () => {
  expect(splitWords("helloWorld")).toEqual(["hello", "world"]);
  expect(splitWords("HelloWorld")).toEqual(["hello", "world"]);
  expect(splitWords("hello_world")).toEqual(["hello", "world"]);
  expect(splitWords("hello-world")).toEqual(["hello", "world"]);
  expect(splitWords("HELLO_WORLD")).toEqual(["hello", "world"]);
  expect(splitWords("hello world")).toEqual(["hello", "world"]);
  expect(splitWords("HTTPServer")).toEqual(["http", "server"]);
  expect(splitWords("getURLFromID")).toEqual(["get", "url", "from", "id"]);
});

test("convert to each target", () => {
  expect(convert("hello world", "camel")).toBe("helloWorld");
  expect(convert("hello world", "pascal")).toBe("HelloWorld");
  expect(convert("helloWorld", "snake")).toBe("hello_world");
  expect(convert("helloWorld", "kebab")).toBe("hello-world");
  expect(convert("helloWorld", "constant")).toBe("HELLO_WORLD");
  expect(convert("helloWorld", "dot")).toBe("hello.world");
  expect(convert("hello_world", "title")).toBe("Hello World");
  expect(convert("hello_world", "sentence")).toBe("Hello world");
});

test("round trips through canonical forms", () => {
  const original = "myVariableName";
  expect(convert(convert(original, "snake"), "camel")).toBe(original);
  expect(convert(convert(original, "kebab"), "camel")).toBe(original);
  expect(convert(convert(original, "constant"), "camel")).toBe(original);
});

test("separator-only selections are kept, not erased", () => {
  expect(convert("___", "camel")).toBe("___");
  expect(convert("   ", "snake")).toBe("   ");
  expect(convert("...", "title")).toBe("...");
  expect(convert("", "snake")).toBe("");
});

test("unknown target returns input unchanged", () => {
  expect(convert("abc", "nope")).toBe("abc");
});

test("all TARGETS are convertible", () => {
  for (const t of TARGETS) expect(typeof convert("some value", t)).toBe("string");
});
