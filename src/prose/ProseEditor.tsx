import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ProseEditor.module.scss";
import "./ProseMirror.scss";
import { EditorState } from "prosemirror-state";
import { EditorProps, EditorView } from "prosemirror-view";
import { schema } from "./schema";
import { plugins } from "./plugins";
import { applyDevTools } from "prosemirror-dev-toolkit";
import { doc, p, ol, li } from "./test/builders";

export type ProseEditorProps = {};

export const ProseEditor: React.FC<ProseEditorProps> = (props) => {
  // const {} = props;
  const [editorState, setEditorState] = useState(() => {
    return EditorState.create({
      schema: schema,
      plugins,
      // doc: schema.nodes.doc.create(null, [schema.nodes.paragraph.create()!])!,
      doc: doc(p()),
    });
  });
  const editorProps: EditorProps = {};
  const [editorView] = useState(() => {
    const view = new EditorView(null, {
      ...editorProps,
      state: editorState,
      dispatchTransaction: (tr) => {
        const newState = view.state.apply(tr);
        setEditorState(newState);
        view.updateState(newState);
      },
    });
    return view;
  });

  const editorRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        el.appendChild(editorView.dom);
      }
    },
    [editorView]
  );

  useEffect(() => {
    applyDevTools(editorView);
  }, [editorView]);

  return (
    <div
      className={styles.ProseEditor}
      ref={editorRef}
      spellCheck={false}
    ></div>
  );
};
