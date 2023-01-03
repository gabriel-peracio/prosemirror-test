import { schema } from "prose/schema";
import { heading, image } from "prose/schema/nodes";
import { ExtractNodeSpecAttributes } from "prose/schema/types/extractNodeSpecAttributes";
import { Node } from "prosemirror-model";

type nodeBuilderDesc =
  | { nodeType: string }
  | ({
      nodeType: "image";
    } & Partial<ExtractNodeSpecAttributes<typeof image>>)
  | ({
      nodeType: "heading";
    } & Partial<ExtractNodeSpecAttributes<typeof heading>>);

export const builders = (nodes: Record<string, nodeBuilderDesc>) => {
  return Object.fromEntries(
    Object.entries(nodes).map(([nodeName, { nodeType, ...attrs }]) => {
      function node(
        attrsOrFirstChild?: Record<string, any> | Node | string,
        ...maybeContent: Node[]
      ) {
        let extraAttrs: Record<string, any> = {};
        let content: Node[] | null = null;
        if (attrsOrFirstChild) {
          if (attrsOrFirstChild instanceof Node) {
            content = [attrsOrFirstChild];
          } else {
            if (typeof attrsOrFirstChild === "string") {
              content = [schema.text(attrsOrFirstChild)];
            } else {
              extraAttrs = attrsOrFirstChild;
            }
          }
          if (maybeContent.length) {
            content =
              content === null ? maybeContent : content.concat(maybeContent);
          }
        }
        return schema.nodes[nodeType].create(
          Object.assign({}, attrs, extraAttrs),
          content
        );
      }
      return [nodeName, node] as const;
    })
  );
};

export const { doc, p, ul, ol, li, img, blockquote, h1, h2, h3, h4, h5, h6 } =
  builders({
    doc: { nodeType: "doc" },
    p: { nodeType: "paragraph" },
    ol: { nodeType: "ordered_list" },
    ul: { nodeType: "unordered_list" },
    li: { nodeType: "list_item" },
    img: { nodeType: "image", alt: "placeholder", src: "placeholder" },
    blockquote: { nodeType: "blockquote" },
    h1: { nodeType: "heading", level: 1 },
    h2: { nodeType: "heading", level: 2 },
    h3: { nodeType: "heading", level: 3 },
    h4: { nodeType: "heading", level: 4 },
    h5: { nodeType: "heading", level: 5 },
    h6: { nodeType: "heading", level: 6 },
  });
