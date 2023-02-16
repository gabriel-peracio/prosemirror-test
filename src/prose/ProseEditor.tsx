import { applyDevTools } from "prosemirror-dev-toolkit";
import { EditorState } from "prosemirror-state";
import { EditorProps, EditorView } from "prosemirror-view";
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Image } from "./nodeViews";
import { Blockquote } from "./nodeViews/Blockquote/Blockquote";
import { nodeViewStore } from "./nodeViews/NodeViewStore";
import { reactNodeViewFactory } from "./nodeViews/reactNodeViewFactory";
import { plugins } from "./plugins";
import styles from "./ProseEditor.module.scss";
import { schema } from "./schema";
import "./styles/ProseMirror.scss";
import { blockquote, doc, h2, img, li, p, ul, cl, cli } from "./test/builders";
import "prosemirror-view/style/prosemirror.css";
import { useEffectOnce } from "react-use";
import { validateSchema } from "./utils/validateSchema";
import { CheckListItem } from "./nodeViews/CheckListItem/CheckListItem";
import { times } from "lodash";
import { lorem } from "./test/utils/lorem";

export type ProseEditorProps = {};

export const ProseEditor: React.FC<ProseEditorProps> = (props) => {
  // const {} = props;
  const nodeViewPortals = useSyncExternalStore(
    nodeViewStore.subscribe,
    nodeViewStore.getSnapshot
  );

  const [editorState, setEditorState] = useState(() => {
    return EditorState.create({
      schema: schema,
      plugins,
      // doc: schema.nodes.doc.create(null, [schema.nodes.paragraph.create()!])!,
      doc: doc(...times(50, (idx) => p(`[${idx}]${lorem[idx]}`))),
      // doc: doc(cl(cli(p("Item")))),
      // doc: doc(ul(li(p("hello"), p("world")))),
    });
  });
  const editorProps: EditorProps = {};

  const editorView = useMemo(() => {
    nodeViewStore.clear(); // remain compatible with React.StrictMode
    const view = new EditorView(null, {
      ...editorProps,
      state: editorState,
      dispatchTransaction: (tr) => {
        const newState = view.state.apply(tr);
        setEditorState(newState);
        view.updateState(newState);
      },
      nodeViews: {
        image: reactNodeViewFactory(Image),
        blockquote: reactNodeViewFactory(Blockquote),
        check_list_item: reactNodeViewFactory(CheckListItem, "li"),
      },
    });

    applyDevTools(view);
    return view;
  }, []);

  useEffectOnce(() => {
    validateSchema(editorState);
  });

  // useUnmount(() => {
  //   editorView.destroy();
  // });

  const editorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.hasChildNodes()) {
        editorRef.current.replaceChildren();
      }
      editorRef.current.appendChild(editorView.dom);
    }
  }, []);

  // const editorRef = useCallback(
  //   (el: HTMLDivElement | null) => {
  //     if (el) {
  //       el.appendChild(editorView.current().dom);
  //     }
  //   },
  //   [editorView]
  // );

  return (
    <div className={styles.ProseEditor} ref={editorRef} spellCheck={false}>
      {nodeViewPortals.map(({ key, nodeView }) => {
        return nodeView;
      })}
    </div>
  );
};
