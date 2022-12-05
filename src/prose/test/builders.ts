import { schema } from "prose/schema";
import { Node } from "prosemirror-model";

type nodeBuilderDesc = { nodeType: string };

export const builders = (nodes: Record<string, nodeBuilderDesc>) => {
  return Object.fromEntries(
    Object.entries(nodes).map(([nodeName, { nodeType }]) => {
      function node(
        attrsOrFirstChild?: Record<string, any> | Node | string,
        ...maybeContent: Node[]
      ) {
        let attrs: Record<string, any> | null = null;
        let content: Node[] | null = null;
        if (attrsOrFirstChild) {
          if (attrsOrFirstChild instanceof Node) {
            content = [attrsOrFirstChild];
          } else {
            if (typeof attrsOrFirstChild === "string") {
              content = [schema.text(attrsOrFirstChild)];
            } else {
              attrs = attrsOrFirstChild;
            }
          }
          if (maybeContent.length) {
            content =
              content === null ? maybeContent : content.concat(maybeContent);
          }
        }
        return schema.nodes[nodeType].create(attrs, content);
      }
      return [nodeName, node] as const;
    })
  );
};

export const { doc, p, ul, li } = builders({
  doc: { nodeType: "doc" },
  p: { nodeType: "paragraph" },
  ul: { nodeType: "unordered_list" },
  li: { nodeType: "list_item" },
});
