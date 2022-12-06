import { schema } from "prose/schema";
import { InputRule, inputRules } from "prosemirror-inputrules";

/**
 * Transforms `- ` into an unordered list
 */
const ulMarkdownRule = new InputRule(/^-\s$/, (state, match, start, end) => {
  const { tr } = state;
  tr.replaceWith(
    start - 1,
    end + 1,
    schema.nodes.unordered_list.create(
      null,
      schema.nodes.list_item.create(null, schema.nodes.paragraph.create())
    )
  );
  return tr;
});

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

const rules: InputRule[] = [
  ulMarkdownRule,
  olMarkdownRule,
  headingMarkdownRule,
];

export const InputRules = inputRules({ rules });
