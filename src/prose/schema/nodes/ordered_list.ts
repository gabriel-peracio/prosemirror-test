import { NodeSpec } from "../types/NodeSpec";

export const ordered_list: NodeSpec = {
  content: "list_item+",
  group: "block list",
  parseDOM: [{ tag: "ol" }],
  toDOM() {
    return [
      "ol",
      {
        "data-node-type": "ordered_list",
      },
      0,
    ];
  },
};
