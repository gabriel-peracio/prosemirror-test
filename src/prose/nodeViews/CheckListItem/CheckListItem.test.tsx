import { renderNewDoc } from "prose/test/renderNewDoc";
import {
  cl,
  cli,
  doc,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  li,
  p,
  ul,
} from "prose/test/builders";
import { fireEvent, screen } from "@testing-library/react";
import { makeClipboardData } from "prose/test/utils/clipboard";
import { schema } from "prose/schema";
import { placeCursorByQuery } from "prose/test/placeCursorByQuery";
import { reactNodeViewFactory } from "../reactNodeViewFactory";
import { CheckListItem } from "./CheckListItem";

describe("CheckListItem", () => {
  it("toDOM", () => {
    const { view } = renderNewDoc(doc(cl(cli(p("Item")))));
    expect(view.state.doc.toString()).toBe(
      'doc(check_list(check_list_item(paragraph("Item"))))'
    );
    expect(view.state.doc.firstChild).toMatchObject({
      type: schema.nodes.check_list,
    });
    expect(document.querySelector("ul")).toBeInTheDocument();
  });
  it("parseDOM", () => {
    const { view } = renderNewDoc(doc(p()));
    fireEvent.paste(
      view.dom,
      makeClipboardData({
        "text/html":
          '<ul data-node-type="check_list"><li data-node-type="check_list_item"><p>Item</p></li></ul>',
      })
    );
    expect(
      document.querySelector(
        'ul[data-node-type="check_list"]>li[data-node-type="check_list_item"]'
      )
    ).toBeInTheDocument();
  });
  describe("Edge cases", () => {
    fit("sets the selection correctly when pressing shift+enter", async () => {
      const { view } = renderNewDoc(doc(cl(cli(p("Item")))), {
        nodeViews: {
          check_list_item: reactNodeViewFactory(CheckListItem, "li"),
        },
      });
      placeCursorByQuery(view, "It|em");
      fireEvent.keyDown(view.dom, { key: "Enter", shiftKey: true });
      expect(view.state.doc.toString()).toBe(
        'doc(check_list(check_list_item(paragraph("It"), paragraph("em"))))'
      );
      expect(view.state.selection.toJSON()).toMatchObject({
        anchor: 7,
        head: 7,
        type: "text",
      });
    });
  });
});
