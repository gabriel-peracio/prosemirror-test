import { ReactPortal } from "react";

let nodeViews: Array<{ key: Symbol; nodeView: ReactPortal }> = [];
let listeners: Array<() => void> = [];

export const nodeViewStore = {
  addNodeView(key: Symbol, nodeView: ReactPortal) {
    nodeViews = [...nodeViews, { key, nodeView }];
    emitChange();
  },
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return nodeViews;
  },
  clear() {
    nodeViews = [];
  },
};

function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}
