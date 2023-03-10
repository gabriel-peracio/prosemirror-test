import { NodeSpec } from "../types/NodeSpec";

export const unordered_list: NodeSpec = {
  content: "list_item+",
  group: "block list",
  parseDOM: [{ tag: "ul" }],
  toDOM() {
    return [
      "ul",
      {
        "data-node-type": "unordered_list",
      },
      0,
    ];
  },
};
