import { NodeSpec } from "../types/NodeSpec";

export const blockquote: NodeSpec = {
  content: "inline*",
  group: "block textual",
  defining: true,
  parseDOM: [
    {
      tag: "blockquote",
    },
  ],
  toDOM() {
    return [
      "blockquote",
      {
        "data-node-type": "blockquote",
      },
      0,
    ];
  },
};
