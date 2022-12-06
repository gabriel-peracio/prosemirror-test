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

  describe("new list_item attrs inheritance", () => {
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
      expect(view.state.selection.$from.pos).toBe(21);
    });
  });

  describe("empty selection, caret is", () => {
    it("at the end of the list_item", async () => {
      const { view } = renderNewDoc(doc(ul(li(p("hello")))));
      placeCursorByQuery(view, "hello|");
      fireEvent.keyDown(view.dom, { key: "Enter" });
      expect(view.state.doc.toString()).toBe(
        'doc(unordered_list(list_item(paragraph("hello")), list_item(paragraph)))'
      );
      expect(view.state.selection.$from.pos).toBe(12);
    });
    it("in the middle of the list_item", () => {
      const { view } = renderNewDoc(doc(ul(li(p("hello")))));
      placeCursorByQuery(view, "hel|lo");
      fireEvent.keyDown(view.dom, { key: "Enter" });
      expect(view.state.doc.toString()).toBe(
        'doc(unordered_list(list_item(paragraph("hel")), list_item(paragraph("lo"))))'
      );
      expect(view.state.selection.$from.pos).toBe(
        getCursorPositionByQuery(view, "|lo")
      );
    });
    it("in the middle of the first paragraph of a list_item", () => {
      const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
      placeCursorByQuery(view, "he|llo");
      fireEvent.keyDown(view.dom, { key: "Enter" });
      expect(view.state.doc.toString()).toBe(
        'doc(unordered_list(list_item(paragraph("he")), list_item(paragraph("llo"), paragraph("world"))))'
      );
      expect(view.state.selection.$from.pos).toBe(
        getCursorPositionByQuery(view, "|llo")
      );
    });
    it("in the middle of the second paragraph of a list_item", () => {
      const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
      placeCursorByQuery(view, "wor|ld");
      fireEvent.keyDown(view.dom, { key: "Enter" });
      expect(view.state.doc.toString()).toBe(
        'doc(unordered_list(list_item(paragraph("hello"), paragraph("wor")), list_item(paragraph("ld"))))'
      );
      expect(view.state.selection.$from.pos).toBe(
        getCursorPositionByQuery(view, "|ld")
      );
    });
  });

  describe("selection range", () => {
    describe("within the same list_item", () => {
      it("spans the only paragraph", () => {
        const { view } = renderNewDoc(doc(ul(li(p("hello")))));
        placeCursorByQuery(view, "h|ell|o");
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("h")), list_item(paragraph("o"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|o")
        );
      });
      it("spans the first of two paragraphs", () => {
        const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
        placeCursorByQuery(view, "h|ell|o");
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("h")), list_item(paragraph("o"), paragraph("world"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|o")
        );
      });
      it("spans the second of two paragraphs", () => {
        const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
        placeCursorByQuery(view, "w|orl|d");
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("hello"), paragraph("w")), list_item(paragraph("d"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|d")
        );
      });
      it("spans both paragraphs", () => {
        const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
        const posA = getCursorPositionByQuery(view, "hel|lo");
        const posB = getCursorPositionByQuery(view, "wor|ld");
        act(() => {
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.create(view.state.doc, posA, posB)
            )
          );
        });
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("hel")), list_item(paragraph("ld"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|ld")
        );
      });
      it("spans the entire list item", () => {
        const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
        const posA = getCursorPositionByQuery(view, "|hello");
        const posB = getCursorPositionByQuery(view, "world|");
        act(() => {
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.create(view.state.doc, posA, posB)
            )
          );
        });
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          "doc(unordered_list(list_item(paragraph), list_item(paragraph)))"
        );
        expect(view.state.selection.$from.pos).toBe(7);
      });
    });
    describe("within the same list", () => {
      it("spanning multiple list_items but in the same list", () => {
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
    describe("starting inside but ending outside the list", () => {
      it("starting on the middle of a list_item and ending outside the list", () => {
        const { view } = renderNewDoc(
          doc(ul(li(p("lorem")), li(p("ipsum"))), p("hello world"))
        );
        const start = getCursorPositionByQuery(view, "lo|rem");
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
          'doc(unordered_list(list_item(paragraph("lo")), list_item(paragraph("ld"))))'
        );
      });
      it("starting on the middle of a list item and ending on a paragraph after the list, but there is content after", () => {
        const { view } = renderNewDoc(
          doc(
            ul(li(p("hello"), p("world"))),
            p("test"),
            ul(li(p("lorem")), li(p("ipsum")))
          )
        );
        const posA = getCursorPositionByQuery(view, "hel|lo");
        const posB = getCursorPositionByQuery(view, "te|st");
        act(() => {
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.create(view.state.doc, posA, posB)
            )
          );
        });

        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("hel")), list_item(paragraph("st"))), unordered_list(list_item(paragraph("lorem")), list_item(paragraph("ipsum"))))'
        );
      });
      it("starting on the start of the second paragraph of a list item and ending on a paragraph after the list, but there is content after", () => {
        const { view } = renderNewDoc(
          doc(
            ul(li(p("hello"), p("world"))),
            p("test"),
            ul(li(p("lorem")), li(p("ipsum")))
          )
        );
        const posA = getCursorPositionByQuery(view, "|world");
        const posB = getCursorPositionByQuery(view, "te|st");
        act(() => {
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.create(view.state.doc, posA, posB)
            )
          );
        });

        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("hello")), list_item(paragraph("st"))), unordered_list(list_item(paragraph("lorem")), list_item(paragraph("ipsum"))))'
        );
      });
    });
    // describe("starting outside but ending inside the list", () => {})
    describe("spanning different lists", () => {
      it("starting in the middle of the first paragraph, ending in the middle of a different list's list_item", () => {
        const { view } = renderNewDoc(
          doc(
            ul(li(p("hello"), p("world"))),
            p("test"),
            ul(li(p("lorem")), li(p("ipsum")))
          )
        );

        const posA = getCursorPositionByQuery(view, "hel|lo");
        const posB = getCursorPositionByQuery(view, "ips|um");
        act(() => {
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.create(view.state.doc, posA, posB)
            )
          );
        });
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("hel")), list_item(paragraph("um"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|um")
        );
      });
    });
  });

  describe("special cases", () => {
    describe("leave an empty list_item behind when the", () => {
      it("caret is right before the content of the list_item", () => {
        /**
         * should leave behind an empty list_item and move the contents of the current one to the new list_item
         */
        const { view } = renderNewDoc(doc(ul(li(p("hello")))));
        placeCursorByQuery(view, "|hello");
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph), list_item(paragraph("hello"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|hello")
        );
      });
    });
    describe("do not leave an empty paragraph behind when the", () => {
      it("caret is at the beginning of the second paragraph of a list_item", () => {
        /**
         * should split the list_item normally, but not leave behind an empty paragraph at the end
         * of the first list_item
         */
        const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
        placeCursorByQuery(view, "|world");
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("hello")), list_item(paragraph("world"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|world")
        );
      });
      it("anchor is at the beginning of the second paragraph of a list_item", () => {
        /**
         * should split the list_item normally, but not leave behind an empty paragraph at the end
         * of the first list_item
         */
        const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
        placeCursorByQuery(view, "|wor|ld");
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("hello")), list_item(paragraph("ld"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|ld")
        );
      });
      it("anchor is at the beginning of the second paragraph, head is outside the list", () => {
        const { view } = renderNewDoc(
          doc(ul(li(p("hello"), p("world"))), p("test"))
        );
        const posA = getCursorPositionByQuery(view, "|world");
        const posB = getCursorPositionByQuery(view, "te|st");
        act(() => {
          view.dispatch(
            view.state.tr.setSelection(
              TextSelection.create(view.state.doc, posA, posB)
            )
          );
        });

        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("hello")), list_item(paragraph("st"))))'
        );
      });
    });

    describe("the newly split list_item should not start with an empty paragraph when the", () => {
      it("caret is at the end of the first paragraph of a list_item", () => {
        /**
         * should split the list_item normally, but not keep the empty paragraph
         * in other words, we delete the line break
         */
        const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
        placeCursorByQuery(view, "hello|");
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("hello")), list_item(paragraph("world"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|world")
        );
      });
      it("head is at the end of the first paragraph of a list_item", () => {
        /**
         * should split the list_item normally, but not keep the empty paragraph
         * in other words, we delete the line break
         */
        const { view } = renderNewDoc(doc(ul(li(p("hello"), p("world")))));
        placeCursorByQuery(view, "he|llo|");
        fireEvent.keyDown(view.dom, { key: "Enter" });
        expect(view.state.doc.toString()).toBe(
          'doc(unordered_list(list_item(paragraph("he")), list_item(paragraph("world"))))'
        );
        expect(view.state.selection.$from.pos).toBe(
          getCursorPositionByQuery(view, "|world")
        );
      });
    });
  });
});
