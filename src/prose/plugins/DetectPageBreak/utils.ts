import { EditorView } from "prosemirror-view";
import { Node as ProseNode } from "prosemirror-model";
/**
 * Calculates the size of one millimeter, in pixels
 * Assumes that pixels are square (width = height)
 * @returns {number} The size of a millimeter in pixels
 */
const calculatePxFromMm = (): number => {
  const el = document.createElement("div");
  el.style.height = "100mm";
  el.style.position = "absolute";
  document.body.appendChild(el);
  const unitHeight = el.getBoundingClientRect().height / 100;
  document.body.removeChild(el);
  console.log(`calculatePxFromMm:`, unitHeight);
  return unitHeight;
};

export const mmPxHeight = calculatePxFromMm();
export const inPxHeight = mmPxHeight * 25.4;

/**
 * Loops through all textblock nodes in the document and returns them, along with their DOM nodes and positions
 * Bails out if it finds a detached node
 */
export const getTextBlockNodes = (view: EditorView) => {
  let nodeList: Array<{
    node: ProseNode;
    domNode: HTMLElement;
    pos: number;
  }> = [];
  let foundDetached = false;
  view.state.doc.nodesBetween(0, view.state.doc.content.size, (node, pos) => {
    if (foundDetached) return false;
    if (node.type.isTextblock) {
      const domNode = view.domAtPos(pos + 1).node;
      if (!domNode.isConnected) {
        foundDetached = true;
        return false;
      }
      nodeList.push({
        node,
        domNode: domNode as HTMLElement,
        pos,
      });
      return false;
    }
    return true;
  });
  if (foundDetached) return [];
  return nodeList;
};

/**
 * Given a node that contains textual content, returns the size (in characters) of the node, as well as a function
 * that maps a position in the node to a child node and position within that child node
 *
 * This is necessary because the `TextNode`s inside the node itself can be broken up by non-`TextNode`s, such as the
 * decorations that are used to show the page breaks
 */
export const getPosMap = (
  node: HTMLElement
): {
  nodeSize: number;
  mapPos: (pos: number) => { pos: number; node: Node };
} => {
  const bounds = Array.from(node.childNodes) // [Node, HTMLElement, Node]
    .map((c) => c.textContent?.length ?? 0) // [437, 0, 200]
    .reduce((acc, curr, i) => {
      return [...acc, curr + (acc[i - 1] ?? 0)];
    }, [] as number[]); // [437, 437, 637]
  return {
    nodeSize: node.textContent!.length,
    mapPos: (pos: number) => {
      if (node.childNodes.length === 1) {
        return {
          pos,
          node: node.firstChild!,
        };
      }
      const nodeIndex = bounds.findIndex((b) => b >= pos);
      const foundNode = node.childNodes[nodeIndex];
      const nodePos = pos - (bounds[nodeIndex - 1] ?? 0);
      return {
        pos: nodePos,
        node: foundNode,
      };
    },
  };
};
