export type MarkSpec<T = {}> = {
  content?: string;
  group?: string;
  parseDOM?: Array<{ tag: string }>;
  attrs?: T;
  toDOM?: (node: T) => readonly [string, ...any[]];
};
