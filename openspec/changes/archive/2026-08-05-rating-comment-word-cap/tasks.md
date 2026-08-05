# Tasks — a rating comment is capped at 15 words

All tasks are **prose edits** to markdown skills. This repo has no compiled code and no test
harness for prose, so no task carries a TDD gate; the gates are the bundle build, the KB
citation gate, and a cross-read against `specs/rating-comment-shape/spec.md`.

The rule must land in **identical wording** everywhere — that is what stops the next change
re-drifting one file. Group 1 writes that wording; groups 2 and 3 copy it verbatim. The three
groups have disjoint write sets and may run in parallel after group 1's wording is fixed.

**The wording every group uses** (from design §D1/§D2/§D5), stated once per skill at the point
it saves a comment:

> **At most 15 Vietnamese words, counted** — the reason this is strong or weak. How many
> sentences those words form is your call; there is no one-line rule. Nothing else goes in it: not the rule or doc it traces to, not the formula,
> not the opening frame, not the axis terms (those are carried by `terms[]`, the coverage
> record and this run's report). Where the mechanism beat leans on a proof row, one compact
> tag follows it, outside the count — `· proof: <row as the live doc names it>`,
> plus `(ngoài nhóm bằng chứng của cơ chế)` where the row sits outside the mechanism's own
> family; with no mechanism beat there is **no tag at all**. **The cap never changes a
> judgement:** a floor failure is still a REJECT, a score is still honest, and a fault that
> does not fit goes to the run report — never a merged vague phrase, never a softened verdict.

## 1. The producers and judges

- [x] 1.1 `skills/ssc-ads-writer/SKILL.md` — replace the comment instruction at Step 7 (l.523: "the single biggest reason … naming the rule / voice doc it traces to … also names the row of `brand/proof-points`") with the capped wording; the proof row becomes the trailing tag. Apply the same cap to the coverage `notes` (l.549, l.571) and to the `comment:` line in the Step 8 save block (l.573) and its argument note (l.581).
- [x] 1.2 `skills/ssc-post-authority/SKILL.md` — same, at the `comment` definition (l.311), the coverage `notes` (l.421, l.451, l.488), the Step 7 report line (l.525), and any judging bullet that tells the comment to name a criterion.
- [x] 1.3 `skills/ssc-image-prompt-text/SKILL.md` — same, at the brand-fit block (l.296) and the Step P6 save block (l.332-334), where the comment currently carries "the formula, the opening frame and the proof row" — only the proof row survives, as the tag.
- [x] 1.4 `skills/ssc-post-produce/SKILL.md` — this skill records rather than scores; apply the cap wherever it hands a rationale to the authority or writes one into a report line, and keep the proof-row hand-off intact.
- [x] 1.5 `skills/ssc-ads-brief/SKILL.md` — the angle self-score comment carries the cap (per the `ads-brief-angles` delta), and the ≤3 drop-and-regenerate gate is explicitly unaffected by it.

## 2. Idea, schedule and channel skills

- [x] 2.1 `skills/ssc-ads-ideate/SKILL.md` and `skills/ssc-post-ideate/SKILL.md` — capped wording at each point a rated row is saved.
- [x] 2.2 `skills/ssc-post-schedule/SKILL.md` — same.
- [x] 2.3 `skills/ssc-youtube-ideate/SKILL.md` and `skills/ssc-youtube-seo/SKILL.md` — same.
- [x] 2.4 `skills/ssc-video-script/SKILL.md` and `skills/ssc-video-storyboard/SKILL.md` — same.

## 3. Strategy skills

- [x] 3.1 `skills/ssc-strategy-ad-intelligence/SKILL.md`, `-audience-intelligence`, `-competitor-intelligence` — capped wording at each save.
- [x] 3.2 `skills/ssc-strategy-content-gap/SKILL.md`, `-kol-discovery`, `-performance-retrospective`, `-territory-explorer` — same.

## 4. Post rows persist their coverage axes

The opening frame lived only in the post `comment`, and `ssc-post-authority` writes no
`terms[]` — so clearing the comment would leave a post row with no record of it. The ad and
image paths already persist the frame as an axis term; the post path now does too.

- [x] 4.1 `skills/ssc-post-authority/SKILL.md` — add `list_taxonomies` to `tools:`; resolve the axis rosters live (the same five kinds `ssc-ads-writer` resolves) and hold each term's **id**; pass `terms[]` on every `save_content` insert, carrying the candidate's axis positions including its declared `opening_frame`.
- [x] 4.2 Same file — state the server's strict validation: an unknown term id, or two terms of a single-cardinality axis, refuses the WHOLE write and persists nothing; surface such a refusal rather than retrying with the term dropped or guessed. An empty roster records nothing for that axis and is named in the summary.
- [x] 4.3 Confirm the hand-off still works: `ssc-post-produce` already reports each variation's axis position, so the authority maps those to ids rather than re-deriving them.

## 5. Cross-read and release

- [x] 5.1 Cross-read all nineteen edited files against `specs/rating-comment-shape/spec.md`: the cap is stated in the same words everywhere; no skill still asks a comment to name a rule, a formula, an opening frame or an axis term; the proof-row tag appears **only** where a mechanism beat exists and is absent (not `NONE`) otherwise; and **no rejection, score, or coverage verdict was weakened to fit the cap** (design §D5 — the one finding worth hunting).
- [x] 5.2 Confirm no skill claims the server enforces the cap (design §D7).
- [x] 5.3 Run `node scripts/build-chatgpt-bundle.mjs` — exit 0.
- [x] 5.4 Bump `version` in `plugins/ssc/.claude-plugin/plugin.json` — same commit.
- [x] 5.5 Run `scripts/publish-chatgpt-bundle.sh` with the cluster `DATABASE_URL_BRANDOS` (port-forward per the script header) — KB citation gate must pass, mirror written to `content/`.
