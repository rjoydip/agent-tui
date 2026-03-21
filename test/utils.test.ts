import { describe, test, expect } from "bun:test";
import isUnicodeSupported from "../src/utils";

describe("isUnicodeSupported", () => {
  test("is a function", () => {
    expect(typeof isUnicodeSupported).toBe("function");
  });

  test("returns a boolean", () => {
    const result = isUnicodeSupported();
    expect(typeof result).toBe("boolean");
  });
});
