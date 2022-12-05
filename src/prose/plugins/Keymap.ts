import {
  Indentation,
  listItemIndentation,
} from "prose/commands/listItemIndentation";
import { splitListItem } from "prose/commands/splitListItem";
import { schema } from "prose/schema";
import {
  chainCommands,
  // baseKeymap,
  createParagraphNear,
  deleteSelection,
  joinBackward,
  joinForward,
  liftEmptyBlock,
  // deleteSelection,
  // joinBackward,
  // selectNodeBackward,
  splitBlock,
  toggleMark,
} from "prosemirror-commands";
import { redo, undo } from "prosemirror-history";

export const Keymap = {
  Enter: chainCommands(splitListItem, splitBlock),
  Backspace: chainCommands(deleteSelection, joinBackward),
  Delete: chainCommands(deleteSelection, joinForward),
  Tab: listItemIndentation(Indentation.Increase),
  "Shift-Tab": listItemIndentation(Indentation.Decrease),
  "Mod-z": undo,
  "Mod-y": redo,
  "Mod-b": toggleMark(schema.marks.strong),
  "Mod-u": toggleMark(schema.marks.underline),
  "Mod-i": toggleMark(schema.marks.em),
};
