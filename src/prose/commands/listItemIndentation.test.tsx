import { fireEvent } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { doc, ul, li, p } from "prose/test/builders";
import { placeCursorByQuery } from "prose/test/placeCursorByQuery";
import { renderNewDoc } from "prose/test/renderNewDoc";
import { stubElementFromPoint } from "prose/test/stubElementFromPoint";

describe("listItemIndentation", () => {
  stubElementFromPoint();
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup({
      delay: null,
      pointerEventsCheck: PointerEventsCheckLevel.Never,
      skipHover: true,
    });
  });

  it("can indent a list item", async () => {
    const { view } = renderNewDoc(doc(ul(li(p("hello")))));
    placeCursorByQuery(view, "hello|");
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 0 })
    );
    fireEvent.keyDown(view.dom, { key: "Tab" });
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("hello"))))'
    );
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 1 })
    );
  });
  it("can unindent a list item", async () => {
    const { view } = renderNewDoc(doc(ul(li({ level: 1 }, p("hello")))));
    placeCursorByQuery(view, "hello|");
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 1 })
    );
    fireEvent.keyDown(view.dom, { key: "Tab", shiftKey: true });
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("hello"))))'
    );
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 0 })
    );
  });
  it("cannot unindent a list item below 0", async () => {
    const { view } = renderNewDoc(doc(ul(li(p("hello")))));
    placeCursorByQuery(view, "hello|");
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 0 })
    );
    fireEvent.keyDown(view.dom, { key: "Tab", shiftKey: true });
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("hello"))))'
    );
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 0 })
    );
  });
  it("cannot indent a list item above 10", async () => {
    const { view } = renderNewDoc(doc(ul(li({ level: 10 }, p("hello")))));
    placeCursorByQuery(view, "hello|");
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 10 })
    );
    fireEvent.keyDown(view.dom, { key: "Tab" });
    expect(view.state.doc.toString()).toBe(
      'doc(unordered_list(list_item(paragraph("hello"))))'
    );
    expect(view.state.doc.firstChild?.firstChild?.attrs).toEqual(
      expect.objectContaining({ level: 10 })
    );
  });
});
