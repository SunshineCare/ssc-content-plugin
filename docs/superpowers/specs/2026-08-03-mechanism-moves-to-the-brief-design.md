# The mechanism moves to the brief, and the bank becomes a table

**Date:** 2026-08-03
**Status:** design, approved for planning
**Supersedes (in part):** `2026-08-03-mechanism-bank-design.md` — that design put the
bank in a KB markdown document and gave the brief a *bounded override* of an
inherited idea mechanism. The server shipped neither: the bank is a table, and the
mechanism moved off the idea entirely. This document records what is now true.

**Touches (this repo):** `plugins/ssc/skills/ssc-approaches-core`,
`ssc-ads-approaches`, `ssc-post-approaches`, `ssc-brief-core`, `ssc-ads-brief`,
`ssc-ads-ideate`, `ssc-post-ideate`, `ssc-ads-writer`, `ssc-post-produce`,
`ssc-post-authority`, `ssc-post-schedule`, `ssc-kb-mechanism-harvest`;
`plugins/ssc/agents/ssc-ads-agent.md`, `ssc-kb-agent.md`,
`ssc-post-writer-agent.md`; `plugins/ssc/commands/ssc-kb.md`,
`ssc-post-plan.md`; `.claude-plugin/plugin.json`; `chatgpt/workflows.json`
(regenerated).

**Touches (BrandOS data, via proposals):** `craft/doctrine` → 1.2,
`craft/mechanism-bank` → 1.2.

**Touches (`content` repo):** exactly one generated file —
`mcp-server/lib/brandos/workflows/workflows.json`, the ChatGPT bundle mirror. No
source change: the server work has already landed.

***

## 1. What changed underneath, verified live

The `content` repo shipped `908dd48` / `1bff834` on 2026-08-03. Read against the
live server and the live KB, the facts are:

| | before | after |
|---|---|---|
| Where a mechanism lives | `ideas.mechanism`, inherited by every angle beneath the subject, with a bounded angle-local override on the brief | `briefs.mechanism` **only** — authored at the angle. No inheritance, no override, no resolution step |
| The approval gate | idea approval, `ad`/`post` | `approve(entity='brief')` refuses an `ad` or `post` brief whose mechanism is blank, with `field: 'mechanism'`. Idea approval carries no mechanism bar. `youtube` is untouched |
| The bank | `craft/mechanism-bank` §3, read with `get_knowledge` | the `mechanisms` table: `list_mechanisms` (approved-only unless asked otherwise), `get_mechanism` (by `slug`), `save_mechanism` (mints `draft`, takes no `status`). `edit` / `approve` / `delete` are the generic verbs; `delete` is soft |
| Bank contents | empty | 10+ approved entries already seeded by the operator |
| `save_idea` | took `mechanism` | takes none. One supplied at ideation rides `detail.mechanism` onto the brief the call mints — and **a non-blank mechanism mints that post brief `approved`**, blank mints `draft` |

Two consequences the prose has to absorb rather than paper over:

- **Sibling angles of one subject may now name mechanisms that do not cohere, and
  nothing checks it.** The server states this as an accepted cost of the move, not
  an oversight. The guarantee is *one angle, one mechanism* — never *one subject,
  one mechanism*.
- **Provenance is not persisted.** There is no `briefs.mechanism_slug`; the brief
  holds the Vietnamese sentence and nothing else. "Drawn from `<slug>`" versus
  "not in the bank" survives only in a run report.

What did **not** change: the grounding rule (an attributed voice-of-customer quote
from the approved Approaches document of that period), proof-routing from the
period's stated inventory, drop-not-soften when `rules/compliance` refuses the only
route, and the mandatory mechanism beat in every asset.

***

## 2. `craft/doctrine` → 1.2

One `propose_knowledge_revision`. Vietnamese, and it restates no rule another
document owns.

- **§1, the chain table.** The `CƠ CHẾ` row moves from *"Approaches đề xuất →
  Ideate chốt"* to the brief step. The idea row loses *"mang theo đúng MỘT cơ
  chế"*. The brief row becomes *"khai cơ chế riêng của góc, ưu tiên ngân hàng"*.
- **§2 rule 1.** The inheritance default and the entire bounded-exception
  apparatus are deleted — there is nothing to make an exception to. *"Một GÓC, một
  cơ chế"* now means the mechanism is **authored at the angle**. What survives from
  the old rule: sibling angles of one subject may name different mechanisms, each
  standing on its own grounding, declared — never a silent contradiction.
- **§2 rule 3.** The approval-time bar names the **brief** (`ad`/`post`) and says
  it is enforced server-side. Drafting is still never blocked: a brief with no
  mechanism is saved, kept and worked on; it simply cannot be approved.
- **§2, the supply paragraph.** The bank is a table read live through the mechanism
  tools. The Approaches step supplies voice-of-customer, not mechanisms.
