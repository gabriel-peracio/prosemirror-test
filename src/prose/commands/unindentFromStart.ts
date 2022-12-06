import { schema } from "prose/schema";
import { Command } from "prosemirror-state";
import { Indentation, listItemIndentation } from "./listItemIndentation";

export const unindentFromStart: Command = (state, dispatch) => {
  const {
    selection: { empty, $from },
  } = state;
  if (
    empty &&
    $from.depth > 2 &&
    $from.node(-1).type === schema.nodes.list_item &&
    $from.node(-1).attrs.level > 0 &&
    $from.pos === $from.start()
  ) {
    // caret selection at the start of the list item
    return listItemIndentation(Indentation.Decrease)(state, dispatch);
  }
  return false;
};
