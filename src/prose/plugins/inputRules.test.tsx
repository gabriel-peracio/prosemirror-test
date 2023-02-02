import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { renderNewDoc } from "prose/test/renderNewDoc";
import { stubElementFromPoint } from "prose/test/stubElementFromPoint";
import { screen } from "@testing-library/react";

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
    describe("unordered_list", () => {
      it.each([
        ["- a", "a"],
        ["-a", "a"],
        ["- 1", "1"],
        ["-1", "1"],
        ["- (", "("],
        ["-(", "("],
        ["- [a", "[a"],
        ["-[a", "[a"],
        ["- [a]", "[a]"],
        ["-[a]", "[a]"],
      ])(
        'can create an unordered_list by typing "%s"',
        async (input, result) => {
          const { view } = renderNewDoc();
          const reactUseInput = input.replaceAll("[", "[[");

          await user.type(view.dom.firstElementChild!, reactUseInput);
          expect(view.state.doc.toString()).toBe(
            `doc(unordered_list(list_item(paragraph("${result}"))))`
          );
        }
      );
      it.each([
        "- [",
        "-[",
        "- [x",
        "-[x",
        "-[]",
        "- []",
        "-[x]",
        "- [x]",
        "-[ ]",
        "- [ ]",
      ])(
        'will not create an unordered_list when typing "%s"',
        async (input) => {
          const { view } = renderNewDoc();
          const reactUseInput = input.replaceAll("[", "[[");

          await user.type(view.dom.firstElementChild!, reactUseInput);
          expect(view.state.doc.toString()).not.toContain("unordered_list");
        }
      );
      it("will not create an invalid unordered_list structure", async () => {
        const { view } = renderNewDoc();
        await user.type(view.dom.firstElementChild!, "--a");
        expect(view.state.doc.toString()).not.toContain("(list_item)");
      });
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
    it("can create a blockquote", async () => {
      const { view } = renderNewDoc();

      await user.type(view.dom.firstElementChild!, "> abc");
      expect(view.state.doc.toString()).toBe('doc(blockquote("abc"))');
    });
    it("can create an anchor", async () => {
      const { view } = renderNewDoc();

      await user.type(
        view.dom.firstElementChild!,
        "{[}test{]}(https://test.com)"
      );
      expect(view.state.doc.toString()).toBe('doc(paragraph(anchor("test")))');
      expect(view.dom.innerHTML).toBe(
        '<p data-node-type="paragraph"><a data-mark-type="anchor" href="https://test.com">test</a></p>'
      );
    });
    it("can create an image", async () => {
      const { view } = renderNewDoc();

      await user.type(
        view.dom.firstElementChild!,
        "{!}{[}test{]}(https://via.placeholder.com/32)"
      );
      expect(view.state.doc.toString()).toBe("doc(paragraph(image))");
      const imgEl = document.querySelector("img[data-node-type=image]");
      expect(imgEl).toBeInTheDocument();
      expect(imgEl).toHaveAttribute("src", "https://via.placeholder.com/32");
      expect(imgEl).toHaveAttribute("alt", "test");
    });
  });
});
