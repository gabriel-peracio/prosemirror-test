import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Node as ProseNode } from "prosemirror-model";
import { isEqual } from "lodash";
import { Decoration, DecorationSet } from "prosemirror-view";
import styles from "./DetectPageBreak.module.scss";

/**
 * Known bugs:
 * - You need to click somewhere on the doc to get the page breaks to show up for the first time.
 * - If you zoom after `mmPxHeight` is calculated, the new page break is incorrect.
 * - Try bolding `Etiamvulputateegestasmagna` in the demo. The new page break is incorrect.
 */

export const DetectPageBreakPluginKey = new PluginKey("DetectPageBreakPlugin");

const mmPxHeight = (() => {
  const el = document.createElement("div");
  el.style.height = "100mm";
  document.body.appendChild(el);
  const rect = el.getBoundingClientRect().height / 100;
  document.body.removeChild(el);
  return rect;
})();
console.log(`mmPxHeight:`, mmPxHeight);

const A4 = [210 * mmPxHeight, 297 * mmPxHeight] as const;

type DetectPageBreakPluginState = {
  positions: number[];
};

type DetectPageBreakPluginMeta = {
  positions: number[];
};

const getPosOffsetFromPoint = (x: number, y: number) => {
  let foundPos: number = 0;
  let rangeParent: Element;
  let rangeNode: Node;
  if ("caretRangeFromPoint" in document) {
    const cr = document.caretRangeFromPoint(x, y);
    if (!cr || cr.startOffset === undefined) return undefined;
    foundPos = cr.startOffset + 1;
    rangeParent = cr.startContainer.parentElement!;
    rangeNode = cr.startContainer;
  } else {
    // Firefox
    const caretPosition: {
      offsetNode: Node | null;
      offset: number;
    } | null = (document as any).caretPositionFromPoint(x, y);
    if (!caretPosition || caretPosition.offsetNode === null) return undefined;
    foundPos = caretPosition.offset + 1;
    rangeParent = caretPosition.offsetNode.parentElement!;
    rangeNode = caretPosition.offsetNode;
  }

  const siblingsIncludingSelf = Array.from(rangeParent!.childNodes);
  const indexWithinParent = siblingsIncludingSelf.findIndex(
    (siblingOrSelf) => siblingOrSelf === rangeNode
  );
  if (indexWithinParent > 1) {
    const extraOffset = siblingsIncludingSelf
      .slice(0, indexWithinParent)
      .reduce((acc, sibling) => {
        if (sibling.nodeType === Node.TEXT_NODE) {
          acc += sibling.textContent!.length;
        }
        return acc;
      }, 0);
    foundPos += extraOffset;
  }
  return foundPos;
};

export const DetectPageBreakPlugin = new Plugin<DetectPageBreakPluginState>({
  key: DetectPageBreakPluginKey,
  state: {
    init() {
      return { positions: [] };
    },
    apply(tr, state) {
      const meta: DetectPageBreakPluginMeta | undefined = tr.getMeta(
        DetectPageBreakPluginKey
      );
      if (meta) {
        return { positions: meta.positions };
      }
      return state;
    },
  },
  view: (editorView) => ({
    update: (view, prevState) => {
      const oldState: DetectPageBreakPluginState =
        DetectPageBreakPluginKey.getState(view.state);
      if (view.state.doc.eq(prevState.doc) && oldState.positions.length !== 0)
        return;
      console.time("calculating positions");
      view.dom.classList.add("page-break-detecting");

      const nodeList: Array<{
        node: ProseNode;
        domNode: Node;
        pos: number;
      }> = [];
      view.state.doc.nodesBetween(
        0,
        view.state.doc.content.size,
        (node, pos) => {
          if (node.type.isTextblock) {
            nodeList.push({
              node,
              domNode: view.domAtPos(pos + 1).node,
              pos,
            });
            return false;
          }
          return true;
        }
      );
      const positions = nodeList.flatMap(({ node, domNode, pos }) => {
        const range = document.createRange();
        range.setStartBefore(domNode.firstChild!);
        range.setEndAfter(domNode.lastChild!);
        const rangeRects = Array.from(range.getClientRects()).filter(
          (rect, idx, rectList) => {
            if (
              idx > 0 &&
              rectList[idx - 1].top === rect.top &&
              rectList[idx - 1].left < rect.left
            )
              return false;
            return true;
          }
        );

        const posList = rangeRects.flatMap((rect) => {
          if (rect.width === 0) return [];
          let foundPosOffset = getPosOffsetFromPoint(rect.left, rect.top);

          if (!foundPosOffset) return [];
          return [{ pos: pos + foundPosOffset, rect }];
        });
        return posList;
      });

      const pageBreakPositions = positions.reduce<number[]>(
        (acc, { pos, rect }) => {
          const nextBoundary = A4[1] * (acc.length + 1) - mmPxHeight * 40;
          const scrollOffset =
            view.dom.parentElement!.getBoundingClientRect().top;
          const rectPos = rect.top - scrollOffset;
          if (rectPos > nextBoundary && !acc.includes(pos)) {
            return [...acc, pos];
          }
          return acc;
        },
        []
      );

      console.timeEnd("calculating positions");

      view.dom.classList.remove("page-break-detecting");
      if (pageBreakPositions.length > 0) {
        if (isEqual(oldState.positions, pageBreakPositions)) return;
        const meta: DetectPageBreakPluginMeta = {
          positions: pageBreakPositions,
        };
        const tr = view.state.tr.setMeta(DetectPageBreakPluginKey, meta);

        view.dispatch(tr);
      }
    },
  }),
  props: {
    decorations(state) {
      const { positions } = DetectPageBreakPluginKey.getState(
        state
      ) as DetectPageBreakPluginState;
      if (positions.length === 0) return DecorationSet.empty;

      return DecorationSet.create(
        state.doc,
        positions.map((pos, idx) => {
          return Decoration.widget(pos, makeWidget, {
            key: `line-break-${idx}`,
          });
        })
      );
    },
  },
});

const makeWidget: Parameters<typeof Decoration.widget>[1] = (view, getPos) => {
  const widget = document.createElement("div");
  widget.classList.add(styles.lineBreak);
  return widget;
};
