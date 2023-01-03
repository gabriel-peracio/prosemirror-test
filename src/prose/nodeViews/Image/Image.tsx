import { Node as ProseNode } from "prosemirror-model";
import { Decoration, EditorView } from "prosemirror-view";
import { forwardRef } from "react";
import { useUpdateEffect } from "react-use";
import styles from "./Image.module.scss";

export type ImageProps = {
  node: ProseNode;
  view: EditorView;
  getPos: () => number;
  decorations: readonly Decoration[];
  // innerDecorations: DecorationSource;
  selection: EditorView["state"]["selection"];
};

export const Image = forwardRef<HTMLSpanElement, ImageProps>(
  (props, contentDomRef) => {
    // const {} = props;
    useUpdateEffect(() => {
      console.log("Image selection", props);
    }, [props]);
    return (
      <span className={styles.Image} ref={contentDomRef}>
        Hello from Image
      </span>
    );
  }
);
Image.displayName = "NodeView(Image)";
