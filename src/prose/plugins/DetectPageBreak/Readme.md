# TODO:

- [x] mm->px conversion
- [x] inch->px conversion
- [x] Debug mode
- [] Last page will appear to "end early" and be smaller than a full page.
- [] Add spacing between paragraphs
- [] Check whether blank paragraphs screw up the calculations
- [] A single paragraph can span more than one page
- [] Correctly handle `orphans` and `widows`
- [] Customize pages (letter/legal/etc) and margins

# Ideas

# Experiments

- Investigate the impact of `break-before` and `break-after`

# Findings

- Prosemirror node references are not stable, but `DOMNodes` are, which means they can be used as cache keys
- CSS `orphans` and `widows` will screw up the calculation, since they default to `2`. There is enough space to put them in
- `line-height` has a different default between Chrome and Firefox. Setting it to `1` makes it work
