## Context

The Brand OS KB (verified live via `get_knowledge`/`list_knowledge`/
`list_taxonomies` during design, not assumed from skill prose) has 4 personas.
`brand/personas` (v8) is a summary index; each persona's entry ends with a
`📄 Chi tiết:` pointer to a per-persona detail doc:

| Persona | Priority tier | Detail doc |
|---|---|---|
| Chị Hương — Tiền mãn kinh (45–55) | Ưu tiên cao nhất | `brand/persona-huong` |
| Chị Lan — Người mẹ bận rộn (35–44) | Ưu tiên cao (khó chuyển đổi nhất) | `brand/persona-lan` |
| Chị Mai — Tìm lại bản thân (50–60) | Ưu tiên trung bình | `brand/persona-mai` |
| Chị Thảo — Mẹ trở lại công sở (30–40) | Ưu tiên chọn lọc (mẹ sau cai sữa) | `brand/persona-thao` |

Each detail doc carries: ranked trigger points with content guidance,
objections + how to dismantle them, real vocabulary to echo/avoid, myths to
debunk, channel/trust behaviour, competitors, buying behaviour, family/cultural
pressure, tone guidance, and a persona-specific compliance "avoid" list. Chị
Thảo's doc additionally states a hard eligibility gate: still-breastfeeding
women are not eligible for the programme (VLCD reduces milk supply) — screen
for "đã cai sữa chưa?" before any pitch; nurture-only content otherwise, per
`content/customer-suitability-triage` + `rules/compliance`.

Every skill that reads persona context does so via **explicit
`get_knowledge(paths:[...])` lists**, never `categories:` fetches, and every
such list today stops at `brand/personas` — the detail docs are invisible to
every pipeline even though they're live. Separately, ~10 skill files hardcode
"3 archetypes" or a literal `'Chị Lan' | 'Chị Hương' | 'Chị Mai'` enum. Two
skills (`ssc-youtube-briefing`, `ssc-youtube-ideate`) already defer to
`brand/personas` dynamically — the reference pattern this change generalizes.

Constraint: the `persona` taxonomy has only 3 terms today (no `chi-thao`), and
no tool on this MCP surface can create taxonomy rows. This change cannot make
Chị Thảo taggable end-to-end — only correct the moment the operator adds that
term in BrandOS directly.

## Goals / Non-Goals

**Goals:**
- Writing skills ground copy in the specific detail doc for the persona the
  content actually targets.
- Ideation/research skills stop hardcoding a fixed persona name/count and
  instead defer to `brand/personas` as the live source of truth.
- Chị Thảo's eligibility gate is an explicit, checked step wherever her
  persona could plausibly be selected — not just documented prose.
- Persona priority tiers (not all 4 personas are equal-priority or
  equal-eligibility) are read from `brand/personas`, not assumed symmetric.

**Non-Goals:**
- Authoring or revising KB document content — already done, live.
- Adding the `chi-thao` taxonomy term — operator's task in BrandOS, outside
  this repo and outside what any available tool can do.
- Changing `brand/personas` itself, or any other KB doc.
- Changing the `save_idea`/`save_ad_plan_slots`/taxonomy tool surfaces.

## Decisions

### 1. Path-resolution convention: code-derived, not hardcoded per skill

A persona tag's taxonomy `code` maps to a KB path by a fixed string rule:
`brand/persona-<code with the "chi-" prefix stripped>` (`chi-huong` →
`brand/persona-huong`, etc.). Every touched skill states this rule the same
way rather than hardcoding "if persona is Hương, load X" branches — so a 5th
persona added later needs zero procedural changes, only a new detail doc plus
a new taxonomy term.

**Alternative considered:** hardcode the 4 current paths as a literal list in
every skill (mirrors how `brand/personas` is loaded today). Rejected: this is
exactly the pattern that produced the current "3 personas" staleness bug: a
literal list silently goes stale the next time the persona set changes. The
code-derived rule is self-updating as long as the persona's taxonomy `code`
and detail-doc path follow the existing `persona-<slug>` naming (already true
for all 4 live docs).

### 2. Two loading shapes, chosen by single-target vs. batch

