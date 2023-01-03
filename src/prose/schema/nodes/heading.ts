import { clamp } from "lodash";
import { NodeSpec } from "../types/NodeSpec";

export const heading: NodeSpec<{
  level: number;
}> = {
  attrs: { level: { default: 1 } },
  content: "inline*",
  group: "block textual",
  defining: true,
  parseDOM: [
    {
      tag: "h1,h2,h3,h4,h5,h6",
      getAttrs(domNode) {
        return {
          level: clamp(parseInt(domNode.tagName.slice(1), 10), 1, 6),
        };
      },
    },
  ],
  toDOM(node) {
    const {
      attrs: { level },
    } = node;
    return [
      `h${level}`,
      {
        "data-node-type": "heading",
      },
      0,
    ];
  },
};
