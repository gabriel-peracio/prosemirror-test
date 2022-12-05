import { fireEvent } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { doc, ul, li, p } from "prose/test/builders";
import { getCursorPositionByQuery } from "prose/test/getCursorPositionByQuery";
import { placeCursorByQuery } from "prose/test/placeCursorByQuery";
import { renderNewDoc } from "prose/test/renderNewDoc";
import { stubElementFromPoint } from "prose/test/stubElementFromPoint";
import { TextSelection } from "prosemirror-state";
import { act } from "react-dom/test-utils";

describe("splitListItem", () => {
  stubElementFromPoint();
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup({
      delay: null,
      pointerEventsCheck: PointerEventsCheckLevel.Never,
      skipHover: true,
    });
  });

  it("add a new list item by pressing enter while the caret is at the end of the list", async () => {
    const { view } = renderNewDoc(doc(ul(li(p("hello")))));
    placeCursorByQuery(view, "hello|");
    fireEvent.keyDown(view.dom, { key: "Enter" });
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("hello")), list_item(paragraph)))'
    );
  });
  it("inherits the attributes of the current list item", async () => {
    const { view } = renderNewDoc(
      doc(ul(li(p("hello")), li({ level: 1 }, p("world"))))
    );
    placeCursorByQuery(view, "world|");
    fireEvent.keyDown(view.dom, { key: "Enter" });
    expect(view.state.doc.firstChild?.lastChild?.attrs).toEqual(
      expect.objectContaining({ level: 1 })
    );
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("hello")), list_item(paragraph("world")), list_item(paragraph)))'
    );
  });
  it("can split a list item if the selection is spanning multiple nodes", () => {
    const { view } = renderNewDoc(doc(ul(li(p("hello")), li(p("world")))));
    const start = getCursorPositionByQuery(view, "he|llo");
    const end = getCursorPositionByQuery(view, "wor|ld");
    act(() => {
      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, start, end)
        )
      );
    });
    fireEvent.keyDown(view.dom, { key: "Enter" });
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("he")), list_item(paragraph("ld"))))'
    );
  });
});
