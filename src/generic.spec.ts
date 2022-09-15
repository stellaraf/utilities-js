/* eslint-disable no-new */
import { Primitive } from "@sindresorhus/is";
import {
  isTruthy,
  objectHasProperty,
  fileFriendlyString,
  dateString,
  parseCommaSeparatedNumbers,
  urlQuery,
  toFormData,
  isNumberString,
  settleSplitPromises,
} from "./generic";
import { Entryable } from "./types";

describe.each(["a thing", 1, true, { one: 1 }, [1, 2]])("%s should be truthy", (item) => {
  test(String(item), () => {
    expect(isTruthy(item)).toBe(true);
  });
});

describe.each(["", NaN, false, null, undefined, {}, []])("%s should be falsey", (item) => {
  test(String(item), () => {
    expect(isTruthy(item)).toBe(false);
  });
});

describe("object property check", () => {
  class Test {
    iHaveThisMethod() {}
  }
  const t = new Test();
  it("has property", () => {
    expect(objectHasProperty(t, "iHaveThisMethod")).toBe(true);
  });

  it("does not have property", () => {
    expect(objectHasProperty(t, "iDoNotHaveThisMethod")).toBe(false);
  });

  it("has multiple properties", () => {
    expect(objectHasProperty({ one: 1, two: 2 }, "one", "two")).toBe(true);
  });

  it("is missing a property", () => {
    expect(objectHasProperty({ one: 1 }, "one", "two")).toBe(false);
  });
});

describe.each([
  ["Customer Name", "customer-name"],
  ["Customer", "customer"],
])("%s should be %s", (original, expected) => {
  it(`should be ${expected}`, () => {
    expect(fileFriendlyString(original)).toBe(expected);
  });
});

test("dateString should format correctly", () => {
  const date = new Date(1661437058530);
  expect(dateString(date)).toBe("20220825");
});

describe("comma separated numbers", () => {
  test("no spaces", () => {
    expect(parseCommaSeparatedNumbers("1,2,3")).toEqual([1, 2, 3]);
  });
  test("with spaces", () => {
    expect(parseCommaSeparatedNumbers("1, 2, 3")).toEqual([1, 2, 3]);
  });
  test("null is empty", () => {
    expect(parseCommaSeparatedNumbers(null)).toEqual([]);
  });
});

describe.each<[string, Entryable<Primitive>, string | undefined, string]>([
  ["/path/to/thing", { one: 1 }, undefined, "/path/to/thing?one=1"],
  ["/path/to/thing", { one: 1 }, "https://example.com", "https://example.com/path/to/thing?one=1"],
  ["/path/to/thing", new Map<string, string>([["one", "1"]]), undefined, "/path/to/thing?one=1"],
  ["/path/to/thing", [["one", "1"]], undefined, "/path/to/thing?one=1"],
  [
    "https://example.com/path/to/thing",
    [["one", "1"]],
    undefined,
    "https://example.com/path/to/thing?one=1",
  ],
])("urlQuery => %s %p %s", (url, query, baseUrl, expected) => {
  test(`returns ${expected}`, () => {
    expect(urlQuery(url, query, { baseUrl })).toBe(expected);
  });
});

test("urlQuery to throw error with bad baseUrl", () => {
  expect(() => urlQuery("/path/to/thing", {}, { baseUrl: "badbaseUrl" })).toThrow(
    TypeError("Invalid URL"),
  );
});

describe.each<[string, Entryable<Primitive>, string]>([
  ["Record", { one: 1, two: 2 }, "one=1&two=2"],
  [
    "Array",
    [
      ["one", 1],
      ["two", 2],
    ],
    "one=1&two=2",
  ],
  [
    "Map",
    new Map<string, Primitive>([
      ["one", 1],
      ["two", 2],
    ]),
    "one=1&two=2",
  ],
])("toFormData with %s from %p", (_, data, expected) => {
  test(`returns '${expected}'`, () => {
    expect(toFormData(data)).toBe(expected);
  });
});

describe("toFormData should throw an error", () => {
  test("with invalid type", () => {
    //@ts-expect-error
    expect(() => toFormData(() => {})).toThrow(TypeError);
  });
});

describe.each([
  ["1234", true],
  ["1two34", false],
  ["stuff", false],
])("isNumberString sees '%s' as %p", (value, expected) => {
  test(`returns ${expected}`, () => {
    expect(isNumberString(value)).toBe(expected);
  });
});

test("settleSplitPromises", async () => {
  const fn = async () => "from fn";
  const result = await settleSplitPromises([fn(), fn(), fn(), fn(), fn(), fn()], 2);
  expect(result.length).toBe(6);
  const expected = new Array(6).fill({ status: "fulfilled", value: "from fn" });
  expect(result).toEqual(expected);
});
