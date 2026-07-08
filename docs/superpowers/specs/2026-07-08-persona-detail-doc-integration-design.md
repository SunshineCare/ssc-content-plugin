# Design: wire per-persona detail docs into every skill that targets a persona

**Date:** 2026-07-08
**Status:** approved (design) — ready for implementation plan
**Scope:** `plugins/ssc-content/skills/*` and `plugins/ssc-content/agents/*` — no KB
content authoring in this change (the KB documents already exist live).

## Problem

The Brand OS knowledge base now has **4 personas**, not 3. `brand/personas` (v8,
live) is a summary index — one section per persona, each ending with a `📄 Chi
tiết:` pointer to a dedicated detail doc:

| Persona | Priority tier | Detail doc |
|---|---|---|
| Chị Hương — Tiền mãn kinh (45–55) | Ưu tiên cao nhất | `brand/persona-huong` |
| Chị Lan — Người mẹ bận rộn (35–44) | Ưu tiên cao (khó chuyển đổi nhất) | `brand/persona-lan` |
| Chị Mai — Tìm lại bản thân (50–60) | Ưu tiên trung bình | `brand/persona-mai` |
| Chị Thảo — Mẹ trở lại công sở (30–40) | Ưu tiên chọn lọc (mẹ sau cai sữa) | `brand/persona-thao` |

Each detail doc (verified live, ~1 version old, consistent structure across
personas) carries far more than the summary: ranked trigger points with content
guidance baked in, objections + how to dismantle them, **real vocabulary to echo
and phrases to avoid**, myths to debunk, channel/trust behaviour, competitors,
buying behaviour and price sensitivity, family/cultural pressure, tone guidance,
and a persona-specific compliance "avoid" list. Chị Thảo's doc additionally
carries a **hard eligibility gate**: women who are still breastfeeding are not
eligible for the programme (VLCD reduces milk supply) — screen for "đã cai sữa
chưa?" before any pitch, nurture-only content otherwise, per
`content/customer-suitability-triage` + `rules/compliance`.

None of this detail is used anywhere in the plugin today. Every skill that reads
persona context does so via **explicit `get_knowledge(paths:[...])` lists** (not
category fetches), and every such list stops at `brand/personas` — so the detail
docs are invisible to the pipeline even though they already exist. Separately,
~10 skill files hardcode "3 archetypes" or an explicit `'Chị Lan' | 'Chị Hương' |
'Chị Mai'` enum, silently excluding Chị Thảo from anything that assumes a fixed
list (idea tagging enums, archetype-balance checks, per-persona research loops).
Two skills (`ssc-youtube-briefing`, `ssc-youtube-ideate`) already avoid this by
deferring to `brand/personas` as the source of truth — they are the reference
pattern the rest of the sweep follows.

**Blocking dependency (acknowledged, not in scope):** the `persona` taxonomy
(`list_taxonomies(kind='persona')`) currently has only 3 terms — `chi-huong`,
`chi-mai`, `chi-lan`. There is no `chi-thao` term yet, and no tool on the BrandOS
MCP surface can create one (`list_taxonomies` is read-only; taxonomy rows live in
BrandOS's own database). Until that term is added on the BrandOS side, no skill
can actually tag an idea/ad/video as targeting Chị Thảo via `save_idea`'s
`terms`, no matter what this change does. The operator will add it directly;
this change makes every skill correct the moment it exists.

## Goals

1. Writing skills ground copy in the specific detail doc for the persona the
   content is actually targeting — sharper hooks, correct vocabulary, objections
   pre-empted, vs. today's one-line summary.
2. Ideation and research skills that currently hardcode 3 named personas instead
   defer to `brand/personas` as the live source of truth, so a persona-count
   change never again requires a manual skill sweep.
3. Chị Thảo's eligibility gate is enforced wherever her persona could plausibly
   be selected, not just documented and ignored.

## Non-goals

- Authoring or revising KB document content (already done, live).
- Adding the `chi-thao` taxonomy term (operator's job, outside this repo).
- Changing the `brand/personas` summary doc itself.

## Design

### 1. Persona-doc resolution convention

A single mechanical rule, restated in every affected skill rather than invented
per-file: a persona tag's taxonomy `code` (`chi-huong` / `chi-lan` / `chi-mai` /
`chi-thao`) maps to `brand/persona-<code with the "chi-" prefix removed>`. No
skill invents or guesses a path — the mapping is always code-derived.

Two loading shapes, chosen by what the skill actually does:

- **Single-target skills** — resolve ONE idea/concept that already carries a
  known persona tag: `ssc-post-produce`, `ssc-ads-writer`, `ssc-ads-brief`,
  `ssc-video-script`. These read the persona tag first (already part of their
  existing brief-extraction step), THEN add exactly **one** resolved
  `brand/persona-<slug>` path to their `get_knowledge` call — never all four,
  since only one persona is in play per run.
- **Batch skills** — generate or research across every persona in a single run:
  `ssc-post-ideate`, `ssc-ads-ideate`, `ssc-youtube-ideate`,
  `ssc-strategy-audience-intelligence`, `ssc-strategy-kol-discovery`,
  `ssc-strategy-territory-explorer`. These add **all four** detail-doc paths
  (`brand/persona-huong`, `-lan`, `-mai`, `-thao`) to their existing explicit
  path list, alongside `brand/personas`.

Every changed skill keeps loading `brand/personas` too — it remains the index
for names, priority tier, and cross-persona rules (age overlap tie-breaks, the
shared compliance themes). The detail docs supplement, never replace, the index.

### 2. De-hardcode persona name/count

Replace every hardcoded count ("3 archetypes", "all 3 must appear") and every
literal enum (`'Chị Lan' | 'Chị Hương' | 'Chị Mai'`) with language that defers to
`brand/personas`'s current contents — e.g. "the personas currently listed in
`brand/personas`" — with no assumption about how many there are or what they're
named. `ssc-youtube-briefing`'s existing phrasing ("the archetype names and
definitions live in this document — do not assume them") is the model to copy
verbatim where it fits.

This applies even to skills that don't get the full detail-doc treatment (e.g.
`ssc-kb-research`'s "three archetypes (Chị Lan, Chị Hương, Chị Mai)" becomes a
plain reference to `brand/personas`).

