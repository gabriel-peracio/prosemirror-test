import { render } from "@testing-library/react";
import { Node } from "prosemirror-model";
import { EditorStateConfig } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { doc, p } from "./builders";
import { EditorTestHarness } from "./EditorTestHarness";
import { plugins } from "prose/plugins";

class RenderNewDocResult {
  private _view?: EditorView;
  get view() {
    return this._view!;
  }
  set view(value) {
    this._view = value;
  }
}

// type renderNewDocType = (
//   newDoc?: Node,
//   options?: {
//     plugins?: EditorStateConfig["plugins"];
//   }
// ) => RenderNewDocResult;

type renderNewDocOptions = {
  plugins?: EditorStateConfig["plugins"];
};

export function renderNewDoc(): RenderNewDocResult;
export function renderNewDoc(newDoc: Node): RenderNewDocResult;
export function renderNewDoc(
  newDoc: Node,
  options: renderNewDocOptions
): RenderNewDocResult;
export function renderNewDoc(options: renderNewDocOptions): RenderNewDocResult;

export function renderNewDoc(
  docNodeOrOptions?: Node | renderNewDocOptions,
  _options?: renderNewDocOptions
) {
  let newDoc = docNodeOrOptions instanceof Node ? docNodeOrOptions : doc(p());
  const defaultOptions = {
    plugins,
  };
  let options = Object.assign(
    {},
    defaultOptions,
    _options,
    docNodeOrOptions instanceof Node ? {} : docNodeOrOptions
  );

  const result = new RenderNewDocResult();
  render(
    <EditorTestHarness
      doc={newDoc}
      onViewChanged={(newView) => (result.view = newView)}
      plugins={options.plugins}
    />
  );

  return result;
}
