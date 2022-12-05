import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { renderNewDoc } from "prose/test/renderNewDoc";
import { stubElementFromPoint } from "prose/test/stubElementFromPoint";

describe("inputRules", () => {
  stubElementFromPoint();
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup({
      delay: null,
      pointerEventsCheck: PointerEventsCheckLevel.Never,
      skipHover: true,
    });
  });

  it("can create an unordered_list", async () => {
    const { view } = renderNewDoc();

    await user.type(view.dom.firstElementChild!, "- abc");
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("abc"))))'
    );
  });
});
