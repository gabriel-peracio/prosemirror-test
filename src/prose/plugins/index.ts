import { Keymap } from "./Keymap";
import { keymap } from "prosemirror-keymap";
import { history } from "prosemirror-history";
import { InputRules } from "./inputRules";
import { DetectPageBreakPlugin } from "./DetectPageBreak/DetectPageBreak";

export const plugins = [
  history(),
  keymap(Keymap),
  InputRules,
  DetectPageBreakPlugin,
];

export { Keymap, InputRules };
