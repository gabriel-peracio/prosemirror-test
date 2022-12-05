import { EditorView } from "prosemirror-view";
import { TextSelection } from "prosemirror-state";
import { screen, act } from "@testing-library/react";

/**
 * Given the editor view and a search string with a pipe character, find that string in the prosemirror-doc and then
 * place the cursor at the position indicated by the | character.
 * This function automatically dispatches the `setSelection` transaction and does not need to be wrapped in `act`.
 * @param view the editor view
 * @param cursorPlacementQuery A string consisting of the text you are looking for (case sensitive) and a pipe
 * character `|` indicating where in the string the cursor should be positioned.
 * @example
 * ```
 * renderNewDoc(doc(p('Hello'), p('World'), p()))
 * placeCursorByQuery('Hello|')
 * expect(editorView.state.selection.from).toBe(6)
 * ```
 */
export const placeCursorByQuery = (
  view: EditorView,
  cursorPlacementQuery: string
) => {
  const {
    dispatch,
    state: { tr },
  } = view;

  const offset = cursorPlacementQuery.indexOf("|");
  if (offset === -1) {
    throw new Error(
      `Malformed cursorPlacementQuery. Please include the pipe character.`
    );
  }

  const nextPipe = cursorPlacementQuery.indexOf("|", offset + 1);
  const range = nextPipe === -1 ? 0 : nextPipe - 1;

  const plainQuery = cursorPlacementQuery.replaceAll("|", "");

  const foundElement = screen.getByText(plainQuery, { exact: false });
  const queryOffsetInElement =
    foundElement.textContent?.indexOf(plainQuery) ?? 0;

  const pos = view.posAtDOM(foundElement, 0);

  act(() => {
    dispatch(
      tr.setSelection(
        TextSelection.create(
          tr.doc,
          pos + queryOffsetInElement + offset,
          pos + queryOffsetInElement + offset + range
        )
      )
    );
  });
};
