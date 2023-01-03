import { DOMOutputSpec } from "prosemirror-model";

export type NodeSpec<A = {}> = {
  content?: string;
  group?: string;
  inline?: boolean;
  /**
   * Determines whether this node is considered an important parent node during replace operations (such as paste).
   * Non-defining (the default) nodes get dropped when their entire content is replaced, whereas defining nodes persist
   * and wrap the inserted content.
   */
  definingAsContext?: boolean;
  /**
   * In inserted content the defining parents of the content are preserved when possible. Typically,
   * non-default-paragraph textblock types, and possibly list items, are marked as defining.
   */
  definingForContent?: boolean;
  /**
   * When enabled, enables both `definingAsContext` and `definingForContent`.
   */
  defining?: boolean;
  parseDOM?: Array<{
    tag: string;
    /**
     *
     * @returns
     * - `A`: The rule matches the node, and the returned object is used as the node's attributes
     * - `false`: The rule does not match the node
     * - `null`: The rule matches the node, but an empty/default set of attributes should be used
     * - `undefined`: The rule matches the node, but an empty/default set of attributes should be used
     */
    getAttrs?: (node: HTMLElement) => A | false | null | undefined;
  }>;
  attrs?: { [a in keyof A]: { default?: A[a] } };
  toDOM?: (node: { attrs: A }) => DOMOutputSpec;
};
