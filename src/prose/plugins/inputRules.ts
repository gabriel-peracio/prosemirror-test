import { schema } from "prose/schema";
import { InputRule, inputRules } from "prosemirror-inputrules";

const rules: InputRule[] = [
  new InputRule(/^-\s$/, (state, match, start, end) => {
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
  }),
];

export const InputRules = inputRules({ rules });
