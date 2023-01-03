import { NodeViewConstructor } from "prosemirror-view";
import React from "react";
import { nodeViewStore } from "./NodeViewStore";
import { ReactNodeView } from "./ReactNodeView";

export const reactNodeViewFactory = (
  reactComponent: React.ForwardRefExoticComponent<
    any & React.RefAttributes<HTMLElement & any>
  >
) => {
  const nodeView = (
    ...nodeViewConstructorParams: Parameters<NodeViewConstructor>
  ) => {
    const reactNodeViewInstance = new ReactNodeView(
      nodeViewConstructorParams,
      reactComponent
    );
    const portal = reactNodeViewInstance.renderPortal();
    const key = reactNodeViewInstance.key;
    nodeViewStore.addNodeView(key, portal);
    return reactNodeViewInstance;
  };
  return nodeView;
};
