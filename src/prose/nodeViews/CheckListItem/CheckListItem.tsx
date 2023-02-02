import { Node as ProseNode } from "prosemirror-model";
import { Decoration, EditorView } from "prosemirror-view";
import React, { forwardRef, useMemo } from "react";
import styles from "./CheckListItem.module.scss";

export type CheckListItemProps = {
  node: ProseNode;
  view: EditorView;
  getPos: () => number;
  decorations: readonly Decoration[];
  // innerDecorations: DecorationSource;
  selection: EditorView["state"]["selection"];
};

export const CheckListItem = forwardRef<HTMLDivElement, CheckListItemProps>(
  (props, contentDomRef) => {
    const {
      view: {
        state: { tr },
        dispatch,
      },
      getPos,
      node,
      selection,
    } = props;

    // useUpdateEffect(() => {
    //   console.log("Node changed!", node.toString());
    // }, [node]);
    // useUpdateEffect(() => {
    //   console.log("Selection changed!", selection.$from.pos);
    // }, [selection]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      tr.setNodeAttribute(getPos(), "checked", !node.attrs.checked);
      dispatch(tr);
    };

    return (
      <div className={styles.CheckListItem} data-level={node.attrs.level}>
        <div className={styles.checkboxColumn} contentEditable={false}>
          <input
            type="checkbox"
            className={styles.checkbox}
            onChange={handleCheckboxChange}
            // checked={node.attrs.checked}
          />
        </div>
        <div ref={contentDomRef} contentEditable={true} />
      </div>
    );
  }
);
CheckListItem.displayName = "NodeView(CheckListItem)";
