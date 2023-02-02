import { schema } from "prose/schema";
import { InputRule, inputRules } from "prosemirror-inputrules";

/**
 * Transforms `-` into an unordered list
 * Except when it detects you're trying to type a check list (e.g. `- []`)
 */
// const ulMarkdownRule = new InputRule(/^-\s$/, (state, match, start, end) => {
const ulMarkdownRule = new InputRule(
  /^- ?(?<text>\S+)(?<!\[x?\]?)$/,
  (state, match, start, end) => {
    const { tr } = state;
    const text = match.groups?.text;
    if (state.selection.$from.node(-1).type === schema.nodes.list_item)
      return null;
    tr.replaceWith(
      start - 1,
      end + 1,
      schema.nodes.unordered_list.create(
        null,
        schema.nodes.list_item.create(
          null,
          schema.nodes.paragraph.create(null, text ? [schema.text(text)] : [])
        )
      )
    );
    return tr;
  }
);

/**
 * Transforms `1. ` into an ordered list
 */
const olMarkdownRule = new InputRule(/^1\.\s$/, (state, match, start, end) => {
  const { tr } = state;
  tr.replaceWith(
    start - 1,
    end + 1,
    schema.nodes.ordered_list.create(
      null,
      schema.nodes.list_item.create(null, schema.nodes.paragraph.create())
    )
  );
  return tr;
});

const headingMarkdownRule = new InputRule(
  /^(?<pounds>\#{1,6})\s$/,
  (state, match, start, end) => {
    const { tr } = state;
    tr.replaceWith(
      start - 1,
      end + 1,
      schema.nodes.heading.create({ level: match.groups!.pounds.length })
    );
    return tr;
  }
);

const blockquoteMarkdownRule = new InputRule(
  /^\>\s$/,
  (state, match, start, end) => {
    const { tr } = state;
    tr.replaceWith(start - 1, end + 1, schema.nodes.blockquote.create());
    return tr;
  }
);

const anchorMarkdownRule = new InputRule(
  /^\[(?<text>.+?)\]\((?<href>.+?)\)$/,
  (state, match, start, end) => {
    const { tr } = state;
    tr.replaceWith(
      start - 1,
      end + 1,
      schema.text(match.groups!.text, [
        schema.marks.anchor.create({ href: match.groups!.href }),
      ])
    );
    return tr;
  }
);
const imgMarkdownRule = new InputRule(
  /^\!\[(?<alt>.+?)\]\((?<src>.+?)\)$/,
  (state, match, start, end) => {
    const { tr } = state;
    tr.replaceWith(
      start - 1,
      end + 1,
      schema.nodes.image.create({
        src: match.groups!.src,
        alt: match.groups!.alt,
      })
    );
    return tr;
  }
);

const rules: InputRule[] = [
  ulMarkdownRule,
  olMarkdownRule,
  headingMarkdownRule,
  blockquoteMarkdownRule,
  anchorMarkdownRule,
  imgMarkdownRule,
];

export const InputRules = inputRules({ rules });
