## Why

The Brand OS knowledge base now has 4 personas (Chị Hương, Chị Lan, Chị Mai, and
new Chị Thảo), each with a detailed doc (`brand/persona-huong/lan/mai/thao`)
already live and linked from the `brand/personas` index — but no skill in this
plugin loads those detail docs, and ~10 skill files still hardcode "3
archetypes" by name, silently excluding Chị Thảo. Writing skills are missing
exactly the vocabulary, objections, and trigger-point detail that would make
copy more targeted; ideation/research skills that assume a fixed 3-persona list
will keep excluding the 4th persona from balance checks, tagging enums, and
per-persona research loops until this is fixed.

## What Changes

- Add a persona-doc resolution convention: a persona tag's taxonomy `code`
  (`chi-huong`/`chi-lan`/`chi-mai`/`chi-thao`) maps to `brand/persona-<slug>`;
  single-target skills load the ONE matching detail doc, batch skills load all
  four, alongside the existing `brand/personas` index.
- Update writing skills (`ssc-post-produce`, `ssc-ads-writer`, `ssc-ads-brief`,
  `ssc-video-script`) to load and ground copy in the resolved persona's detail
  doc (real vocabulary, objections, trigger points).
- Update ideation/tagging skills (`ssc-post-ideate`, `ssc-ads-ideate`,
  `ssc-ads-blueprint`, `ssc-youtube-ideate`, `ssc-ads-approaches`) and strategy
  research skills (`ssc-strategy-audience-intelligence`,
  `ssc-strategy-kol-discovery`, `ssc-strategy-territory-explorer`) to load all
  four detail docs and de-hardcode persona name/count.
- De-hardcode persona name/count in remaining generic-reference skills
  (`ssc-strategy-ad-intelligence`, `ssc-strategy-audit`, `ssc-kb-research`,
  `ssc-strategy-develop`, `ssc-strategy-eval`, `ssc-strategy-directions`,
  `ssc-post-focus`, `ssc-ads-focus`, `ssc-ads-image`) so none of them assume a
  fixed 3-persona list going forward.
- Replace symmetric-treatment assumptions (`ssc-ads-blueprint`'s "exactly one
  of 3 named archetypes", `ssc-ads-ideate`'s "all 3 archetypes must appear in
  L1") with logic that reads each persona's priority tier from
  `brand/personas` instead.
- Verify (no functional change expected) `ssc-youtube-briefing` and
  `ssc-youtube-ideate`'s existing dynamic-persona-list pattern still holds as
  the reference example.

**Not included:** authoring or revising any KB document content (already live);
creating the missing `chi-thao` persona taxonomy term (operator's job in
BrandOS directly — outside this repo, no tool here can write it); enforcing
Chị Thảo's breastfeeding-eligibility screening rule in any skill's compliance
gate — a real rule in `brand/persona-thao`, but a persona-specific hardcoded
check would contradict this change's own premise of not special-casing a
specific persona in skill prose. It belongs to a separate, explicitly-scoped
change if pursued.

## Capabilities

### New Capabilities
- `persona-context-grounding`: the cross-cutting rule that any skill writing,
  ideating, or researching content targeted at a specific persona must resolve
  and load that persona's KB detail doc (not just the `brand/personas`
  summary), and must never hardcode the persona name list or count.

### Modified Capabilities
- (none — no existing `openspec/specs/*` capability covers persona handling
  today; `ads-image-visual` is unrelated)

## Impact

- Affected files: 21 skill `SKILL.md` files under `plugins/ssc-content/skills/`
  (listed above), no agent or command files need changes.
- No code, no KB writes, no MCP tool surface changes.
- Depends on (not blocked by, but incomplete without): an operator adding the
  `chi-thao` taxonomy term in BrandOS so `save_idea`/`save_ad_plan_slots` can
  actually tag content for her.
