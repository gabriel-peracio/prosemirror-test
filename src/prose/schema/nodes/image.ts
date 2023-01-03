import { NodeSpec } from "../types/NodeSpec";

export const image: NodeSpec<{ src: string; alt: string }> = {
  attrs: {
    src: { default: "#" },
    alt: { default: "" },
  },
  group: "inline",
  inline: true,
  parseDOM: [
    {
      tag: "img",
      getAttrs: (domNode) => {
        return {
          src: domNode.getAttribute("src") ?? "#",
          alt: domNode.getAttribute("alt") ?? "",
        };
      },
    },
  ],
  toDOM({ attrs: { src, alt } }) {
    return [
      "img",
      {
        "data-node-type": "image",
        src,
        alt,
      },
    ];
  },
};
