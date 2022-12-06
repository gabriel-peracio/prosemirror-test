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

  describe("Markdown", () => {
    it("can create an unordered_list", async () => {
      const { view } = renderNewDoc();

      await user.type(view.dom.firstElementChild!, "- abc");
      expect(view.state.doc.toString()).toBe(
        'doc(unordered_list(list_item(paragraph("abc"))))'
      );
    });
    it("can create an ordered_list", async () => {
      const { view } = renderNewDoc();

      await user.type(view.dom.firstElementChild!, "1. abc");
      expect(view.state.doc.toString()).toBe(
        'doc(ordered_list(list_item(paragraph("abc"))))'
      );
    });
    it.each([1, 2, 3, 4, 5, 6])("can create an h%s", async (level) => {
      const { view } = renderNewDoc();

      await user.type(view.dom.firstElementChild!, `${"#".repeat(level)} abc`);
      expect(view.state.doc.toString()).toBe(`doc(heading("abc"))`);
      expect(view.state.doc.firstChild?.attrs.level).toBe(level);
    });
  });
});
