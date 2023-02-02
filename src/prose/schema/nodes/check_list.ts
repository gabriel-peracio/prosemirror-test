import { NodeSpec } from "../types/NodeSpec";

export const check_list: NodeSpec = {
  content: "check_list_item+",
  group: "block list",
  parseDOM: [{ tag: 'ul[data-node-type="check_list"]' }],
  toDOM() {
    return [
      "ul",
      {
        "data-node-type": "check_list",
      },
      0,
    ];
  },
};
