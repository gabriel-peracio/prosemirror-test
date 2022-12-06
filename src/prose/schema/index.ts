import { Schema } from "prosemirror-model";
import {
  doc,
  paragraph,
  text,
  unordered_list,
  list_item,
  ordered_list,
} from "./nodes";
import { em, strong, underline } from "./marks";

export const nodes = {
  doc,
  text,
  paragraph,
  unordered_list,
  ordered_list,
  list_item,
};

export const marks = {
  strong,
  underline,
  em,
};

export const schema = new Schema({ nodes: nodes as any, marks });
