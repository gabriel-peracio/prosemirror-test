import { schema } from "prose/schema";
import { Fragment, Slice } from "prosemirror-model";
import { Command, TextSelection } from "prosemirror-state";

export const splitListItem: Command = (
  { tr, selection: { $from, $to } },
  dispatch
) => {
  if ($from === $to) {
    if ($to.depth < 3) return false; // not in a list (must be at least doc(0)>ul(1)>li(2)>p(3))
    if ($to.node(-1)?.type === schema.nodes.list_item) {
      if ($to.pos === $to.end()) {
        // at the end of the list item
        tr.insert(
          $to.pos,
          schema.nodes.list_item.create(
            $to.node(-1).attrs,
            schema.nodes.paragraph.create()
          )
        );
        tr.setSelection(TextSelection.create(tr.doc, $to.pos + 4));
        dispatch?.(tr);
        return true;
      }
    }
  } else {
    // this is a range
    tr.doc.nodesBetween($to.pos, $to.end(), (node, pos) => {
      console.log(node, pos);
    });
    tr.deleteSelection();

    dispatch?.(tr);
    return true;
  }
  return false;
};
