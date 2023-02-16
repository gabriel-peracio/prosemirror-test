import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import { isEqual, times } from "lodash";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import styles from "./DetectPageBreak.module.scss";
import { getPosMap, getTextBlockNodes, mmPxHeight } from "./utils";
import { Page, PageOrientation, PageSizeNames } from "./PageSize";
import { v3 } from "murmurhash";

export const DetectPageBreakPluginKey = new PluginKey("DetectPageBreakPlugin");
const DEBUG = false;

const A4 = new Page(PageSizeNames.A4, PageOrientation.Portrait, {
  unit: "mm",
  horizontal: 20,
  vertical: 40,
});

type DetectPageBreakPluginState = {
  positions: number[];
};

type DetectPageBreakPluginMeta = {
  positions: number[];
};

// /**
//  * When a page break is placed, there is a small gap in the end of the text that is not enough
//  * to fit a line of text, but needs to be accounted for, because when we calculate the page breaks for the
//  * subsequent pages, the artificial decorations go away, and the rects do not know about such gaps.
//  */
const pageRemainders = new Map<number, number>();
const sumRemaindersUpToPage = (page: number) => {
  let sum = 0;
  for (let i = 0; i < page; i++) {
    sum += pageRemainders.get(i) || 0;
  }
  return sum;
};

if (DEBUG) {
  setInterval(() => {
    document.querySelectorAll(`.${styles.pageMarker}`).forEach((el) => {
      el.remove();
    });
    times(7, (i) => {
      const A4Bottom = A4.getInnerBottom(i);
      const accumulatedRemainders = sumRemaindersUpToPage(i);
      const accumulatedGaps = mmPxHeight * 100 * i + sumRemaindersUpToPage(i);
      const bottomBound = A4Bottom - accumulatedRemainders + accumulatedGaps;
      const pageTransition = document.createElement("div");
      pageTransition.classList.add(styles.pageMarker);
      pageTransition.style.transform = `translateY(${bottomBound + 75.591}px)`;
      pageTransition.innerHTML = `<div class="${
        styles.formula
      }">A4Bottom(${i}):${A4Bottom} - accumulatedRemainders(${i}): ${accumulatedRemainders} + accumulatedGaps(${i}): ${accumulatedGaps} + 75.591 = ${
        bottomBound + 75.591
      }</div>`;
      document.body.appendChild(pageTransition);
    });
  }, 1000);
}

/**
 * Calculates the position of the page break within the node, and how much space remains on the page before the break.
 * This function has the side-effect of populating the `pageRemainders` map.
 * @param domNode The node to check for page breaks
 * @param pageBefore The index of the page before the break.
 * @param startOfContent The vertical (Y) position of the ProseEditor div
 * @param previousNodeBottom the bottom position of the previous node (as in, the node before the one we're currently
 * checking)
 * @returns The position of the page break within the node (not a prosemirror position, beware!) as well as how much
 * space remains on the page before the break (because there wasn't room to fit a line of text)
 */
