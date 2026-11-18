/** @jest-environment jsdom */
/// <reference lib="dom" />

import { escapeHtml, revertHtml } from "../../src/ui/utils";
import { generatedHtmlInputs, htmlPayloads } from "./fixtures/html-payloads";

// Assert parsed DOM structure, never script execution: jsdom is deliberately
// inert and does not fetch resources. Regex-only assertions miss parser tricks.
describe("HTML encoding at rendering boundaries", () => {
  const contexts = ["text", '"', "'"] as const;

  function render(payload: string, context: (typeof contexts)[number]) {
    const host = document.createElement("div");
    const escaped = escapeHtml(payload);
    host.innerHTML =
      context === "text"
        ? `<span>${escaped}</span>`
        : `<span title=${context}${escaped}${context}></span>`;
    return host;
  }

  function assertStructure(
    host: HTMLDivElement,
    context: (typeof contexts)[number]
  ) {
    expect(host.childNodes).toHaveLength(1);
    expect(host.querySelectorAll("*")).toHaveLength(1);
    const span = host.firstElementChild!;
    expect(span.tagName).toBe("SPAN");
    expect(span.getAttributeNames()).toEqual(
      context === "text" ? [] : ["title"]
    );
    expect(span.children).toHaveLength(0);
    if (context !== "text") expect(span.textContent).toBe("");
  }

  describe.each(contexts)("%s context", (context) => {
    it.each(htmlPayloads)(
      "neutralizes %s through three DOM reparses",
      (_name, payload) => {
        const host = render(payload, context);
        for (let pass = 0; pass < 3; pass++) {
          assertStructure(host, context);
          const span = host.firstElementChild!;
          expect(
            context === "text" ? span.textContent : span.getAttribute("title")
          ).toBe(payload);
          const serialized = host.innerHTML;
          host.innerHTML = serialized;
        }
      }
    );

    it("prevents markup and attribute injection in 1,000 seeded combinations", () => {
      for (const payload of generatedHtmlInputs()) {
        const host = render(payload, context);
        assertStructure(host, context);
        const serialized = host.innerHTML;
        host.innerHTML = serialized;
        assertStructure(host, context);
      }
    });
  });

  it("keeps trusted translation markup and inserts the R2-1 search value as text", () => {
    const payload = '<img src=x onerror="void 0" data-poc="cf1">';
    const host = document.createElement("div");
    // Same markup as for-angular's production en.json search subtitle. Escape
    // BEFORE the single interpolation; escaping an unused param cannot help.
    const template =
      'You searched for: <ion-text color="primary" class="display-block ion-text-center text-bold">{0}</ion-text>';
    host.innerHTML = template.replace("{0}", () => escapeHtml(payload));
    expect(host.querySelectorAll("*")).toHaveLength(1);
    expect(host.querySelector("ion-text")!.textContent).toBe(payload);
    expect(host.querySelector("img")).toBeNull();
  });

  it("demonstrates that discarding escaped data leaves the R2-1 caller unsafe", () => {
    const payload = '<img src=x onerror="void 0">';
    const alreadyInterpolated = `Search: <b>${payload}</b>`;
    escapeHtml(payload); // discarded by the vulnerable double-interpolation flow
    const host = document.createElement("div");
    host.innerHTML = alreadyInterpolated;
    expect(host.querySelector("img")!.getAttribute("onerror")).toBe("void 0");
  });

  it("demonstrates that escaping does not validate URL attributes", () => {
    const host = document.createElement("div");
    host.innerHTML = `<a href="${escapeHtml("javascript:void(0)")}">link</a>`;
    expect(host.querySelector("a")!.protocol).toBe("javascript:");
  });

  it("demonstrates that decoding before a trusted sink undoes the protection", () => {
    const host = document.createElement("div");
    host.innerHTML = revertHtml(escapeHtml('<img src=x onerror="void 0">'));
    expect(host.querySelector("img")!.getAttribute("onerror")).toBe("void 0");
  });
});
