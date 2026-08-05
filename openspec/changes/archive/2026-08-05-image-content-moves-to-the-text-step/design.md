# Design — image content is authored at the Text step

## Context

`image_content` is one `content` row per candidate: `section='image_content'`,
`brief_id` set, `body` a structured Vietnamese block

```
HEADLINE: …
SUBHEADLINE: …
BULLETS:
- …
```

Today two skills write it and one skill consumes it:

| | writes | where |
|---|---|---|
| `ssc-ads-writer` | `ad` briefs | Step 4 grounding (l.333), Step 6 authoring block (l.442-468), Step 7 gated items, Step 8 save |
| `ssc-post-authority` | `post` briefs | Step 1b (l.246-325), judged in Step 2, saved in Step 6 |
| `ssc-image-prompt-text` | consumes | Step 3 (l.77-102): requires an approved row, picks one from the density menu |

Both writers run **before any visual exists**, and both say so in their own prose as the
reason for the density menu (`ssc-ads-writer` l.452, `ssc-post-authority` l.307). The
Text step then resolves the chain tip (l.57-76) and re-decides the density from the tip's
authored prompt (l.88-98).

## Goals

- One decision in one place: the on-image payload is sized by the step that can see what
  it sits on.
- No loss of quality machinery — the floor, the coverage verdict, the proof bar, the
  opening-frame rule and the score/comment survive the move intact.
- No server change, no KB revision, no new governance surface.

## Decisions

### D1 — Phase 1 lives INSIDE `ssc-image-prompt-text`, not in a new skill or a sixth step

The authoring is a **phase of the Text step**, not a step of its own. Three reasons:

- The chain stays five steps. A sixth step would need its own layer, its own state flag in
  the agent's `State detection`, and its own entry in the studio's step vocabulary — none
  of which exists server-side, because on-image copy is a `content` row and not a
  `creative_prompts` layer.
- The agent's contract is *one step per invocation*. Phase 1 and phase 2 are already
  separated by a human gate (the operator approves a row in the Image Content stage), so
  two invocations of the Text step is exactly the shape the agent already implements.
- The shared-sub-skill precedent (`ssc-brief-core`, `ssc-approaches-core`) exists because
  **two** callers needed the same material. Here there is one caller, so a split would add
  a file and a hand-off protocol for no reuse.

Cost, accepted: the file roughly doubles (238 → ~450 lines). That is smaller than
`ssc-ads-writer` (720) and `ssc-post-authority` (685), each of which carries the same
material for one channel.

### D2 — Fitted set, not a density menu

Phase 1 runs **after** the chain tip is resolved, so it chooses **one density profile for
the whole set** from the tip and writes every candidate to it. The profile table (Minimal /
Standard / Text-dominant) survives as the *fitting* rubric it always described; what is
retired is the instruction to **span** profiles across the set.

The tip is judged the way phase 2 judges it today, and for the same reason — the evidence
is available on a first run:

- read the tip's **authored prompt** via `list_creative_prompts` for the tip's layer
  (`edit` / `composition` / `subject` / `scene`) — it states whether the image is a close
  portrait or a wide room, where the negative space sits;
- **`view_image`** on the tip only when the JSON genuinely cannot answer it, at most once —
  the existing "deliberate, never routine" rule (l.118-163) governs it unchanged.

The N candidates then vary on **hook, lead, register and proof device** — the four coverage
axes — never on density. The set-level coverage verdict is judged over those axes, which is
what `craft/coverage` §4.2 asks for anyway; density was never one of them.

