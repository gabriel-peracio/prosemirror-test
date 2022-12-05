import { MarkSpec } from "../types/MarkSpec";

export const underline: MarkSpec = {
  parseDOM: [{ tag: "u" }],
  toDOM() {
    return ["u", 0];
  },
};