- **Single-target** (`ssc-post-produce`, `ssc-ads-writer`, `ssc-ads-brief`,
  `ssc-video-script`): each resolves ONE idea/concept with a known persona tag
  already in its existing brief-extraction step. Add exactly one resolved
  `brand/persona-<slug>` path to the KB load — determined after the tag is
  read, not a fixed addition to the static path list, since these skills run
  once per idea/concept and only one persona is ever in play.
- **Batch** (`ssc-post-ideate`, `ssc-ads-ideate`, `ssc-youtube-ideate`,
  `ssc-strategy-audience-intelligence`, `ssc-strategy-kol-discovery`,
  `ssc-strategy-territory-explorer`): each generates/researches across every
  persona in one run. Add all four detail-doc paths as static additions to
  the existing path list — no per-item conditional resolution needed since
  all four are used somewhere in the batch.

**Alternative considered:** always load all four everywhere, including
single-target skills. Rejected: `ssc-post-produce`/`ssc-ads-writer` already
load ~14 explicit paths per run; adding 3 irrelevant persona docs (of the 4)
per run is unnecessary context cost with zero grounding benefit, since the
brief's persona tag is already known before the KB load step runs.

### 3. Priority tier and eligibility read from `brand/personas`, not re-stated numerically

`ssc-ads-blueprint`'s `primary_persona` field description and
`ssc-ads-ideate`'s "all 3 archetypes must appear in L1" check both assume
every persona is equally requireable. Rewrite both to reference
`brand/personas`'s stated priority tier for each persona (e.g. "chọn lọc"
personas are not held to the same required-L1-presence bar as "cao nhất"
ones) rather than re-deriving a new numeric rule (e.g. "top 3 of 4 by tier")
that would itself go stale on the next persona-count change.

### 4. Chị Thảo eligibility gate as a named checklist item, not a scan rewrite

Every writing/ideation/scoring skill already runs some form of embedded
quality gate (banned-words/compliance scan, authenticity guardrail). Rather
than folding the breastfeeding-eligibility check into those existing scans
(which are worded generically and shouldn't grow persona-specific branches),
add it as its own named line: "if this content targets Chị Thảo, confirm it
either addresses an already-weaned mother or is nurture/education-only —
never assume/invite a still-breastfeeding reader." This keeps the existing
scans generic and makes the Thảo-specific rule independently auditable/removable
if her doc's guidance changes later.

## Risks / Trade-offs

- **[Risk]** Detail-doc load adds KB read volume to every writing/ideation
  run → **Mitigation:** each detail doc is comparable in size to KB paths
  already loaded in these skills (e.g. `brand/positioning`,
  `voice/vietnamese-rules`); not a step-change in context cost, and
  single-target skills load only one of the four.
- **[Risk]** Chị Thảo remains untaggable server-side until the taxonomy term
  is added, so updated skills describe correct behaviour that can't execute
  end-to-end for her yet → **Mitigation:** called out inline in each touched
  skill and in the proposal; not silently assumed away. No workaround
  attempted (e.g. no ad-hoc string-tagging in place of a real taxonomy id).
- **[Risk]** 21-file sweep is mechanically repetitive — risk of inconsistent
  wording/drift across files → **Mitigation:** tasks.md will apply the same
  convention wording (Decision 1) verbatim across all touched skills rather
  than rephrasing per file.

## Migration Plan

Prose-only change to markdown skill files — no deploy/rollback mechanics
beyond normal git history. Suggested sequencing (also reflected in tasks.md):
1. Writing skills (highest-value, smallest blast radius: 4 files).
2. Ideation/tagging skills (introduces de-hardcoding + tier/eligibility logic:
   5 files).
3. Strategy research skills (3 files).
4. Generic de-hardcode-only sweep (9 files) + verify-only pass (2 files).

Each group is independently testable by re-reading the skill's stated
procedure against a sample idea/concept for each of the 4 personas — no
runtime test harness exists for this repo (per CLAUDE.md), so verification is
a manual read-through per changed file plus running the existing hook test
commands (unaffected by this change, but confirms nothing else broke).

## Open Questions

None outstanding — the taxonomy-term dependency is a known, accepted
out-of-scope item (see proposal.md "Not included"), not an open question
blocking this design.