- **§6.** The routing row and the scope-exception note flip: the bank read is
  mandatory at **Brief** — a failed read stops that run — and is no longer part of
  Approaches.
- **§7.** The move is not retroactive. Briefs approved before 1.2 keep their status,
  are never re-opened and are never reported stale; the migration already carried
  pre-existing idea mechanisms down onto their briefs.

## 3. `craft/mechanism-bank` → 1.2

One `propose_knowledge_revision`.

- **§1.** The bank-first relationship is with the **Brief** step. The document still
  defines nothing — `craft/doctrine` §2 owns the definition, and this doc keeps
  citing it rather than restating a word of it.
- **§2.** Valence and the positive-priority rule are unchanged. The ceiling
  sentence is retargeted: the ratio is measured over a period's **briefs** and
  reported by the KB harvest run (§4 below), not enforced at Ideate.
- **§3.** The field table is corrected against the table that now backs it: `slug`
  is the short stable key a step cites, `id` is the row id used to target a verb,
  `status` (`draft` | `approved`) is added, and the approved-only default plus
  never-returns-retired are stated.
- **§4.** *"NGÂN HÀNG CHƯA CÓ MỤC NÀO"* is stale — the bank is seeded. The section
  is replaced by **when no entry fits**: author at the brief, report it as
  not-from-bank, and let harvest propose it in.
- **Footer.** Growth is `save_mechanism` drafts plus a human approval, plus the
  bounded in-place sharpening of §4 below.

***

## 4. The plugin prose

### Group A — supply drops out of Approaches

`ssc-approaches-core`, `ssc-ads-approaches`, `ssc-post-approaches`.

Step 4's candidate-mechanism supply is deleted, together with the bank read and
the `in_bank` marker. The voice-of-customer pass stays, and becomes explicitly the
thing a brief cites: the approved Approaches document is the only sanctioned source
of an attributed customer quote. The core's **no-mutation-tool** invariant is
untouched — that is what makes it safe for two pipelines to share. `creative_target`
on the ads side is unaffected.

The section that held the supply is removed rather than emptied, and every
downstream reference to "the approved doc's §3 candidate supply" goes with it.

### Group B — the brief becomes the mechanism's author

`ssc-brief-core`, `ssc-ads-brief`, `ssc-post-ideate` round 3.

`ssc-brief-core` loses its hard rule that it *never authors, restates or varies a
mechanism*, and loses the override apparatus. It gains: settle **this angle's**
mechanism, **bank-first** —

1. read the bank live (`list_mechanisms`, narrowed by `valence` or the `q`
   substring; `get_mechanism` to resolve one slug), never a remembered copy;
2. match against an attributed voice-of-customer item from the approved Approaches
   document of that period — the brief runs no research pass of its own and opens
   no second outward account of the period;
3. proof-route from the period's stated inventory, and **drop** — not soften, not
   re-trace — a candidate whose only route `rules/compliance` refuses;
4. author fresh only where nothing in the bank fits, and say so in the report;
5. judge whatever it settles against `craft/doctrine` §2, read live.

It gains the two read tools and **still holds no mutation tool** — the caller saves.
A failed bank read stops that run and names the document.

`ssc-ads-brief` passes `mechanism` on each `save_brief`. Every angle of one subject
settles its own; siblings are never touched, never re-opened, never reported stale.
The prose states the consequence plainly: an `ad` brief with no mechanism cannot be
approved.

`ssc-post-ideate` round 3 **is** the post's brief step — one angle, so one
mechanism — and writes it with `edit(entity='brief', patch={ mechanism })`.

### Group C — Ideate stops touching mechanisms

`ssc-post-ideate` rounds 1–2, `ssc-ads-ideate`, `ssc-ads-agent`.

Titles carry no mechanism. The `¼` concentration cap, the `⅓` negative-valence cap,
the supply-matching pass and the approvability verdict keyed on a mechanism are all
removed from these rounds.

Round 2 **deliberately withholds** `detail.mechanism` at mint, and the prose states
why: a non-blank one mints the post brief `approved`, which would let a skill
self-approve a brief. The brief is minted `draft` and a human approves it.

The ads agent's *"a missing mechanism on a drafted subject is not a gate"* note stays
true and is re-pointed at the brief.

### Group D — producers read one field

`ssc-ads-writer`, `ssc-post-produce`, `ssc-post-authority`, `ssc-post-schedule`.

The brief-override-first resolution table is deleted from all three producers. The
mechanism is `brief.mechanism`, full stop; each producer still writes *to* it and
never restates, paraphrases, sharpens or contradicts it, and authors none.

Legacy collapses from three cases to one: a brief approved before the gate carries
no mechanism → production proceeds, the absence is **named** in the report, and
nothing is invented. `ssc-post-schedule` sorts indirect-first on a mechanism today
and reads it off `list_ideas`, which no longer returns one; the sort key moves to
`list_briefs`' `mechanism`, and the existing rule stands — never re-derive a
mechanism to sort by.

