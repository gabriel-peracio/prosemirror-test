import { renderNewDoc } from "prose/test/renderNewDoc";
import { doc, h1, h2, h3, h4, h5, h6, li, p, ul } from "prose/test/builders";
import { schema } from "..";
import { fireEvent, screen } from "@testing-library/react";
import { makeClipboardData } from "prose/test/utils/clipboard";

describe("nodes", () => {
  describe("doc", () => {
    it("can render a blank document", () => {
      const { view } = renderNewDoc(doc());
      expect(view.state.doc.toString()).toBe("doc");
    });
  });
  describe("paragraph", () => {
    it("toDOM", () => {
      const { view } = renderNewDoc(doc(p("Paragraph")));
      expect(view.state.doc.toString()).toBe('doc(paragraph("Paragraph"))');
      expect(view.state.doc.firstChild).toMatchObject({
        type: schema.nodes.paragraph,
      });
      expect(document.querySelector("p")).toBeInTheDocument();
    });
    it("parseDOM", () => {
      const { view } = renderNewDoc(doc(p()));
      fireEvent.paste(
        view.dom,
        makeClipboardData({ "text/html": "<p>Paragraph</p>" })
      );
      expect(
        document.querySelector("p[data-node-type='paragraph']")
      ).toBeInTheDocument();
    });
  });
  describe("heading", () => {
    describe.each([
      [1, h1],
      [2, h2],
      [3, h3],
      [4, h4],
      [5, h5],
      [6, h6],
    ])("H%s", (level, headingBuilder) => {
      it("toDOM", () => {
        const { view } = renderNewDoc(doc(headingBuilder("Heading")));
        expect(view.state.doc.toString()).toBe('doc(heading("Heading"))');
        expect(view.state.doc.firstChild).toMatchObject({
          type: schema.nodes.heading,
          attrs: { level },
        });
        expect(document.querySelector(`h${level}`)).toBeInTheDocument();
      });
      it("parseDOM", () => {
        const { view } = renderNewDoc(doc(p()));
        fireEvent.paste(
          view.dom,
          makeClipboardData({ "text/html": `<h${level}>Heading</h${level}>` })
        );
        expect(
          document.querySelector(`h${level}[data-node-type="heading"]`)
        ).toBeInTheDocument();
      });
    });
  });
  describe("unordered_list", () => {
    it("toDOM", () => {
      const { view } = renderNewDoc(doc(ul(li(p("Item")))));
      expect(view.state.doc.toString()).toBe(
        'doc(unordered_list(list_item(paragraph("Item"))))'
      );
      expect(view.state.doc.firstChild).toMatchObject({
        type: schema.nodes.unordered_list,
      });
      expect(document.querySelector("ul")).toBeInTheDocument();
    });
    it("parseDOM", () => {
      const { view } = renderNewDoc(doc(p()));
      fireEvent.paste(
        view.dom,
        makeClipboardData({ "text/html": "<ul><li><p>Item</p></li></ul>" })
      );
      expect(
        document.querySelector(
          'ul[data-node-type="unordered_list"]>li[data-node-type="list_item"]'
        )
      ).toBeInTheDocument();
    });
  });
});
