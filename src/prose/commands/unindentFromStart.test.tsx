import { fireEvent } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { doc, ul, li, p } from "prose/test/builders";
import { placeCursorByQuery } from "prose/test/placeCursorByQuery";
import { renderNewDoc } from "prose/test/renderNewDoc";
import { stubElementFromPoint } from "prose/test/stubElementFromPoint";

describe("unindentFromStart", () => {
  stubElementFromPoint();
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup({
      delay: null,
      pointerEventsCheck: PointerEventsCheckLevel.Never,
      skipHover: true,
    });
  });
  it("can unindent an indented list item by pressing backspace at the start of the line", () => {
    const { view } = renderNewDoc(doc(ul(li({ level: 1 }, p("hello")))));
    placeCursorByQuery(view, "|hello");
    fireEvent.keyDown(view.dom, { key: "Backspace" });
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("hello"))))'
    );
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 0 })
    );
  });
  it("will not unindent an indented list item by pressing backspace if the cursor is not at the start of the line", async () => {
    const { view } = renderNewDoc(doc(ul(li({ level: 1 }, p("hello")))));
    /**
     * beware, userEvent will place the cursor at the end of the line regardless of where prosemirror places it
     * but you MUST place the cursor, otherwise userEvent will type backspace targeting the document
     */
    placeCursorByQuery(view, "hello|");
    await userEvent.click(view.dom.querySelector("ul>li>p")!);
    await userEvent.keyboard("{Backspace}", {
      skipClick: true,
    });
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("hell"))))'
    );
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 1 })
    );
  });
});
