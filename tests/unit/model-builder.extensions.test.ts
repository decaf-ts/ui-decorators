import "../../src/overrides";
import { Metadata } from "@decaf-ts/decoration";
import { ModelBuilder } from "@decaf-ts/decorator-validation";
import { UIKeys } from "../../src/ui/constants";

describe("ui-decorators ModelBuilder extensions", () => {
  it("records UI metadata when builder helpers run", () => {
    const builder = ModelBuilder.builder();
    builder.setName("UiBuilderModel");

    builder.uimodel("panel", { foo: "bar" });
    builder.renderedBy("react");
    builder.uilistmodel("li", { index: 1 });
    builder.uihandlers({ onClick: () => {} });
    builder.uilayout("section", 2, [1, 2], { layout: true });
    builder.uisteppedmodel("wizard", 3, true, { paginated: true });

    const Dynamic = builder.build();

    expect(
      Metadata.get(Dynamic, Metadata.key(UIKeys.REFLECT, UIKeys.UIMODEL))
    ).toBeDefined();
    expect(
      Metadata.get(Dynamic, Metadata.key(UIKeys.REFLECT, UIKeys.RENDERED_BY))
    ).toEqual("react");
    expect(
      Metadata.get(Dynamic, Metadata.key(UIKeys.REFLECT, UIKeys.UILISTMODEL))
    ).toBeDefined();
    expect(
      Metadata.get(Dynamic, Metadata.key(UIKeys.REFLECT, UIKeys.HANDLERS))
    ).toBeDefined();
    expect(
      Metadata.get(Dynamic, Metadata.key(UIKeys.REFLECT, UIKeys.UILAYOUT))
    ).toBeDefined();
  });
});
