import { drop } from "lodash";
import { schema } from "prose/schema";
import { isEmptyTextualNode } from "prose/utils/node";
import { Fragment } from "prosemirror-model";
import { Command, TextSelection } from "prosemirror-state";

/**
 * Splits a list item into two list items based on your selection.
 * Will delete the selection if it is not empty, and stuff everything from the end of the selection to the end of the
 * node into the new list item.
 */
export const splitListItem: Command = (
  { tr, selection: { $from, $to, empty } },
  dispatch
) => {
  if ($from.node(-1).type !== schema.nodes.list_item) return false;

  const listItemNodeAttrs = $from.node(-1).attrs;
  if (empty) {
    // caret selection
    const offsetInGroup = $to.before() - ($to.before(-1) + 1);
    let contentAfterTo = $to
      .node(-1)
      .content.cut($to.parentOffset + offsetInGroup + 1);
    const shouldDeleteEmptyParagraphBehind =
      $from.start() === $from.pos && $from.start(-1) !== $from.pos - 1;
    if (shouldDeleteEmptyParagraphBehind) {
      tr.delete($from.start() + $from.parentOffset - 1, $from.end(-1));
    } else {
      tr.delete($from.start() + $from.parentOffset, $from.end(-1) + 1);
    }
    // do not keep the line break when making a new list item
    if (
      contentAfterTo.childCount > 1 &&
      isEmptyTextualNode(contentAfterTo.firstChild)
    ) {
      contentAfterTo = Fragment.from(drop(contentAfterTo.content, 1));
    }
    tr.insert(
      $from.start() + $from.parentOffset,
      schema.nodes.list_item.create(listItemNodeAttrs, contentAfterTo)
    );
    if (shouldDeleteEmptyParagraphBehind) {
      tr.setSelection(
        TextSelection.create(tr.doc, tr.mapping.map($from.pos) + 3)
      );
    } else {
      tr.setSelection(
        TextSelection.create(tr.doc, tr.mapping.map($from.pos) + 4)
      );
    }
  } else if ($from.node(-1) === $to.node(-1)) {
    // selection within the same list item
    const offsetInGroup = $to.before() - ($to.before(-1) + 1);
    const contentAfterTo = $to
      .node(-1)
      .content.cut($to.parentOffset + offsetInGroup + 1);
    const shouldDeleteEmptyParagraphBehind =
      $from.start() === $from.pos && $from.start(-1) !== $from.pos - 1;
    if (shouldDeleteEmptyParagraphBehind) {
      tr.delete($from.start() + $from.parentOffset - 1, $from.end(-1));
    } else {
      tr.delete($from.start() + $from.parentOffset, $from.end(-1) + 1);
    }
    tr.insert(
      $from.start() + $from.parentOffset,
      schema.nodes.list_item.create(listItemNodeAttrs, contentAfterTo)
    );
    if (shouldDeleteEmptyParagraphBehind) {
      tr.setSelection(
        TextSelection.create(tr.doc, tr.mapping.map($from.pos) + 3)
      );
    } else {
      tr.setSelection(
        TextSelection.create(tr.doc, tr.mapping.map($from.pos) + 4)
      );
    }
  } else {
    if ($to.node(-1).type === schema.nodes.list_item) {
      const contentAfterTo = $to.node(-1).content.cut($to.parentOffset + 1);
      const newListItem = schema.nodes.list_item.create(
        listItemNodeAttrs,
        contentAfterTo
      );
      tr.deleteSelection();
      tr.replaceWith(
        tr.mapping.map($to.pos),
        tr.mapping.map($to.end()),
        newListItem
      );
      tr.setSelection(
        TextSelection.create(tr.doc, tr.mapping.map($to.pos) + 4)
      );
    } else {
      const contentAfterTo = $to.node(0).slice(tr.mapping.map($to.pos));
      tr.deleteSelection();
      const newListItem = schema.nodes.list_item.create(
        listItemNodeAttrs,
        contentAfterTo.content
      );
      tr.replaceWith(
        tr.mapping.map($to.pos),
        tr.mapping.map($to.end()),
        newListItem
      );
      tr.setSelection(
        TextSelection.create(tr.doc, tr.mapping.map($to.pos) + 4)
      );
    }
  }

  dispatch?.(tr);
  return true;
};
