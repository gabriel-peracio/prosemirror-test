import { Schema } from "prosemirror-model";
import {
  doc,
  paragraph,
  text,
  heading,
  unordered_list,
  ordered_list,
  list_item,
  blockquote,
  image,
} from "./nodes";
import { em, strong, underline, anchor } from "./marks";

export const nodes = {
  doc,
  paragraph,
  text,
  heading,
  unordered_list,
  ordered_list,
  list_item,
  blockquote,
  image,
};

export const marks = {
  strong,
  underline,
  em,
  anchor,
};

export const schema = new Schema({ nodes: nodes as any, marks: marks as any });