**Consequence for phase 2.** With the fit decided at authoring time, "pick the approved row
whose density fits the tip" (l.88-100) is retired. Where the operator has approved exactly
one row — the normal case — phase 2 renders it. Where several are approved, phase 2 takes
the **most recently approved** row (the operator's latest word), reports its content id, and
never merges rows or drops an element. The "select a row whole" rule (l.100) survives
verbatim; only the density-matching rationale goes.

### D3 — The judgement travels whole

Phase 1 carries, unchanged and read live:

- **`craft/copy-floor`** — the six-item floor as its own section table binds it to
  `image_content`; **a failure is a REJECT, not a low score**.
- **`craft/coverage` §4.2** — the set-level ≥3-distinct proof bar and the coverage verdict
  over the axes this section can hold.
- **`rules/person-rule` §4** — the on-image HEADLINE is an opening; it declares its frame,
  which is checked and recorded.
- **`brand/proof-points`** — the source of every bullet, in the doc's own wording, read live.
- **`craft/headline-formulas`** — the named formula, the competitor test, the hook-not-CTA rule.
- The **mechanism** from `brief.mechanism`, and the proof-backing criterion the
  `mechanism-proof-substantiation` spec states for `image_content` (inert where the profile
  emits no bullets, inert where the mechanism is blank).
- The **1–5 brand-fit score + one-line Vietnamese `comment`**, demoted exactly as today.
- The **reject-and-regenerate loop**, bounded at **2 attempts per slot**, preserving the
  rejected slot's axis position. A slot that still fails after 2 attempts is not saved and is
  named in the report.

The hard caps (HEADLINE ≤6 words / ≤40 chars, prefer ≤27; SUBHEADLINE ≤8 words; BULLETS ≤5
words, 0–3) move verbatim, including the note that they are the one thing the file *states*
rather than reads, because no KB doc carries an on-image brevity spec.

### D4 — Save drafts immediately, on both channels

Phase 1 follows the `ssc-ads-writer` pattern: once the loop leaves the set floor-passing and
axis-spanning, each surviving candidate is inserted as a **draft** `content` row via
`save_content`, and the step **STOPS**. It does not present a set in chat and wait for a
go-ahead, and it runs no in-chat revise loop. The operator reviews, edits and approves in the
workspace's **Image Content** stage, then re-invokes the Text step for the prompt.

This is a deliberate divergence from `ssc-post-authority`'s present behaviour for `post`
briefs. One skill now serves both channels, and the persist rule must be one rule; the
ads-side rule is the one that matches the studio's own review surface, where the operator is
already working.

Every save carries: `brief_id` (the run's brief), `section='image_content'`, `body`,
`terms[]` (the resolved axis term ids), the set's `coverage` verdict, `score` and `comment`.

### D5 — Gates and re-entry

Phase 1 runs when **all** of these hold, checked in this order, writing nothing on failure:

1. the Step-1 gates — brief resolves, `brief.channel ∈ {ad, post}`, idea approved, brief
   approved (unchanged);
2. a **chain tip** exists (Step 2, unchanged) — no tip → the existing STOP routing the
   operator to Generate + select a candidate at any earlier step;
3. the brief has **≥1 approved `copy`** row. None → STOP (Vietnamese) routing to
   `/ssc-ad <brief_id> copy` (ad) or `/ssc-post <brief_id> copy` (post). The on-image
   headline is distilled from the approved copy's hook, so this is a genuine input, not a
   ceremonial gate;
4. the brief has **no approved `image_content`** row. One exists → phase 1 is skipped and
   phase 2 runs.

Two re-entry rules:

- **Drafts pending, none approved** → STOP asking the operator to approve one, exactly as
  `ssc-ads-writer` Step 2 does for its sections. Never produce a second batch on top of an
  unreviewed one.
- **A fresh batch is requested explicitly** with the bare marker `image_content` after the
  step token — `/ssc-image-prompt <brief_id> text image_content`. That forces phase 1 even
  when an approved row exists (the write path only INSERTS, so it is non-destructive). The
  agent parses it as a bare token exactly as it parses `rewrite`, and passes it through.

`revise: <note>` and a bare `rewrite` keep their present meaning — they address the **saved
prompt**, i.e. phase 2 — with one addition: when phase 1 is the active phase (no approved
`image_content` yet), the note steers the candidate set instead.

### D6 — The channel branch is register, not structure

Both channels run the identical phase-1 procedure. The channel (already resolved at Step 1
from `brief.channel`) selects only:

| | `ad` | `post` |
|---|---|---|
| objective | conversion — every element moves her toward the Messenger conversation | engagement — recognition, comments, saves; a "selling" post has failed at what it is measured on |
| hook bar | a **converting** hook: specific, brand-proof, mechanism- or identification-led, paid off by the bullets | an **engaging** hook: recognisable, specific, conversation-opening, shareable, paid off by the bullets |
| density steer | the brief's `awareness_stage` + route + declared layer | the idea's `pillar` (read what the pillar is *for* from live `content/pillars`) + the nature of the anchor copy |
| register source | `voice/founder-voice` (mục Ba Sắc Thái) mapped to the brief's persona + route | the same doc, mapped to the post's persona; **no ad register** — no offer framing, no urgency, no Messenger push |
| forbidden | — | ad register (`rules/organic-vs-paid-firewall` — a boosted post becomes an ad) |

Both branches keep the rule that **density is not softness**: a Minimal set's single
headline works harder, never vaguer.

### D7 — What the producers keep

- **`ssc-ads-writer`** produces `copy` (mandatory cold start), `headline`, `description`.
  Its Step-2 table drops every `image_content` row; the "all three approved" STOP becomes
  "both derived sections approved". An explicit `section: image_content` is **not** silently
  redirected — it STOPs (Vietnamese) naming `/ssc-image-prompt <brief_id> text` as the place
  on-image copy is now written.
- **`ssc-post-authority`** judges `copy` only. Step 1b is deleted, with it the self-drafting
  branch, the two `image_content`-only KB paths, the density table, the on-image caps and the
  `image_content` judging list. Its Step 0 resolution collapses to a single section, and the
  "which of us regenerates" split (l.504, l.516, l.573) collapses to "the writer does".
- **`ssc-post-writer-agent`** loses its `section` choice and its `image_content` gate; its
  hand-off after `copy` is approved points at `/ssc-image-prompt <brief_id>` rather than
  `/ssc-post <brief_id> image_content`.

Prose states current behaviour only: none of these files says what used to be there.

### D8 — Tool surface

`ssc-image-prompt-text` `tools:` becomes:

```
get_brief, get_idea, list_content, list_creatives, list_creative_prompts,
list_taxonomies, get_channel_plan, get_month_plan, get_knowledge, view_image,
save_content, save_creative_prompt
```

The four additions are what the travelling judgement needs and what the producers hold today
for the same purpose: `list_taxonomies` for the axis rosters and the persona/route/layer
resolution (term **ids** are what `save_content.terms[]` takes), and
`get_channel_plan` + `get_month_plan` for the period's `proofInventory` (which bounds the
proof-device axis) and `offerState` (which decides whether any timeliness claim is permitted
at all). A `null` hand-down stays a **recorded fact**, reported and never filled in.

`save_content` inserts drafts. It is not `approve`, not `edit`, not `delete`, and it spends
no credits — the propose-only invariant is unchanged, and the approval-gate hook's matchers
are untouched.

### D9 — Phase 2 is otherwise unchanged

The chain-tip walk, the verbatim-string rule and its bounded exception, the diacritics check
via `view_image` on a re-run, the `overlay` vs `fal-ai/ideogram/v3` model decision, the
`expected_version` guard on a revise, and the deployment-dependency STOP all stay exactly as
written.

### D10 — Edit anchors

**`plugins/ssc/skills/ssc-image-prompt-text/SKILL.md`**
- frontmatter `description` + `tools` (l.3-15) — two phases, four new tools.
- l.20-24 lead-in — the step authors the on-image copy, then the placement prompt.
- l.77-102 (Step 3) — becomes phase 1: gate on approved `copy`, branch on an approved
  `image_content`, author / judge / save; the density-menu selection prose is replaced by the
  most-recently-approved rule (D2).
- new phase-1 body after Step 2 — the structure contract + caps (from `ssc-ads-writer`
  l.32-42 / l.442-468), the fitting rubric, the channel branch (D6), the judgement (D3), the
  save (D4).
- Governance (l.222-233) — the new mutation, the two-phase gate, the persist rule.
- Output (l.234-238) — the phase-1 report (candidates saved, floor/coverage verdict, density
  profile chosen and the tip evidence for it) vs the phase-2 report.

**`plugins/ssc/skills/ssc-ads-writer/SKILL.md`** — l.5 (description), l.20/22/24 (lead-in),
l.30 + l.32-42 (page contract + the on-image block spec), l.52 + l.59 (`section` /
`n_image_contents` inputs), l.211-230 (Step 2 table), l.329-333 (Step 4 grounding), l.442-468
(Step 6 block), l.537/l.552/l.558/l.565 (Step 7 items), l.608/609/l.625 (Step 8 args), l.646
(Step 9), Governance l.679-714.

**`plugins/ssc/skills/ssc-post-authority/SKILL.md`** — l.5 (description), l.21/35/41/47-48,
l.59-82 (Step 0), l.239-242 (the two extra KB paths), l.246-325 (Step 1b — deleted), l.309,
l.329, l.337, l.484-486 (judging list), l.504/516/537/550/552/567/573, l.587/598/599
(save args), Governance.

**Cross-references** — `commands/ssc-ad.md` l.2/5/29/38/46/49; `commands/ssc-post.md`
l.2/6/30/42/55-61/75-76; `commands/ssc-image-prompt.md` l.171-172;
`agents/ssc-post-writer-agent.md` l.6/66/70/78-79/163/169/180-181/197/224/237/242-246/301-308;
`agents/ssc-image-prompt-agent.md` l.242/l.366-372 (the Text precondition — it no longer
routes to the channel's text command; it dispatches the skill, which authors the content);
`skills/ssc-post-produce/SKILL.md` l.426/591; `skills/ssc-video-script/SKILL.md` l.43-44 and
`skills/ssc-ads-publish/SKILL.md` l.33/153-154 (both merely *read* the section — they need a
wording pass only, no behaviour change); `skills/ssc-image-prompt-{scene,subject,composition,edit}`
grounding lists (an `image_content` row simply does not exist yet on a fresh brief — the
lists stay correct, the "if any exist" phrasing is confirmed).

## Risks

- **A brief can no longer reach approved on-image copy without a selected image.** Intended,
  but it re-orders an operator habit. Mitigated by the phase-1 STOP naming the exact next
  action in the studio.
- **File size.** The Text skill absorbs two channels' worth of authoring prose. Mitigated by
  keeping every rule a live KB read, as both producers already do — only the caps and the
  structure contract are stated locally.
- **Nothing enforces frontmatter or cross-reference validity** beyond the bundle build. The
  verification gate is therefore: `node scripts/build-chatgpt-bundle.mjs` exits 0, plus a
  read-through against the spec.

## Drift Log

### D5 gate order — an approved `image_content` is checked before the approved-`copy` gate

**Decision as designed.** §D5 lists phase 1's gates in the order: step-1 gates → chain tip →
≥1 approved `copy` → no approved `image_content`.

**What the prose does instead.** The approved-`image_content` check runs **before** the
approved-`copy` check. The approved-`copy` gate binds **phase 1 only**.

**Why.** As designed, the `copy` gate is an unconditional STOP standing in front of the phase
selector, so a brief whose `image_content` is approved but whose `copy` was later edited back
to draft or unapproved could never reach phase 2 — the placement prompt would be blocked and
the operator routed to write copy that phase 2 does not read. Phase 2 renders an approved
on-image row; it has no dependency on an approved `copy` at all. Ordering the phase selector
first makes the `copy` requirement bind exactly the phase that consumes it.

**Scope.** Ordering only. Every gate still exists, each still writes nothing on failure, and
the spec requirement *"Phase 1 gates on a chain tip and an approved copy"* is unchanged — it
governs phase 1, which is where the gate now sits.

### D7 — `ssc-post-writer-agent` keeps a resolve-nothing `section` passthrough

**Decision as designed.** §D7 says the agent "loses its `section` choice and its `image_content`
gate".

**What the prose does instead.** The agent keeps a narrow `section` input whose only recognised
values are `copy` and the **refused** `image_content`, and invokes `ssc-post-authority` with
`brief_id` + `section` and no variations before any produce work, so Step 0 can emit the
refusal.

**Why.** `specs/on-image-copy-authoring/spec.md` requires that naming `image_content` explicitly
STOPs with a routing message and is never silently redirected. With no carrier the request
never reaches the authority and a `copy` batch is produced instead — the exact silent
redirection the requirement forbids.

**Scope.** The passthrough resolves nothing and produces nothing: `copy` remains the only
section this pipeline produces, and the agent gained no second production branch.
