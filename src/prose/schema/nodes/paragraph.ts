import { NodeSpec } from "../types/NodeSpec";

export const paragraph: NodeSpec = {
  content: "inline*",
  group: "block textual",
  parseDOM: [{ tag: "p" }],
  toDOM() {
    return ["p", 0];
  },
};
