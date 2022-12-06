import { MarkSpec } from "../types/MarkSpec";

export const em: MarkSpec = {
  parseDOM: [{ tag: "em" }],
  toDOM() {
    return [
      "em",
      {
        "data-mark-type": "em",
      },
      0,
    ];
  },
};
