import {
  escapeHtml,
  FieldProperties,
  formatByType,
  generateUIModelID,
  HTML5InputTypes,
  parseToNumber,
  parseValueByType,
  revertHtml,
  UIKeys,
} from "../../src";
import { id } from "@decaf-ts/db-decorators";
import { Model } from "@decaf-ts/decorator-validation";

class TestModel extends Model {
  @id()
  id: number = 0;

  constructor(id: number) {
    super();
    this.id = id;
  }
}

class TestNoIdModel extends Model {
  id: number = 0;

  constructor(id: number) {
    super();
    this.id = id;
  }
}

describe("UI Utils", () => {
  describe("formatByType", () => {
    it("should format a date if type is UIKeys.DATE", () => {
      const date = new Date();
      date.setFullYear(2024);
      date.setMonth(0);
      date.setDate(1);
      const result = formatByType(UIKeys.DATE, date, "yyyy-MM-dd");
      expect(typeof result).toBe("string");
      expect(result).toEqual("2024-01-01");
    });

    it("should return the value directly if type is not DATE", () => {
      const random = Math.random();
      const result = formatByType("text", random);
      expect(result).toBe(random);
    });
  });

  describe("parseValueByType", () => {
    it("should convert a numeric string to a number", () => {
      const result = parseValueByType(
        HTML5InputTypes.NUMBER,
        "42",
        {} as FieldProperties
      );
      expect(result).toBe(42);
    });

    it("should convert a numeric timestamp to Date", () => {
      const timestamp = Date.now();
      const result = parseValueByType(
        HTML5InputTypes.DATE,
        timestamp,
        {} as FieldProperties
      );
      expect(result).toBeInstanceOf(Date);
      expect((result as Date).getTime()).toBe(timestamp);
    });

    it("should parse a string date with format", () => {
      const result = parseValueByType(HTML5InputTypes.DATE, "2024-05-16", {
        format: "yyyy-MM-dd",
      } as FieldProperties);
      expect(result).toBeInstanceOf(Date);
    });

    it("should escape HTML if type is string", () => {
      const html = "<b>&Test</b>";
      const result = parseValueByType("text", html, {} as FieldProperties);
      expect(result).toBe("&lt;b&gt;&amp;Test&lt;/b&gt;");
    });

    it("should throw an error if value can't be parsed", () => {
      expect(() => {
        parseValueByType("number", {} as any, {} as FieldProperties);
      }).toThrowError(/Failed to parse value/);
    });
  });

  describe("parseToNumber", () => {
    it("should return the value if it's already a number", () => {
      expect(parseToNumber(10)).toBe(10);
    });

    it("should parse a numeric string to number", () => {
      expect(parseToNumber("15.5")).toBe(15.5);
    });

    it("should return undefined for non-numeric string", () => {
      expect(parseToNumber("abc")).toBeUndefined();
    });
  });

  describe("escapeHtml", () => {
    it("should escape HTML special characters", () => {
      const input = "<div>& test ></div>";
      const expected = "&lt;div&gt;&amp; test &gt;&lt;/div&gt;";
      expect(escapeHtml(input)).toBe(expected);
    });

    it("should return empty value if input is empty", () => {
      expect(escapeHtml("")).toBe("");
    });
  });

  describe("revertHtml", () => {
    it("should revert escaped HTML characters", () => {
      const input = "&lt;div&gt;&amp; test&lt;/div&gt;";
      expect(revertHtml(input)).toBe("<div>& test</div>");
    });
  });

  describe("generateUIModelID", () => {
    it("should generate an ID using the model class name and ID", () => {
      const id = generateUIModelID(new TestModel(101) as any);
      expect(id).toEqual("TestModel-101");
    });

    it("should generate an ID using the model class name and timestamp", () => {
      const id = generateUIModelID(new TestNoIdModel(102) as any);
      expect(id).toMatch(/TestNoIdModel-\d+$/);
    });

    it("should fallback to timestamp if ID extraction fails", () => {
      const invalidModelId = generateUIModelID({} as any);
      expect(invalidModelId).toMatch(/-\d+$/);
    });
  });
});
