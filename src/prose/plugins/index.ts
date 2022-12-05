import { Keymap } from "./Keymap";
import { keymap } from "prosemirror-keymap";
import { history } from "prosemirror-history";
import { InputRules } from "./inputRules";

export const plugins = [history(), keymap(Keymap), InputRules];

export { Keymap, InputRules };
