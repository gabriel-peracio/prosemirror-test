import {
  Decoration,
  DecorationSource,
  EditorView,
  NodeView,
} from "prosemirror-view";
import { Node as ProseNode } from "prosemirror-model";
import { createPortal } from "react-dom";
import React, { useEffect, useLayoutEffect, useSyncExternalStore } from "react";

type NodeViewContext = {
  node: ProseNode;
  view: EditorView;
  getPos: () => number;
  decorations: readonly Decoration[];
  innerDecorations: DecorationSource;
  selection: EditorView["state"]["selection"];
};

export class ReactNodeView implements NodeView {
  dom: Node;
  contentDOM?: HTMLElement;
  contentDomContainerRef: React.RefObject<HTMLDivElement>;
  node: ProseNode;
  view: EditorView;
  getPos: () => number;
  decorations: readonly Decoration[];
  innerDecorations: DecorationSource;
  component: React.ForwardRefExoticComponent<React.RefAttributes<HTMLElement>>;
  key: Symbol;
  nodeViewContext: NodeViewContext;
  nodeViewStoreListeners: Array<() => void> = [];
  nodeViewStore: {
    updateSelection(newSelection: EditorView["state"]["selection"]): void;
    updateNode(newNode: ProseNode): void;
    updateDecorations(newDecorations: readonly Decoration[]): void;
    updateInnerDecorations(newInnerDecorations: DecorationSource): void;
    subscribe(listener: () => void): () => void;
    getSnapshot(): NodeViewContext;
  };
  emitNodeViewStoreChange() {
    for (let listener of this.nodeViewStoreListeners) {
      listener();
    }
  }

  constructor(
    nodeViewConstructorParams: [
      node: ProseNode,
      view: EditorView,
      getPos: () => number,
      decorations: readonly Decoration[],
      innerDecorations: DecorationSource
    ],
    component: React.ForwardRefExoticComponent<React.RefAttributes<HTMLElement>>
  ) {
    const [node, view, getPos, decorations, innerDecorations] =
      nodeViewConstructorParams;
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.decorations = decorations;
    this.innerDecorations = innerDecorations;
    const domEl = document.createElement(this.node.isInline ? "span" : "div");
    domEl.setAttribute("data-node-type", this.node.type.name);
    this.dom = domEl;
    this.contentDomContainerRef = React.createRef();
    this.contentDOM = document.createElement("div");
    this.dom.appendChild(this.contentDOM);

    this.component = component;
    this.key = Symbol(this.node.type.name);
    this.nodeViewContext = {
      node,
      view,
      getPos,
      decorations,
      innerDecorations,
      selection: view.state.selection,
    };
    const self = this;
    this.nodeViewStore = {
      updateSelection(newSelection: EditorView["state"]["selection"]) {
        self.nodeViewContext = Object.assign({}, self.nodeViewContext, {
          selection: newSelection,
        });
        self.emitNodeViewStoreChange();
      },
      updateNode(newNode: ProseNode) {
        self.nodeViewContext = Object.assign({}, self.nodeViewContext, {
          node: newNode,
        });
        self.emitNodeViewStoreChange();
      },
      updateDecorations(newDecorations: readonly Decoration[]) {
        self.nodeViewContext = Object.assign({}, self.nodeViewContext, {
          decorations: newDecorations,
        });
        self.emitNodeViewStoreChange();
      },
      updateInnerDecorations(newInnerDecorations: DecorationSource) {
        self.nodeViewContext = Object.assign({}, self.nodeViewContext, {
          innerDecorations: newInnerDecorations,
        });
        self.emitNodeViewStoreChange();
      },
      subscribe(listener: () => void) {
        self.nodeViewStoreListeners = [
          ...self.nodeViewStoreListeners,
          listener,
        ];
        return () => {
          self.nodeViewStoreListeners = self.nodeViewStoreListeners.filter(
            (l) => l !== listener
          );
        };
      },
      getSnapshot() {
        return self.nodeViewContext;
      },
    };
    this.nodeViewContext = {
      node,
      view,
      getPos,
      decorations,
      innerDecorations,
      selection: view.state.selection,
      // innerDecorations: DecorationSource;
    };
  }

  ignoreMutation(
    p: MutationRecord | { type: "selection"; target: Element }
  ): boolean {
    return true;
  }

  update(
    node: ProseNode,
    decorations: readonly Decoration[],
    innerDecorations: DecorationSource
  ) {
    // console.log("update");
    if (node !== this.nodeViewContext.node) {
      this.nodeViewStore.updateNode(node);
    }
    if (decorations !== this.nodeViewContext.decorations) {
      this.nodeViewStore.updateDecorations(decorations);
    }
    if (innerDecorations !== this.nodeViewContext.innerDecorations) {
      this.nodeViewStore.updateInnerDecorations(innerDecorations);
    }

    return true;
  }
  setSelection() {
    this.nodeViewStore.updateSelection(this.view.state.selection);
    // this.nodeViewContext.selection = this.view.state.selection;
    // console.log("setSelection");
  }
  selectNode() {
    this.nodeViewStore.updateSelection(this.view.state.selection);
    // this.nodeViewContext.selection = this.view.state.selection;
    // console.log("selectNode");
  }
  deselectNode() {
    this.nodeViewStore.updateSelection(this.view.state.selection);
    // this.nodeViewContext.selection = this.view.state.selection;
    // console.log("deselectNode");
  }

  renderPortal() {
    const self = this;
    const Component: React.FC = () => {
      const nodeViewStore = useSyncExternalStore(
        self.nodeViewStore.subscribe,
        self.nodeViewStore.getSnapshot
      );
      useLayoutEffect(() => {
        if (this.contentDomContainerRef != null && this.contentDOM != null) {
          this.contentDomContainerRef.current?.appendChild(this.contentDOM);
        }
      }, []);
      return (
        <this.component
          {...nodeViewStore}
          ref={!this.node.isLeaf ? this.contentDomContainerRef : undefined}
        />
      );
    };
    Component.displayName = `PortalWrapper(${this.node.type.name}Wrapper)`;
    const portal = createPortal(<Component />, this.dom as HTMLElement);

    return portal;
  }
}
