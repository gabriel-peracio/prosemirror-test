import { MarkSpec } from "../types/MarkSpec";

export const strong: MarkSpec = {
  parseDOM: [{ tag: "strong" }],
  toDOM() {
    return [
      "strong",
      {
        "data-mark-type": "strong",
      },
      0,
    ];
  },
};
