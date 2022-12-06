import { EditorView } from "prosemirror-view";

export const getCursorPositionByQuery = (
  view: EditorView,
  cursorPlacementQuery: string
) => {
  const {
    state: { tr },
  } = view;
  const pipePos = cursorPlacementQuery.indexOf("|");
  if (pipePos === -1) {
    throw new Error(
      `Malformed cursorPlacementQuery. Please include the pipe character.`
    );
  }

  const plainQuery = cursorPlacementQuery.replaceAll("|", "");

  let foundPos: number | null = null;
  tr.doc.nodesBetween(0, tr.doc.content.size, (node, pos) => {
    if (foundPos !== null) return false;
    let foundIndex: number;
    if (node.isText && (foundIndex = node.text!.indexOf(plainQuery)) !== -1) {
      foundPos = pos + foundIndex + pipePos;
    }
    return true;
  });
  if (foundPos === null) {
    throw new Error(`Could not find ${plainQuery} in the document.`);
  }

  return foundPos;
};
