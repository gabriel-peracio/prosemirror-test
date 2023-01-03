import { NodeSpec } from "./NodeSpec";

export type ExtractNodeSpecAttributes<S> = S extends NodeSpec<infer A>
  ? { [attrName in keyof A]: A[attrName] }
  : never;
