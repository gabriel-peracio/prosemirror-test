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
      doc: doc(
        p(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam porta nunc nec orci vestibulum, sed venenatis dui viverra. Etiam sollicitudin placerat vestibulum. Proin congue elit at dignissim egestas. Nunc ante sem, semper ac lectus eget, scelerisque egestas purus. Vestibulum rhoncus libero in risus dictum, at volutpat tortor fringilla. Fusce nibh elit, cursus non risus vel, congue lacinia lectus. Aliquam ipsum nisl, tempus vestibulum diam vel, ullamcorper feugiat sem. Nulla velit leo, elementum eu nisl at, venenatis elementum urna. Cras elementum orci sed lectus lacinia tristique. Praesent cursus, orci at consectetur viverra, ligula sapien commodo urna, sed suscipit turpis leo eu sem. Nam sagittis semper vehicula."
        ),
        p(
          "Aenean eleifend tincidunt augue, a ultrices arcu sodales ac. Maecenas aliquam mollis ante, vel fermentum odio tristique vel. Integer nisi risus, lobortis eu eros eu, vehicula venenatis risus. Etiam nulla lorem, aliquam sit amet egestas nec, pretium vitae justo. Quisque dignissim id urna non finibus. Mauris vel diam nunc. Suspendisse finibus posuere rutrum. In mollis diam a purus ullamcorper varius. Nullam maximus varius arcu, nec porta dolor fringilla id. Phasellus eleifend nunc orci, quis sodales quam auctor a."
        ),
        p(
          "Vivamus tincidunt lectus sit amet fringilla euismod. Nam congue commodo varius. Praesent in sem lorem. Aenean vulputate, purus eget interdum ullamcorper, arcu tortor blandit dolor, nec malesuada nunc nisi at mi. Etiam id magna eu quam condimentum consequat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec in nunc pulvinar, egestas turpis ut, ultrices eros. Fusce dui nibh, venenatis non sem sit amet, consequat scelerisque mi. In gravida leo ut eros venenatis, eu commodo tortor euismod. Nunc elit purus, lobortis et facilisis vitae, egestas non dolor. Nullam vitae mi nec leo suscipit egestas ac sit amet augue. Duis ut ex eget lacus scelerisque gravida. Integer quis malesuada nibh, eu aliquet enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        ),
        p(
          "Phasellus at ornare turpis, vel rutrum velit. Etiam a vestibulum dolor. Sed faucibus tristique nibh accumsan posuere. Quisque ullamcorper dapibus tincidunt. Duis pharetra massa eros, vestibulum varius sapien porta suscipit. Aenean tristique mollis bibendum. Fusce sit amet rutrum mauris, sit amet porta elit. Vestibulum aliquam dictum tortor a venenatis. Nulla dui risus, faucibus ultricies risus et, ultricies placerat lorem. Sed massa elit, gravida eu dolor eget, efficitur molestie sem. Aliquam porta odio quam, id pulvinar nisl condimentum sed. Aliquam lacus purus, hendrerit vel augue sit amet, faucibus gravida ante. Nam accumsan metus ut urna tristique tempor. Sed laoreet metus ut interdum dapibus."
        ),
        p(
          "Nullam pharetra laoreet arcu. Nulla lacinia nec dui ut hendrerit. Nunc lobortis nibh eget ante porta, at consequat risus mollis. Vivamus turpis nisl, aliquam ullamcorper varius a, porta mattis odio. Suspendisse a est mauris. Duis dapibus porta ex ut finibus. Vestibulum viverra urna ac aliquet scelerisque. Duis ac arcu quis ligula vestibulum feugiat at eget quam. Vivamus maximus posuere arcu vel vehicula. Curabitur vel metus eu lectus iaculis tempor et sit amet ligula. Mauris dictum venenatis nibh non consectetur. Duis vel eleifend metus."
        ),
        p(
          "Etiamvulputateegestasmagna, vitae faucibus eros malesuada id. Sed ultrices lacus purus, at commodo lectus vulputate in. Nunc vel tempus felis, ac rutrum leo. Proin at vulputate dui. Praesent odio arcu, tristique at nisi non, sagittis fermentum erat. Proin eu malesuada est, eu venenatis magna. Fusce pellentesque porttitor elit vel hendrerit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec vehicula libero eu massa convallis tincidunt. Duis facilisis feugiat lorem, vitae consequat libero. Vivamus eget diam quis mi vulputate sodales ut ac mi. Nam blandit auctor sapien eget pretium."
        ),
        p(
          "Donec vitae sem ante. Sed pretium placerat augue at imperdiet. Vivamus convallis, dui a vehicula ultrices, nisl libero facilisis odio, ac pharetra felis urna sed orci. Suspendisse facilisis vel lacus sed dapibus. Morbi volutpat, nulla id sollicitudin ultrices, velit sem varius sem, non egestas diam massa eu sapien. In hac habitasse platea dictumst. Cras a sem libero. Mauris convallis dui in justo semper ullamcorper. Nunc semper sapien in mi ultrices, a auctor dui viverra. Ut lacinia, arcu quis iaculis finibus, mi augue tincidunt sem, sed luctus nisl nibh eget metus. Maecenas molestie porta augue, at tempor massa mollis quis. Quisque eu rutrum nisl, ut vestibulum urna. Ut consectetur eros non mollis fringilla. Vivamus sagittis tellus eu neque ultricies ullamcorper. Ut sit amet enim dapibus, tincidunt enim et, venenatis mauris."
        ),
        p(
          "Fusce velit sem, placerat sit amet eleifend a, blandit non mauris. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque lacus tortor, bibendum non aliquam scelerisque, accumsan nec nulla. Nullam pharetra lorem vitae ipsum malesuada consectetur. Duis dapibus leo ac ligula tincidunt vulputate. Integer accumsan felis eget sapien feugiat, blandit pharetra nulla venenatis. Quisque mi ligula, efficitur id mauris quis, cursus efficitur lorem. Curabitur varius quam eget nibh pellentesque ornare. Curabitur nec porttitor ex, a sollicitudin urna. Integer fringilla tellus dui, sed bibendum massa dictum et. Morbi eu sapien in enim elementum laoreet. Nunc consectetur sapien ligula, quis dictum turpis commodo et. Sed id quam sed mauris varius scelerisque. Vivamus vitae venenatis nibh, eu faucibus magna."
        ),
        p(
          "Cras tristique porta blandit. Etiam efficitur vestibulum sem et volutpat. Sed lacinia augue sit amet lectus efficitur tristique. Donec vehicula risus quis sapien fermentum volutpat. Etiam ac orci ac nisl ornare porta nec vel mi. Proin eu bibendum tellus. Pellentesque auctor eros a arcu efficitur posuere. Quisque vel nunc velit."
        ),
        p(
          "Etiam in tempor mauris. Vivamus quis lacus tortor. Vivamus quis auctor orci, quis faucibus turpis. Phasellus finibus, tellus eget dictum vulputate, nulla metus gravida quam, ac lacinia metus lectus eget ligula. Donec ac viverra purus, ut porta elit. Nulla ante quam, bibendum nec auctor nec, convallis non tortor. Suspendisse et luctus turpis. Maecenas mollis libero diam, id pellentesque sapien suscipit eu. Donec finibus lectus id magna elementum malesuada. Vivamus non nibh sed turpis ultricies aliquam vitae bibendum felis."
        )
      ),
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
