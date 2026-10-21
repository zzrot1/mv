import { describe, expect, it } from "vitest";

import {
  clampNumber,
  countDecimals,
  formatNumber,
  isPartialNumber,
  normalizeNumber,
  parseNumber,
  roundTo,
  stepNumber,
} from "../domain/number";
import {
  composeValidators,
  email,
  isBlank,
  maxLength,
  minLength,
  pattern,
  range,
  required,
} from "../domain/validation";

describe("parseNumber", () => {
  it.each([
    ["12", 12],
    ["-3.5", -3.5],
    ["12,5", 12.5],
    [" 7 ", 7],
    [".5", 0.5],
    ["5.", 5],
  ])("reads %j as %d", (text, expected) => {
    expect(parseNumber(text)).toBe(expected);
  });

  it.each(["", "-", ".", "abc", "1.2.3", "1e5", "--1"])("rejects %j", (text) => {
    expect(parseNumber(text)).toBeNull();
  });
});

describe("isPartialNumber", () => {
  it("accepts what can still become a number", () => {
    for (const text of ["", "-", "12", "12,", "-0.", ".5"]) {
      expect(isPartialNumber(text)).toBe(true);
    }
  });

  it("rejects what never can", () => {
    for (const text of ["a", "1-", "1.2.3", "1,2,3", "+1"]) {
      expect(isPartialNumber(text)).toBe(false);
    }
  });
});

describe("rounding and bounds", () => {
  it("rounds negative numbers like positive ones", () => {
    expect(roundTo(-1.005, 2)).toBe(-1.01);
    expect(roundTo(-2.5, 0)).toBe(-3);
  });

  it("counts decimals, including exponent notation", () => {
    expect(countDecimals(1)).toBe(0);
    expect(countDecimals(0.25)).toBe(2);
    expect(countDecimals(1e-7)).toBe(7);
    expect(countDecimals(1.5e-7)).toBe(8);
    expect(countDecimals(Number.NaN)).toBe(0);
  });

  it("rounds without float drift", () => {
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(12.3456, 0)).toBe(12);
    expect(roundTo(10.075, 2)).toBe(10.08);
    expect(roundTo(2.675, 2)).toBe(2.68);
  });

  it("clamps to optional bounds", () => {
    expect(clampNumber(5, { max: 3 })).toBe(3);
    expect(clampNumber(-2, { min: 0 })).toBe(0);
    expect(clampNumber(2, {})).toBe(2);
  });
});

describe("stepNumber", () => {
  it("steps with the precision of the step", () => {
    expect(stepNumber(0.1, { direction: 1, step: 0.2 })).toBe(0.3);
    expect(stepNumber(1, { direction: -1, step: 0.25 })).toBe(0.75);
  });

  it("stays inside the bounds", () => {
    expect(stepNumber(9, { direction: 1, max: 10, step: 5 })).toBe(10);
    expect(stepNumber(1, { direction: -1, min: 0, step: 5 })).toBe(0);
  });

  it("starts an empty field from min, or 0", () => {
    expect(stepNumber(null, { direction: 1, min: 5, step: 1 })).toBe(5);
    expect(stepNumber(null, { direction: -1, step: 1 })).toBe(0);
  });

  it("uses an explicit precision", () => {
    expect(stepNumber(1, { direction: 1, precision: 0, step: 0.4 })).toBe(1);
  });
});

describe("normalizeNumber and formatNumber", () => {
  it("rounds and clamps on blur", () => {
    expect(normalizeNumber(3.14159, { precision: 2 })).toBe(3.14);
    expect(normalizeNumber(120, { max: 100 })).toBe(100);
    expect(normalizeNumber(null, { max: 1 })).toBeNull();
  });

  it("formats for display", () => {
    expect(formatNumber(null)).toBe("");
    expect(formatNumber(2.5)).toBe("2.5");
    expect(formatNumber(2.5, 2)).toBe("2.50");
    expect(formatNumber(10.075, 2)).toBe("10.08");
    expect(formatNumber(-0.001, 2)).toBe("0.00");
  });
});

describe("validation", () => {
  it("answers the same way every time, even with a global regex, and caps email length", () => {
    const digits = pattern(/\d/g, "Digits only");

    expect([digits("a1"), digits("a1"), digits("a1")]).toEqual([undefined, undefined, undefined]);
    expect(email("Too long")("a".repeat(250) + "@b.co")).toBe("Too long");
  });

  it("treats null, undefined, false and blank text as empty", () => {
    expect([null, undefined, false, "  "].every(isBlank)).toBe(true);
    expect([0, "a", true].some(isBlank)).toBe(false);
  });

  it("required rejects empty values only", () => {
    const validate = required("Required");
    expect(validate("")).toBe("Required");
    expect(validate("x")).toBeUndefined();
  });

  it("length, pattern and email skip empty values", () => {
    expect(minLength(3, "Too short")("ab")).toBe("Too short");
    expect(minLength(3, "Too short")("")).toBeUndefined();
    expect(maxLength(3, "Too long")("abcd")).toBe("Too long");
    expect(maxLength(3, "Too long")("abc")).toBeUndefined();
    expect(pattern(/^\d+$/, "Digits")("12a")).toBe("Digits");
    expect(email("Email")("ana@example.com")).toBeUndefined();
    expect(email("Email")("ana@example")).toBe("Email");
    expect(email("Email")("")).toBeUndefined();
  });

  it("range checks numbers against optional bounds", () => {
    const validate = range({ max: 10, min: 1 }, "Between 1 and 10");
    expect(validate(0)).toBe("Between 1 and 10");
    expect(validate(11)).toBe("Between 1 and 10");
    expect(validate(5)).toBeUndefined();
    expect(validate(null)).toBeUndefined();
  });

  it("compose stops at the first error", () => {
    const validate = composeValidators(required("Required"), minLength(3, "Too short"));
    expect(validate("")).toBe("Required");
    expect(validate("ab")).toBe("Too short");
    expect(validate("abc")).toBeUndefined();
  });
});