const calculatePageBreakPositionForNode = (
  domNode: HTMLElement,
  pageBefore: number,
  startOfContent: number,
  previousNodeBottom: number
) => {
  const { nodeSize, mapPos } = getPosMap(domNode); // 2.28%
  // const nodeCharCount = domNode.textContent!.length;

  const range = document.createRange();
  let remainder = 0;
  const bottomBoundary = A4.getInnerBottom(pageBefore);

  let positionBeforeBreak = 0;
  let positionAfterBreak = nodeSize;
  let wasLastCharacterAboveBreak = false;
  let lastCharacterChecked = 0;
  let bottomOfLastCharacterAboveBreak: number | null = null;

  for (let i = 0; i < nodeSize; i++) {
    // Beware: there might be off-by-one errors here because we `floor`.
    // It is possible that the break lies in the last character of the node, or that the first character is already
    // on the next page.
    let characterBeingChecked = Math.floor(
      (positionBeforeBreak + positionAfterBreak) / 2
    );

    const { node, pos } = mapPos(characterBeingChecked);
    range.setStart(node, pos);
    range.setEnd(node, pos);
    const { bottom: _bottom } = range.getBoundingClientRect();
    const bottom = _bottom - startOfContent + sumRemaindersUpToPage(pageBefore);
    const isCurrentCharacterAfterBreak = bottom > bottomBoundary;

    let foundCharacter: number | null = null;

    if (isCurrentCharacterAfterBreak) {
      // current character is AFTER break
      if (
        positionBeforeBreak === characterBeingChecked - 1 ||
        (wasLastCharacterAboveBreak &&
          lastCharacterChecked === characterBeingChecked - 1)
      ) {
        // two scenarios:
        //  1. the current character is the first character AFTER the break
        //  2. in the previous iteration, the character we checked then was BEFORE the break, and in this iteration,
        //     the character we're checking now is AFTER the break.
        //     If the previous character came BEFORE the current character, then we've found the position of the page
        //     break
        foundCharacter = characterBeingChecked;
      }
      positionAfterBreak = characterBeingChecked;
    } else {
      // current character is BEFORE break
      if (
        positionAfterBreak === characterBeingChecked + 1 ||
        (!wasLastCharacterAboveBreak &&
          lastCharacterChecked === characterBeingChecked + 1)
      ) {
        // two scenarios:
        //  1. the current character is the character immediately BEFORE the break
        //  2. in the previous iteration, the character we checked then was AFTER the break, and in this iteration,
        //     the character we're checking now is BEFORE the break.
        //     If the previous character comes immediately AFTER the current character, then we've found the position
        //     of the page break
        foundCharacter = characterBeingChecked + 1;
      }
      positionBeforeBreak = characterBeingChecked;
      bottomOfLastCharacterAboveBreak = bottom;
    }
    wasLastCharacterAboveBreak = !isCurrentCharacterAfterBreak;
    lastCharacterChecked = characterBeingChecked;

    if (foundCharacter !== null) {
      remainder =
        bottomBoundary -
        (bottomOfLastCharacterAboveBreak ?? previousNodeBottom);
      pageRemainders.set(pageBefore, remainder);
      return { posWithinNode: foundCharacter, remainder };
    }
  }
  throw new Error("Could not find page break position for node");
};

/**
 * Calculates the (prosemirror) positions of page breaks in the document.
 * @param view A ProseMirror EditorView
 * @param nodeList A list of textual nodes in the document, sorted by their position in the document
 * @returns A list of prosemirror positions where page break decorations should be inserted
 */
const calculatePageBreakPositions = (
  view: EditorView,
  nodeList: ReturnType<typeof getTextBlockNodes>
) => {
  const startOfContent =
    view.dom.parentElement?.getBoundingClientRect().top ?? 0;
  // return early if top is 0 (i.e. the editor is not mounted or `getBoundingClientRect` failed)

  let currentPage = 0;
  let i = 0;
  let previousNodeBottom = 0;

  const foundPositions = new Set<number>();

  for (const { domNode, pos } of nodeList) {
    // console.group(`node ${i}`);
    const bottomBoundary = A4.getInnerBottom(currentPage);

    const { top, bottom: _bottom } = domNode.getBoundingClientRect();
    const bottom =
      _bottom - startOfContent + sumRemaindersUpToPage(currentPage);

    if (bottom <= bottomBoundary) {
      // this node is fully contained within the current page, no further action needed

      i++;
      previousNodeBottom = bottom;
      // console.groupEnd();
      continue;
    }

    if (nodeCache.has(domNode)) {
      // this node has already been processed
      const cachedNodeData = nodeCache.get(domNode);
      if (
        cachedNodeData &&
        top === cachedNodeData.top &&
        bottom === cachedNodeData.bottom &&
        v3(domNode.textContent ?? "") === cachedNodeData.contentHash
      ) {
        // the node has not changed position, so we can use the cached page break position
        foundPositions.add(pos + cachedNodeData.pageBreakPositionWithinNode);
        currentPage++;
        i++;
        previousNodeBottom = bottom;
        continue;
      } else {
        // the node has changed position, so we need to recalculate the page break position
        console.log("could not use cached page break position", {
          cachedNodeData,
          top,
          bottom,
        });
        nodeCache.delete(domNode);
      }
    }

    const { posWithinNode, remainder } = calculatePageBreakPositionForNode(
      domNode,
      currentPage,
      startOfContent,
      previousNodeBottom
    );
    // console.log(`node ${i} is not fully contained within page ${currentPage}`, {
    //   pos,
    //   remainder,
    //   bottom,
    //   [`A4.getInnerBottom(${currentPage})`]: A4.getInnerBottom(currentPage),
    //   [`sumRemaindersUpToAndIncludingPage(${currentPage})`]:
    //     sumRemaindersUpToPage(currentPage),
    // });
    foundPositions.add(pos + posWithinNode);
    currentPage++;
    i++;
    previousNodeBottom = bottom;
    nodeCache.set(domNode, {
      top,
      bottom,
      contentHash: v3(domNode.textContent ?? ""),
      pageBreakPositionWithinNode: posWithinNode,
    });
    // console.groupEnd();
  }
  return Array.from(foundPositions);
};

