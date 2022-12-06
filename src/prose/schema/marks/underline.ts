import { MarkSpec } from "../types/MarkSpec";

export const underline: MarkSpec = {
  parseDOM: [{ tag: "u" }],
  toDOM() {
    return [
      "u",
      {
        "data-mark-type": "underline",
      },
      0,
    ];
  },
};
