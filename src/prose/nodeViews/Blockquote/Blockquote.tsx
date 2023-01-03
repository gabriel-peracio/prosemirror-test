import { Node as ProseNode } from "prosemirror-model";
import { Decoration, EditorView } from "prosemirror-view";
import { forwardRef, useEffect } from "react";
import { useUpdateEffect } from "react-use";

export type BlockquoteProps = {
  node: ProseNode;
  view: EditorView;
  getPos: () => number;
  decorations: readonly Decoration[];
  // innerDecorations: DecorationSource;
  selection: EditorView["state"]["selection"];
};

export const Blockquote = forwardRef<HTMLDivElement, BlockquoteProps>(
  (props, contentDomRef) => {
    const { node, selection } = props;

    useUpdateEffect(() => {
      console.log("Node changed!", node.toString());
    }, [node]);
    useUpdateEffect(() => {
      console.log("Selection changed!", selection.$from.pos);
    }, [selection]);

    return (
      <div className="blockquote">
        Hello from Blockquote
        <div ref={contentDomRef}></div>
      </div>
    );
  }
);
Blockquote.displayName = "NodeView(Blockquote)";
