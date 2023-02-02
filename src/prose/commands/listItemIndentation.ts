import { clamp } from "lodash";
import { MAX_LIST_ITEM_INDENTATION } from "prose/constants";
// import { schema } from "prose/schema";
import { Node } from "prosemirror-model";
import { Command } from "prosemirror-state";

export enum Indentation {
  Increase = 1,
  Decrease = -1,
}

/**
 * Indent or unindent a list item
 * @param indentation Whether to indent or unindent
 */
export const listItemIndentation =
  (indentation: Indentation): Command =>
  ({ tr, selection: { $from, $to, from, to } }, dispatch) => {
    const posList: Array<[number, Node]> = [];
    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.groups.includes("list_item")) {
        posList.push([pos, node]);
        return false;
      }
    });
    posList.forEach(([pos, node]) => {
      const currentLevel = node.attrs.level || 0;
      const clampedLevel = clamp(
        currentLevel + indentation,
        0,
        MAX_LIST_ITEM_INDENTATION
      );
      if (currentLevel !== clampedLevel) {
        tr.setNodeMarkup(tr.mapping.map(pos), undefined, {
          level: clampedLevel,
        });
      }
    });
    if (posList.length > 0 && tr.docChanged) {
      // tr.setSelection(TextSelection.create(tr.doc, $from.pos, $to.pos));
      dispatch?.(tr);
      return true;
    }
    return false;
  };
