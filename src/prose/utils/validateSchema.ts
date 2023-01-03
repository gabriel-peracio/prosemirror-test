import { EditorState } from "prosemirror-state";
import { Node as ProsemirrorNode } from "prosemirror-model";
import { times } from "lodash";

// export function validateSchema(editorState: EditorState) {
//   const rootNode = editorState.doc;
//   const result = validateNode(rootNode);
//   console.log("validateSchema result", result);
// }

// function validateNode(node: ProsemirrorNode): boolean {
//   if (!node.type.validContent(node.content)) {
//     const cm = node.type.contentMatch;
//     console.log(`cm:`, cm, node.content);
//     return false;
//   }
//   const directChildren = times(node.childCount, (index) => {
//     const childNode = node.child(index);
//     return [childNode, validateNode(childNode)] as const;
//   });
//   return directChildren.every(([, isValid]) => isValid);
// }
export function validateSchema(editorState: EditorState) {
  const invalidNodes: ProsemirrorNode[] = [];
  if (!editorState.doc.type.validContent(editorState.doc.content)) {
    invalidNodes.push(editorState.doc);
  }
  editorState.doc.descendants((node) => {
    if (!node.type.validContent(node.content)) {
      invalidNodes.push(node);
    }
  });
  if (invalidNodes.length) {
    invalidNodes.forEach((invalidNode) => {
      // eslint-disable-next-line no-console
      console.error(
        "%c Schema Error \n%cDoc is already invalid!\n" +
          `%c ${invalidNode.type.name} %c has invalid content\n%c` +
          invalidNode.content.toString(),
        "background: #111; color: #f00; font-weight: bold",
        "color: #aa1",
        "background: #733; color: #ccc;",
        "color: #55f",
        "background: #000; color: #fff"
      );
    });
    throw new Error("Schema error: Doc is already invalid!");
  }
}
