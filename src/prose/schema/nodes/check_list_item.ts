import { NodeSpec } from "../types/NodeSpec";

export const check_list_item: NodeSpec<{
  level: number;
  checked: boolean;
}> = {
  content: "textual*",
  group: "list_item",
  defining: true,
  attrs: {
    level: { default: 0 },
    checked: { default: false },
  },
  parseDOM: [
    {
      tag: "li",
      getAttrs: (domNode) => {
        return {
          level: parseInt(domNode.dataset.level ?? "0"),
          checked: domNode.dataset.checked === "true",
        };
      },
    },
  ],
  toDOM({ attrs: { level, checked } }) {
    return [
      "li",
      {
        "data-node-type": "check_list_item",
        "data-level": level,
        "data-checked": checked,
      },
      0,
    ];
  },
};
