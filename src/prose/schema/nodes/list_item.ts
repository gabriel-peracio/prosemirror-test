import { NodeSpec } from "../types/NodeSpec";

export const list_item: NodeSpec<{
  level: number;
}> = {
  content: "textual*",
  group: "list_item",
  defining: true,
  attrs: {
    level: { default: 0 },
  },
  parseDOM: [
    {
      tag: "li",
      getAttrs: (domNode) => {
        return { level: parseInt(domNode.dataset.level ?? "0") };
      },
    },
  ],
  toDOM({ attrs: { level } }) {
    return [
      "li",
      {
        "data-node-type": "list_item",
        "data-level": level,
      },
      0,
    ];
  },
};