### Group E — the KB pipeline

`ssc-kb-mechanism-harvest`, `ssc-kb-agent`, `commands/ssc-kb.md`,
`commands/ssc-post-plan.md`.

Harvest is rewritten around the table and absorbs the mix audit:

1. Read the period's briefs; collect the mechanisms actually settled.
2. Diff against the bank read live.
3. Genuinely new → `save_mechanism`, which mints a **draft**. A draft is not supply;
   it becomes one when a human approves it in the dashboard.
4. A near-duplicate of an existing entry → `edit(entity='mechanism')` on **that**
   entry, bounded by all of: content fields only (`mechanism`, `fits`,
   `proof_family`, `notes`), **never** `status` and **never** `slug`; sharpening
   only, never repurposing an entry to a different meaning; and every edit reported
   with its before and after.
5. Report the period's mix — concentration (one mechanism over `~¼` of the assets)
   and negative valence (over `⅓`) — naming each breach. It proposes no
   re-mechanising and re-opens nothing; the fix is the operator's, on
   not-yet-approved briefs.

Harvest holds no `approve` and no `unapprove`. The `propose_knowledge_revision` path
for bank entries is gone, and the tool drops from the skill.

`ssc-video-keyframe`'s single hit is the word "mechanism" inside copy guidance —
untouched.

***

## 5. Risks, stated rather than solved

- **Sibling angles may disagree.** Two angles under one ad subject can name
  mechanisms that do not cohere; nothing checks it. Harvest's mix report is the only
  place it becomes visible.
- **The in-place bank edit is a governance loosening.** Every other live-KB write in
  this plugin goes through a proposal. It is bounded as in Group E and reported, but
  it remains the one exception, and it is deliberate.
- **Provenance is report-only.** Without a `briefs.mechanism_slug` column, "which
  bank entry did this angle draw from" survives only in the run report. A column
  would fix it; it is not proposed here.
- **Legacy briefs.** Approved before the gate, so mechanism-less. Never re-opened;
  the absence is named in every producer's report.

## 6. Rejected alternatives

**Keep the mechanism on the idea and treat the brief field as an override.** This is
what the superseded design specified. Rejected because it no longer describes
reality: `ideas.mechanism` was dropped, `save_idea` takes no mechanism, and the
approval gate moved. Prose written to an override model would contradict the server
on every run.

**Pass `detail.mechanism` at round 2's mint.** Fewer calls, and the mechanism lands
at the moment it is known. Rejected: it mints the post brief `approved`, so a skill
would self-approve a brief — the exact thing propose-only exists to prevent.

**Keep the caps at Ideate.** Ideate no longer settles mechanisms, so it would be
counting a field it does not write, on rows it does not own. Folded into harvest,
which already reads the period's mechanisms.

**Keep a per-period candidate supply in Approaches.** A shortlist of bank slugs per
voice-of-customer item was considered. Rejected: the bank is now queryable by the
step that actually chooses, so a shortlist is a second opinion the brief has to
reconcile with the bank it is reading anyway.

**Let harvest only report near-duplicates.** Safer, and consistent with every other
KB write. Rejected by the operator in favour of bounded in-place sharpening; the
bounds in Group E are the compensation.

***

## 7. Sequencing

KB proposals first, plugin prose second. Skills read the documents live, so prose
saying "authored at the angle" against a `craft/doctrine` still saying "inherited
from the idea" leaves a run's own citation contradicting it. Both proposals go up in
one pass and wait on chị Kiều My; the plugin commit can land in parallel, since the
server enforces the new shape either way.

## 8. Verification

- `node scripts/build-chatgpt-bundle.mjs` — the real structural gate: skill
  directory versus frontmatter `name`, `orchestrates` resolution, and
  `metadata.dispatches` on every command.
- `node --test hooks/` from `plugins/ssc/` — regression only. No hook change:
  `briefs.mechanism` is an ordinary field, so no matcher moves.
- `.claude-plugin/plugin.json` version bump **in the same commit**.
- `scripts/publish-chatgpt-bundle.sh` re-run, and the refreshed mirror committed in
  the `content` repo — otherwise ChatGPT keeps running the old prose.
- **Grep gate** — no surviving reference to `idea.mechanism`, `in_bank`, "inherited
  mechanism", "angle-local override", or `craft/mechanism-bank` §3 as a source of
  mechanism entries.
- **Real path**, since there is no test harness for prose: run `/ssc-ads-brief` on a
  subject for a live period and confirm the angle brief carries a mechanism drawn by
  slug from the bank; confirm `approve` refuses a mechanism-less angle with
  `field: 'mechanism'`; run `/ssc-kb` harvest and confirm it reports the period's
  concentration and valence mix and mints drafts, not approved entries.
