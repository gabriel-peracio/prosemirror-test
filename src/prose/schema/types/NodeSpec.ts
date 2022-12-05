import { DOMOutputSpec } from "prosemirror-model";

export type NodeSpec<A = {}> = {
  content?: string;
  group?: string;
  parseDOM?: Array<{
    tag: string;
    getAttrs?: (node: string | HTMLElement) => A;
  }>;
  attrs?: { [a in keyof A]: { default?: A[a] } };
  toDOM?: (node: { attrs: A }) => DOMOutputSpec;
};
