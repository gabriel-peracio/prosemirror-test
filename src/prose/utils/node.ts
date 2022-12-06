import { Node } from "prosemirror-model";

/**
 * Given an arbitrary node, returns true if it is a textual node and has no content.
 * @param node the node to check
 */
export function isEmptyTextualNode(node: Node | null): boolean {
  if (!node) return false;
  return node.type.groups.includes("textual") && node.nodeSize === 2;
}
