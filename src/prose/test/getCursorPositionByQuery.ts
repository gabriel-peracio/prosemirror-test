import { EditorView } from "prosemirror-view";
import { TextSelection } from "prosemirror-state";
import { screen, act } from "@testing-library/react";

export const getCursorPositionByQuery = (
  view: EditorView,
  cursorPlacementQuery: string
) => {
  const offset = cursorPlacementQuery.indexOf("|");
  if (offset === -1) {
    throw new Error(
      `Malformed cursorPlacementQuery. Please include the pipe character.`
    );
  }

  const plainQuery = cursorPlacementQuery.replaceAll("|", "");

  const foundElement = screen.getByText(plainQuery, { exact: false });
  const queryOffsetInElement =
    foundElement.textContent?.indexOf(plainQuery) ?? 0;

  const pos = view.posAtDOM(foundElement, 0);

  return pos + queryOffsetInElement + offset;
};
