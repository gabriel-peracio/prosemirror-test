import { Keymap } from "prose/plugins/Keymap";
import { schema } from "prose/schema";
import { EditorState, EditorStateConfig } from "prosemirror-state";
import { EditorProps, EditorView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { history } from "prosemirror-history";
import React, { useCallback, useEffect, useState } from "react";
import { Node } from "prosemirror-model";

export type EditorTestHarnessProps = {
  onViewChanged: (view: EditorView) => void;
  doc: Node;
  plugins?: EditorStateConfig["plugins"];
};

export const EditorTestHarness: React.FC<EditorTestHarnessProps> = ({
  doc,
  onViewChanged,
  plugins,
}) => {
  const [editorState, setEditorState] = useState(() => {
    return EditorState.create({
      schema: schema,
      plugins,
      doc,
    });
  });
  const editorProps: EditorProps = {};
  const [editorView] = useState(() => {
    const view = new EditorView(null, {
      ...editorProps,
      state: editorState,
      handleScrollToSelection: () => true,
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
    onViewChanged(editorView);
  }, [editorView, onViewChanged]);

  return <div className="ProseEditor" ref={editorRef} spellCheck={false}></div>;
};
