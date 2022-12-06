import { clamp } from "lodash";
import { NodeSpec } from "../types/NodeSpec";

export const heading: NodeSpec<{
  level: number;
}> = {
  attrs: { level: { default: 1 } },
  content: "inline*",
  group: "block textual",
  parseDOM: [
    {
      tag: "h1,h2,h3,h4,h5,h6",
      getAttrs(domNode) {
        if (!(domNode instanceof HTMLElement)) return { level: 0 };
        return {
          level: clamp(parseInt(domNode.tagName.slice(1), 10), 1, 6),
        };
      },
    },
  ],
  toDOM({ attrs: { level } }) {
    return [
      `h${level}`,
      {
        "data-node-type": "heading",
      },
      0,
    ];
  },
};
