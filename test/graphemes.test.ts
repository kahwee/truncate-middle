import { afterEach, describe, expect, it, vi } from "vitest";
import truncateMiddle, { truncateMiddleGraphemes } from "../src/index";

afterEach(() => vi.unstubAllGlobals());

describe("truncateMiddleGraphemes", () => {
  it("keeps importing the legacy API safe without Intl", async () => {
    vi.stubGlobal("Intl", undefined);
    vi.resetModules();
    const api = await import("../src/index");
    expect(api.default("abcdef", 1, 1, "…")).toBe("a…f");
    expect(() => api.truncateMiddleGraphemes("abcdef", 1, 1)).toThrow("Intl.Segmenter");
  });

  it.each([
    ["👩‍💻abcdef👨‍👩‍👧‍👦", "👩‍💻…👨‍👩‍👧‍👦"],
    ["🇸🇬abcdef🇺🇸", "🇸🇬…🇺🇸"],
    ["e\u0301abcdefa\u0308", "e\u0301…a\u0308"],
    ["👍🏽abcdef✌️", "👍🏽…✌️"],
    ["😀abcdef🚀", "😀…🚀"],
  ])("keeps complete graphemes in %s", (input, expected) => {
    expect(truncateMiddleGraphemes(input, 1, 1, "…")).toBe(expected);
  });

  it.each([
    ["", 0, 0, ""],
    ["abc", 0, 0, "abc"],
    ["😀ab🚀", 1, 0, "😀…"],
    ["😀ab🚀", 0, 1, "…🚀"],
    ["😀ab🚀", 2, 2, "😀ab🚀"],
    ["😀ab🚀", 3, 2, "😀ab🚀"],
    ["😀ab🚀", 5, 0, "😀ab🚀"],
    ["😀ab🚀", 0, 5, "😀ab🚀"],
    ["😀ab🚀", 0.49, 0.49, "😀ab🚀"],
    ["😀ab🚀", 0.5, 0.5, "😀…🚀"],
    ["😀ab🚀", 1.5, 1.5, "😀ab🚀"],
    ["😀ab🚀", -0, 1, "…🚀"],
    ["😀ab🚀", Number.MAX_VALUE, Number.MAX_VALUE, "😀ab🚀"],
  ])("handles %s with lengths %s and %s", (input, front, back, expected) => {
    expect(truncateMiddleGraphemes(input, front, back, "…")).toBe(expected);
  });

  it("preserves literal separators, default arguments, and decomposed text", () => {
    expect(truncateMiddleGraphemes("😀ab🚀", 1, 1)).toBe("😀&hellip;🚀");
    expect(truncateMiddleGraphemes("😀ab🚀", 1, 1, "")).toBe("😀🚀");
    expect(truncateMiddleGraphemes("😀ab🚀")).toBe("😀ab🚀");
    expect(truncateMiddleGraphemes("e\u0301abc", 1, 0, "--")).toBe("e\u0301--");
  });

  it.each([null, undefined])("returns an empty string for %s before other checks", (input) => {
    vi.stubGlobal("Intl", undefined);
    expect(truncateMiddleGraphemes(input, Number.NaN, -1)).toBe("");
  });

  it.each([-1, -0.1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects invalid front or back length %s before rounding",
    (length) => {
      expect(() => truncateMiddleGraphemes("abcdef", length, 1)).toThrow(RangeError);
      expect(() => truncateMiddleGraphemes("abcdef", 1, length)).toThrow(RangeError);
      expect(() => truncateMiddleGraphemes("", length, 0)).toThrow(RangeError);
    }
  );

  it("does not coerce invalid argument types", () => {
    expect(() => truncateMiddleGraphemes(42 as unknown as string, 1, 1)).toThrow(TypeError);
    expect(() => truncateMiddleGraphemes("abcdef", "1" as unknown as number, 1)).toThrow(
      RangeError
    );
  });

  it.each([undefined, null, {}, { Segmenter: null }])(
    "fails clearly without Intl.Segmenter, without affecting the legacy API",
    (intl) => {
      vi.stubGlobal("Intl", intl);
      expect(() => truncateMiddleGraphemes("😀ab🚀", 1, 1)).toThrow(
        "truncateMiddleGraphemes requires Intl.Segmenter"
      );
      expect(() => truncateMiddleGraphemes("")).toThrow("Intl.Segmenter");
      expect(() => truncateMiddleGraphemes("unchanged")).toThrow("Intl.Segmenter");
      expect(truncateMiddle("😀abcd", 1, 1, "…")).toBe("\ud83d…d");
    }
  );
});

describe("grapheme boundary traversal", () => {
  it("matches full segmentation across adversarial text and retained lengths", () => {
    const inputs = [
      "",
      "abc",
      "👩‍💻e\u0301🇸🇬x👍🏽",
      "\r\nabc\r\n",
      "\ud800ab\udc00",
      "क्षabc",
      "🇦🇧🇨🇩🇪",
    ];
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    for (const input of inputs) {
      const clusters = Array.from(segmenter.segment(input), ({ segment }) => segment);
      for (let front = 0; front <= clusters.length + 1; front++) {
        for (let back = 0; back <= clusters.length + 1; back++) {
          const expected =
            (front === 0 && back === 0) || front + back >= clusters.length
              ? input
              : clusters.slice(0, front).join("") +
                "…" +
                (back === 0 ? "" : clusters.slice(-back).join(""));
          expect(truncateMiddleGraphemes(input, front, back, "…")).toBe(expected);
        }
      }
    }
  });

  it("keeps both ends of a large input without materializing a cluster array", () => {
    expect(truncateMiddleGraphemes(`👩‍💻${"x".repeat(100000)}🇸🇬`, 1, 1, "…")).toBe("👩‍💻…🇸🇬");
  });
});
