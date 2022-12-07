import { MarkSpec } from "../types/MarkSpec";

export const anchor: MarkSpec<{
  href: string;
}> = {
  attrs: {
    href: { default: "#" },
  },
  parseDOM: [
    {
      tag: "a",
      getAttrs: (domNode) => {
        if (!(domNode instanceof HTMLAnchorElement)) return { href: "#" };
        return { href: domNode.getAttribute("href") ?? "#" };
      },
    },
  ],
  toDOM({ attrs: { href } }) {
    return [
      "a",
      {
        "data-mark-type": "anchor",
        href,
      },
      0,
    ];
  },
};
