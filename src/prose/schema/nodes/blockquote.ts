import { NodeSpec } from "../types/NodeSpec";

export const blockquote: NodeSpec = {
  content: "inline*",
  group: "block textual",
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