const handleUpdate = (view: EditorView, prevState: EditorState) => {
  if (!view.dom.isConnected) {
    // if the editor is not connected to the DOM, we can't calculate the page break positions, so we'll just
    // schedule a new update
    setTimeout(() => handleUpdate(view, prevState), 0);
    // don't forget to return early! Everything after this would be wasted effort
    return;
  }
  const oldPluginState: DetectPageBreakPluginState =
    DetectPageBreakPluginKey.getState(view.state);

  // return early if the document hasn't changed (e.g. the only change was a selection change or some other
  // irrelevant change)
  if (view.state.doc.eq(prevState.doc) && oldPluginState.positions.length !== 0)
    return;
  console.time("calculating positions");

  const nodeList = getTextBlockNodes(view);
  // by adding the class "page-break-detecting", we "turn off" all the page break decorations currently visible,
  // which allows us to calculate the correct page break positions without having to compensate for the
  // decorations themselves
  view.dom.classList.add("page-break-detecting");
  const pageBreakPositions = calculatePageBreakPositions(view, nodeList);
  // after calculating the page break positions, we can remove the class again, which will re-enable the decorations
  // because we did everything within the same rendering pass, the document will not reflow, and the user won't see
  // a flicker
  view.dom.classList.remove("page-break-detecting");
  console.timeEnd("calculating positions");

  if (pageBreakPositions.length > 0) {
    // if the positions haven't changed, we don't need to dispatch a new transaction
    if (isEqual(oldPluginState.positions, pageBreakPositions)) return;
    const meta: DetectPageBreakPluginMeta = {
      positions: pageBreakPositions,
    };
    const tr = view.state.tr.setMeta(DetectPageBreakPluginKey, meta);

    view.dispatch(tr);
  }
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
    update: handleUpdate,
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
          return Decoration.widget(
            pos,
            makeWidget(pageRemainders.get(idx) ?? 0),
            {
              key: `line-break-${idx}`,
            }
          );
        })
      );
    },
  },
});

const makeWidget: (
  remainder: number
) => Parameters<typeof Decoration.widget>[1] =
  (remainder) => (view, getPos) => {
    const widget = document.createElement("div");
    widget.classList.add(styles.lineBreak);
    widget.classList.add(DEBUG ? styles.debug : styles.nonDebug);
    widget.innerHTML = `<div class="${styles.remainder}" style="height: ${remainder}px"></div>`;
    widget.style.height = `${100 * mmPxHeight + remainder}px`;
    return widget;
  };

/**
 * Holds weak references to HTMLElements (nodes), meaning they will be garbage collected when the node is removed from
 * the DOM.
 * The value is an object containing the top and bottom position of the node rect, the position of the page break
 * within the node (not a prosemirror position, but a position within the node's textContent), and a hash of the
 * node's textContent.
 *
 * The intention is to use this to avoid recalculating the page break position for a node.
 *
 * The reason we store the position within the node instead of the prosemirror position is because although the node
 * might have the same position/rect, the text content might have changed
 *
 * We also need to know if the text content has changed, because that will affect the page break position. The reason
 * we store a hash instead of simply comparing the length of the textContent is because it is possible for the text
 * dimensions to change without the overall length changing, for example if a very wide character such as a `W` is
 * replaced with a very narrow character such as a `|`. This would not be necessary if the font was monospaced, but we
 * cannot assume that.
 */
const nodeCache = new WeakMap<
  Node,
  {
    bottom: number;
    top: number;
    contentHash: number;
    pageBreakPositionWithinNode: number;
  }
>();
