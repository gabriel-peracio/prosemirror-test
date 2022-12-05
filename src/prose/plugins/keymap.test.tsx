import { fireEvent } from "@testing-library/react";
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import { doc, p } from "prose/test/builders";
import { getCursorPositionByQuery } from "prose/test/getCursorPositionByQuery";
import { placeCursorByQuery } from "prose/test/placeCursorByQuery";
import { renderNewDoc } from "prose/test/renderNewDoc";
import { stubElementFromPoint } from "prose/test/stubElementFromPoint";
import { TextSelection } from "prosemirror-state";
import { act } from "react-dom/test-utils";

describe("keymap", () => {
  stubElementFromPoint();
  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    user = userEvent.setup({
      delay: null,
      pointerEventsCheck: PointerEventsCheckLevel.Never,
      skipHover: true,
    });
  });

  it("can enter text", async () => {
    const { view } = renderNewDoc();

    expect(view.dom).toBeInTheDocument();

    await user.type(view.dom.firstElementChild!, "abc");
    expect(view.state.doc.toString()).toBe('doc(paragraph("abc"))');
  });
  it("can undo", async () => {
    const { view } = renderNewDoc();

    expect(view.dom).toBeInTheDocument();
    await userEvent.type(view.dom.firstElementChild!, "abc");
    fireEvent.keyDown(view.dom, { key: "z", ctrlKey: true });
    expect(view.state.doc.toString()).toBe("doc(paragraph)");
  });
  it("can redo", async () => {
    const { view } = renderNewDoc();

    expect(view.dom).toBeInTheDocument();
    await userEvent.type(view.dom.firstElementChild!, "abc");
    fireEvent.keyDown(view.dom, { key: "z", ctrlKey: true });
    fireEvent.keyDown(view.dom, { key: "y", ctrlKey: true });
    expect(view.state.doc.toString()).toBe('doc(paragraph("abc"))');
  });

  it('can press "Enter" to create a new line', async () => {
    const { view } = renderNewDoc(doc(p("hello")));
    placeCursorByQuery(view, "hello|");
    fireEvent.keyDown(view.dom, { key: "Enter" });
    expect(view.state.doc.toString()).toBe(
      'doc(paragraph("hello"), paragraph)'
    );
  });

  it('can press "Backspace" join a paragraph with the one above', async () => {
    const { view } = renderNewDoc(doc(p("hello"), p("world")));
    placeCursorByQuery(view, "|world");
    fireEvent.keyDown(view.dom, { key: "Backspace" });
    expect(view.state.doc.toString()).toBe('doc(paragraph("helloworld"))');
  });
  it('can press "Backspace" with a selection spanning two paragraphs, joining them', async () => {
    const { view } = renderNewDoc(doc(p("hello"), p("world")));
    const posA = getCursorPositionByQuery(view, "hel|lo");
    const posB = getCursorPositionByQuery(view, "wor|ld");
    act(() => {
      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, posA, posB)
        )
      );
    });
    fireEvent.keyDown(view.dom, { key: "Backspace" });
    expect(view.state.doc.toString()).toBe('doc(paragraph("helld"))');
  });

  it('can press "Delete" join a paragraph with the one below', async () => {
    const { view } = renderNewDoc(doc(p("hello"), p("world")));
    placeCursorByQuery(view, "hello|");
    fireEvent.keyDown(view.dom, { key: "Delete" });
    expect(view.state.doc.toString()).toBe('doc(paragraph("helloworld"))');
  });
  it('can press "Delete" with a selection spanning two paragraphs, joining them', async () => {
    const { view } = renderNewDoc(doc(p("hello"), p("world")));
    const posA = getCursorPositionByQuery(view, "hel|lo");
    const posB = getCursorPositionByQuery(view, "wor|ld");
    act(() => {
      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, posA, posB)
        )
      );
    });
    fireEvent.keyDown(view.dom, { key: "Delete" });
    expect(view.state.doc.toString()).toBe('doc(paragraph("helld"))');
  });

  describe("marks", () => {
    it('can press "Ctrl + B" to toggle bold', async () => {
      const { view } = renderNewDoc(doc(p("lorem ipsum dolor")));
      placeCursorByQuery(view, "|ipsum|");
      fireEvent.keyDown(view.dom, { key: "b", ctrlKey: true });
      // screen.debug();
      expect(view.state.doc.toString()).toBe(
        'doc(paragraph("lorem ", strong("ipsum"), " dolor"))'
      );
    });
    it('can press "Ctrl + U" to toggle underline', async () => {
      const { view } = renderNewDoc(doc(p("lorem ipsum dolor")));
      placeCursorByQuery(view, "|ipsum|");
      fireEvent.keyDown(view.dom, { key: "u", ctrlKey: true });
      // screen.debug();
      expect(view.state.doc.toString()).toBe(
        'doc(paragraph("lorem ", underline("ipsum"), " dolor"))'
      );
    });
    it('can press "Ctrl + I" to toggle italics', async () => {
      const { view } = renderNewDoc(doc(p("lorem ipsum dolor")));
      placeCursorByQuery(view, "|ipsum|");
      fireEvent.keyDown(view.dom, { key: "i", ctrlKey: true });
      // screen.debug();
      expect(view.state.doc.toString()).toBe(
        'doc(paragraph("lorem ", em("ipsum"), " dolor"))'
      );
    });
  });
});
