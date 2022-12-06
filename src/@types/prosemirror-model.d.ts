import "prosemirror-model";

declare module "prosemirror-model" {
  export interface Fragment {
    content: import("prosemirror-model").Node[];
    textBetween: import("prosemirror-model").Node["textBetween"];
  }

  export interface NodeType {
    groups: string[];
  }
}
