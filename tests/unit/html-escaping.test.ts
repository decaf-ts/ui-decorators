import { escapeHtml, parseValueByType, revertHtml } from "../../src";
import { generatedHtmlInputs, htmlPayloads } from "./fixtures/html-payloads";

describe("HTML encoding (Node runtime)", () => {
  it.each([
    ["&", "&amp;"],
    ["<", "&lt;"],
    [">", "&gt;"],
    ['"', "&quot;"],
    ["'", "&#39;"],
  ])("encodes %s and decodes its entity", (raw, encoded) => {
    expect(escapeHtml(raw)).toBe(encoded);
    expect(revertHtml(encoded)).toBe(raw);
  });

  it("encodes all occurrences once, without escaping generated entities", () => {
    expect(escapeHtml(`&<>"'&<>"'`)).toBe(
      "&amp;&lt;&gt;&quot;&#39;&amp;&lt;&gt;&quot;&#39;"
    );
  });

  it("preserves existing entities as literal text instead of trusting them", () => {
    expect(escapeHtml("&lt;&#60;&#x3c;&quot;&#39;&amp;")).toBe(
      "&amp;lt;&amp;#60;&amp;#x3c;&amp;quot;&amp;#39;&amp;amp;"
    );
  });

  it("decodes exactly one layer, leaving nested entities inert", () => {
    expect(revertHtml("&amp;lt;&amp;gt;&amp;quot;&amp;#39;&amp;amp;")).toBe(
      "&lt;&gt;&quot;&#39;&amp;"
    );
  });

  it("leaves entities outside its five-character encoding contract alone", () => {
    const input = "&#60; &#x3c; &#34; &#x27; &apos; &copy; &unknown; &AMP; &lt";
    expect(revertHtml(input)).toBe(input);
  });

  it.each(htmlPayloads)(
    "round-trips %s without losing data",
    (_name, input) => {
      expect(revertHtml(escapeHtml(input))).toBe(input);
    }
  );

  it("preserves UTF-16 data and neutralizes every delimiter in 1,000 seeded inputs", () => {
    for (const input of generatedHtmlInputs()) {
      const escaped = escapeHtml(input);
      expect(escaped).not.toMatch(/[<>"']/);
      expect(escaped.replace(/&(?:amp|lt|gt|quot|#39);/g, "")).not.toContain(
        "&"
      );
      expect(revertHtml(escaped)).toBe(input);
    }
  });

  it("handles a large hostile string without recursion or truncation", () => {
    const input = `&<>"'`.repeat(100_000);
    const escaped = escapeHtml(input);
    expect(escaped.length).toBe(2_400_000);
    expect(revertHtml(escaped)).toBe(input);
  });

  it.each([
    [42, "42"],
    [{ query: [{ value: '<img src=x onerror="void 0">' }] }, "[object Object]"],
    [
      { toString: () => `"'><svg onload=void(0)>` },
      "&quot;&#39;&gt;&lt;svg onload=void(0)&gt;",
    ],
  ])("escapes coerced runtime values: %p", (input, expected) => {
    // The public API remains string-only. Existing framework callers can pass
    // non-strings at runtime; coercion must precede escaping (report R2-2).
    expect(escapeHtml(input as unknown as string)).toBe(expected);
  });

  it("keeps the parseValueByType string path on the five-character contract", () => {
    const value = `&<>"'`;
    expect(
      parseValueByType("text", value, {
        name: "search",
        path: "search",
        type: "text",
        value,
      })
    ).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("runs without a browser or DOM globals", () => {
    expect("document" in globalThis).toBe(false);
    expect("window" in globalThis).toBe(false);
    expect(escapeHtml('<script>"unsafe"</script>')).toBe(
      "&lt;script&gt;&quot;unsafe&quot;&lt;/script&gt;"
    );
  });
});
