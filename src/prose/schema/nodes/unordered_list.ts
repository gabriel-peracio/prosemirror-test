import { NodeSpec } from "../types/NodeSpec";

export const unordered_list: NodeSpec = {
  content: "list_item+",
  group: "block list",
  parseDOM: [{ tag: "ul" }],
  toDOM() {
    return ["ul", 0];
  },
};