### 3. Priority-tier and eligibility semantics made explicit

`brand/personas` already states each persona's priority tier and Chị Thảo's
eligibility gate in prose, but prose a model can skim past isn't the same as an
enforced rule. Two concrete procedure changes:

- Anywhere a procedure currently assumes **symmetric** treatment across
  personas (`ssc-ads-blueprint`'s "exactly one of 3 named archetypes" for
  `primary_persona`; `ssc-ads-ideate`'s "all 3 archetypes must appear in L1, if
  any is absent reassign a concept") gets rewritten to read priority tier from
  `brand/personas` instead — a "chọn lọc" (selective) persona is not held to the
  same required-presence bar as a "cao nhất" (top-priority) one.
- Anywhere Chị Thảo could be selected as a target persona (`ssc-post-ideate`,
  `ssc-ads-ideate`, `ssc-youtube-ideate` at idea-generation time; `ssc-ads-writer`,
  `ssc-post-produce`, `ssc-video-script` at copy-writing time; `ssc-post-authority`
  at scoring time) gains an explicit checklist line: content targeting Chị Thảo
  must not invite or assume a still-breastfeeding reader — either the content is
  addressed to an already-weaned mother, or it is nurture/education-only framing
  consistent with `brand/persona-thao`'s screening guidance. This is a new,
  named check alongside the existing banned-words/compliance scan, not a
  rewrite of that scan.

### 4. Scope — file list by treatment depth

**Full detail-doc grounding (writing skills)** — add the resolved single persona
path to the KB load step; use its Từ vựng/Rào cản/Điểm kích hoạt sections
directly when drafting:
- `ssc-post-produce`, `ssc-ads-writer`, `ssc-ads-brief`, `ssc-video-script`

**Detail-doc (all four) + de-hardcode (ideation/tagging skills)**:
- `ssc-post-ideate`, `ssc-ads-ideate`, `ssc-ads-blueprint`, `ssc-youtube-ideate`,
  `ssc-ads-approaches`

**Detail-doc (all four) + de-hardcode (strategy research skills)** — each
persona's real-vocabulary section sharpens that skill's existing per-persona
search-query loop:
- `ssc-strategy-audience-intelligence`, `ssc-strategy-kol-discovery`,
  `ssc-strategy-territory-explorer`

**De-hardcode only** (generic mentions; no per-run detail-doc load needed):
- `ssc-strategy-ad-intelligence`, `ssc-strategy-audit`, `ssc-kb-research`,
  `ssc-strategy-develop`, `ssc-strategy-eval`, `ssc-strategy-directions`,
  `ssc-post-focus`, `ssc-ads-focus`, `ssc-ads-image`
- `ssc-youtube-briefing`, `ssc-youtube-ideate` (verify only — already follow the
  correct pattern; `ssc-youtube-ideate` also appears in the tier above for the
  detail-doc addition)

**No change needed:** `ssc-post-writer-agent` (already prints persona name
dynamically, no hardcoded list); no command file references personas.

## Risks

- **Detail-doc load adds KB read volume** to every writing/ideation run. Each
  detail doc is a few KB of Vietnamese prose — comparable to the other paths
  already loaded (`brand/positioning`, `voice/vietnamese-rules`), not a step
  change in context cost.
- **Chị Thảo remains untaggable** until the taxonomy term exists server-side;
  skills updated here will describe correct behaviour that can't execute
  end-to-end for her specifically until that dependency clears. This is called
  out inline in each touched skill where relevant, not silently assumed away.

## Self-review notes

- No placeholders — every path, tier, and doc name above was verified against
  the live BrandOS KB (`get_knowledge`, `list_knowledge`, `list_taxonomies`)
  during design, not assumed from skill prose alone.
- Scope is bounded to prose edits in `plugins/ssc-content/skills/*` (and a
  verify-only pass on 2 already-correct skills) — no KB writes, no taxonomy
  writes, no command changes.
