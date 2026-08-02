# Design — Posts channel: inherit the sophistication read, supply the mechanisms

## Context

This repo is the `ssc` Cowork plugin: prose skills, agents and commands plus one
Node hook. There is no compiled surface here and no server change in this change —
every field named below already exists on the BrandOS MCP surface and is already
read by the Ads and head skills.

**Current state, as it actually is in the files:**

- `ssc-ads-approaches` (`plugins/ssc/skills/ssc-ads-approaches/SKILL.md`) already
  does three pieces of channel-agnostic work inline: **Step 1b** holds the
  quarter's `sophisticationStage` + `sophisticationRead` and the two head
  hand-downs (`proofInventory`, `offerState`); **Step 4** runs the
  voice-of-customer compile; **Step 5** authors the candidate-mechanism supply.
- `ssc-post-approaches` reads the same head and the same quarter brief and holds
  **neither** sophistication field, **neither** hand-down, and has no
  voice-of-customer and no mechanism step. Its persisted doc has five sections
  and a ~1700-token budget.
- `ssc-post-ideate` enforces `craft/doctrine` §2 at round 3 (the mechanism pass)
  with nothing upstream supplying a mechanism; round 2 correctly omits the
  `mechanism` argument rather than fabricating one.
- `ssc-post-schedule` already calls `get_channel_plan` for its
  `approaches_approved` gate check and discards everything but `plan.id`,
  `plan.version`, `targets` and `detail`.
- `ssc-brief-core` (`plugins/ssc/skills/ssc-brief-core/SKILL.md`) is the working
  precedent for a shared sub-skill: `stage: shared`, `section: shared`,
  `capability: view`, holds no mutation tool, reads no plan state, returns a
  fenced block for the caller to save.

The approved brainstorm spec is
`docs/superpowers/specs/2026-08-02-post-plan-sophistication-mechanism-supply-design.md`.
It settles WHAT. This document settles HOW, file by file, so the task list falls
out of it.

## Goals / Non-Goals

**Goals:**

- One shared, view-only sub-skill (`ssc-approaches-core`) owning the three
  channel-agnostic pieces of Approaches work, with a contract precise enough that
  two callers can consume it without a second copy of the prose existing anywhere.
- Refactor `ssc-ads-approaches` onto it **without changing the persisted
  artifact** — the Approaches doc an operator approves keeps its exact section
  shape, wording rules and `creative_target` behaviour.
- Give the Posts channel the sophistication read at all three of its steps
  (Approaches applies it, Ideate is barred by it, Schedule sequences by it) and a
  candidate-mechanism supply that Ideate can draw on.
- Keep every existing invariant intact: propose-only, no hard-coded KB content,
  Vietnamese persisted prose, no tool that does not exist on the BrandOS surface.

**Non-Goals:**

- No BrandOS server change, no schema change, no new MCP tool, no new field.
- No change to the head (`ssc-plan-*`) or the quarterly strategy skills — they
  author and carry down the read correctly; this change only consumes it.
- No change to the Posts produce loop (`ssc-post-produce` / `ssc-post-authority`)
  — the lead is still picked per asset at writing time.
- No YouTube adoption of the core (it can adopt it later; nothing here blocks or
  changes it).
- No back-fill of already-approved Approaches docs, ideas or briefs.
- No new gate, no moved gate, no renamed command, no retired tool.

## Decisions

### D1 — `ssc-approaches-core` is a view-only sub-skill modelled on `ssc-brief-core`

**File:** `plugins/ssc/skills/ssc-approaches-core/SKILL.md` (directory name must
equal the frontmatter `name` — the bundle build enforces this).

**Frontmatter:**

```yaml
name: ssc-approaches-core
description: >-
  <one paragraph: the SHARED, channel-agnostic core of the Approaches step …
   returns three blocks, writes nothing, reads no plan state, holds no mutation
   tool, one channel conditional … dispatched by ssc-ads-approaches and
   ssc-post-approaches, never invoked directly by an operator>
metadata:
  type: skill
  stage: shared
  brand: cambridge-diet-vn
  section: shared
  capability: view
  tools: [get_knowledge, search_knowledge]
```

Two tools and no more. **No `get_month_plan`, no `get_strategy_brief`, no
`get_channel_plan`, no `save_*`, no `edit`, no `WebSearch`.** Propose-only by
construction rather than by promise, exactly as `ssc-brief-core` is: a skill that
holds no mutation tool cannot flip a gate even by mistake.

*Why view-only and plan-state-free rather than "let it read the head itself":*
the caller must read the head anyway for its release gate. A core that re-read it
would either duplicate the gate logic or run under an unapproved narrative.
Passing the payload in keeps one gate and one read. This is the same argument
`ssc-brief-core` already won.

**Inputs from the caller** (documented as a table, the way `ssc-brief-core`
documents its inputs):

| Input | What it is | Absent / null means |
|---|---|---|
| `channel` | `'ad'` or `'post'` — the only conditional in the skill | caller defect: STOP and say so |
| `period` | `YYYY-MM` | caller defect: STOP and say so |
| `head` | the head's `research`, `performanceReview`, `proofInventory`, `offerState` | a **null** `proofInventory` is a FACT — no stated inventory; a **null** `offerState` is a FACT — no promotion. Neither is ever assumed or invented |
| `quarter` | `sophisticationStage`, `sophisticationRead`, the marked findings | no brief, or no read on it → `NOT STATED`, returned as a fact |
| `personas` | the personas this run features, resolved by the caller | empty/absent → feature **every** persona currently listed in `brand/personas` and name that fallback in the return; never guess a subset |

**Outputs — three blocks plus provenance**, returned as text for the caller to
compose into its own document. The return block is fenced and fixed, so a caller
can be read against it:

```
channel:              <'ad' | 'post'>
sophistication:       <stage> — <read, carried through verbatim>
                      | NOT STATED (quarter carries none; no bar derived here)
voice_of_customer:    [ { persona, language[], triggers[], objections[], myths[],
                          sources[], gaps[] } ]        # every quote attributed
candidate_mechanisms: [ { mechanism, explains: { quote, source },
                          proof: { family, trace, verified | unverified_for_period },
                          indirectness } ]
gaps:                 <which source was silent about which persona, or "none">
personas_featured:    <as passed | "roster fallback — caller passed none">
reads:                <the KB docs read live this run>
```

Field labels are structural English; **the values that will be persisted
(mechanism sentences, quoted customer language, trigger and objection wording)
are Vietnamese**, because the caller pastes them into a Vietnamese artifact.

Rules the core holds:

- **Sophistication is inherited, never derived.** Carried through verbatim. Where
  the quarter carries none the core returns `NOT STATED` and derives no bar — a
  guessed stage is worse than an absent one.
- **Every quote is attributed** to head research / a marked quarterly finding / a
  named `brand/persona-<slug>` doc / the performance review. A phrase that cannot
  be attributed does not go in. A silent source is a **named gap**, reported and
  not filled; a gap does not stop the run.
- **Candidate volume:** return everything that can be attributed and grounded —
  at minimum one candidate per featured persona, and deliberately more than the
  period can use. The **caller trims**; the core never trims to a pairing count it
  was not given.
- Each candidate carries: the mechanism (one specific Vietnamese sentence, per
  `craft/doctrine` §2 **read live** — never restated in the file); the quoted,
  attributed VOC item it explains; its proof route (family from
  `brand/proof-points` + the trace, **selected only from this period's stated
  `proofInventory`**; where that is null the route is marked
  `unverified_for_period`, never assumed); and how indirect it forces the lead to
  be, read against the inherited sophistication.
- **A candidate whose only proof route is refused by `rules/compliance` is not
  proposed at all.**
- **KB reads, live and named:** `craft/doctrine` §2, `craft/awareness-framework`,
  `brand/proof-points`, `rules/compliance`, `brand/personas` + every currently
  listed `brand/persona-<slug>` (slug resolved mechanically from the roster's
  `code` with the `chi-` prefix stripped — never a hardcoded path list), and, for
  `channel='post'` only, `rules/organic-vs-paid-firewall`. Check `missing` on
  every call; a failed read **STOPS the run** and names the document.

### D2 — Exactly one channel conditional, and it is a hard rule

For `channel='post'` the core additionally binds every candidate mechanism and
every quoted line to `rules/organic-vs-paid-firewall` and **refuses to source any
voice-of-customer quote or example from ad copy or the ad performance lens**. The
two channels are graded on different objectives, so a line that converts in an ad
routinely fails in the feed and importing one teaches the wrong instinct.

For `channel='ad'` the behaviour is exactly what `ssc-ads-approaches` does today.

The governance section states this as a bound: **one conditional, and adding a
second is a design change, not an edit.** Anything else that differs by channel —
document shape, section headings, `creative_target`, gates, saves — stays in the
caller. Without that bound the shared skill degenerates into two channel skills
sharing a file, which is worse than the duplication it was built to remove.

*Alternative rejected:* two thin channel wrappers around a channel-free core. It
adds a file and an indirection to express one `if`, and the firewall rule is a
property of the material the core produces, not of how a caller stores it.

### D3 — `ssc-ads-approaches` keeps its step numbers; only Step 4 and Step 5 bodies are replaced

This is what makes the refactor provably behaviour-preserving and keeps every
in-file cross-reference valid.

| Step | Today | After |
|---|---|---|
| 1 | read the ad channel plan | **unchanged** |
| 1b | head release gate + hold `tactics` / `research` / `performanceReview` / allocation / `proofInventory` / `offerState`; then `get_strategy_brief` and hold `sophisticationStage` + `sophisticationRead` + marked findings | **kept.** The reads all stay — the caller is the one gate. **Deleted from it:** the paragraph explaining how the read constrains which mechanisms are worth proposing (that doctrine moves to the core), replaced by one line: these fields are passed to the core in Step 4 |
| 2 | KB load list | **unchanged.** `craft/doctrine`, `craft/awareness-framework`, `brand/proof-points`, `rules/compliance`, `brand/personas` + persona docs stay on the caller's list even though the core reads them too — see D4 |
| 3 | run NO research of your own | **unchanged** |
| 4 | the voice-of-customer pass (its four ranked sources + the five rules) | **replaced** by: *Dispatch `ssc-approaches-core` with `channel='ad'`* and the payload table. Every deleted rule now lives in the core, once |
| 5 | candidate mechanisms (the four per-candidate fields + the propose-never-choose rule) | **replaced** by: *what you do with the returned blocks* — compose §Voice of customer and §Candidate mechanisms from them, carry the named gaps through, never re-author or re-score them. The "you propose, Ideate picks, a human approves" rule stays here, because it is about the caller's pipeline position |
| 6 | the Approaches doc template | **unchanged, byte for byte.** The two section templates keep their current instructions; the only edit is that they now say the content comes from the core's block |
| 6b | `creative_target` | **unchanged.** Ads-only, caller-owned |
| 7 | output summary | **unchanged in shape.** Its Voice-of-customer / Candidate-mechanisms / hand-downs lines are now filled from the core's return |
| Governance | — | the Step 4/Step 5 references stay valid; add one bullet: *the VOC pass and the mechanism supply are the shared core's; this skill composes and saves them and never re-authors them* |

**The behaviour-preserving test is stated in the change, not assumed:** the
persisted `context` template in Step 6 and the `creative_target` rules in Step 6b
must diff clean against `main`. If either moves, the refactor has changed the
artifact and is wrong.

*Alternative rejected:* renumbering the ads steps to 4 = dispatch, 5 = compose,
6 = doc, 7 = target, 8 = summary. It would churn every "Step N" reference in the
file and in the governance section for no gain.

### D4 — The core re-reads its KB list; the callers keep theirs

The core always reads its own list live, even though the caller has read most of
the same paths. This is the rule `ssc-brief-core` already states: *"read live
regardless of what the caller says it already has, because a caller that read a
doc for a different purpose may not have held the part you need."*

Cost: one duplicated `get_knowledge` batch per run. Benefit: the core can never
be handed a stale or partial view of the doctrine it applies, and neither skill
has to reason about what the other loaded. Correctness beats the token saving,
and this is exactly the trade the existing shared skill already made.

The caller keeps its own list because it composes prose the core never sees
(§Route × persona for ads, §4–§7 for posts).

### D5 — `ssc-post-approaches`: a Step 5b dispatch, five sections become seven

**Frontmatter:** add `orchestrates: [ssc-approaches-core]` (the `ssc-post-ideate`
→ `ssc-brief-core` precedent); extend the `description` with the inherited
sophistication read and the candidate-mechanism supply. **Tools are unchanged** —
no new tool, no new call.

**Step 1** (head read) gains two holds from the response it already has:
`plan.proofInventory` and `plan.offerState`, each with the "null is a FACT" rule.

**Step 3** (quarter read) gains one hold: `sophisticationStage` +
`sophisticationRead`, inherited and never derived.

**Step 4** (KB list) gains `brand/proof-points` and `rules/compliance` — the
caller needs both to judge what it composes into §3. The existing failed-read STOP
covers them.

**New Step 5b — Dispatch `ssc-approaches-core`.** Numbered `5b` (mirroring the
existing `Step 1b` convention in the ads skill) precisely so Step 6 and Step 7 and
every reference to them stay put. Payload: `channel='post'`, `period`, the head
payload from Step 1, the quarter payload from Step 3, the featured personas.

**The document goes from five sections to seven:**

| New § | Vietnamese heading | Was | Content |
|---|---|---|---|
| 1 | Điều chung cho mọi bài | §1 | unchanged, **plus** the sophistication constraint as one new numbered rule (see below) |
| 2 | Tiếng nói khách hàng | — | the core's `voice_of_customer` block, gaps included |
| 3 | Cơ chế đề xuất | — | the core's `candidate_mechanisms` block, one block per candidate |
| 4 | Trụ cột × persona | §2 | unchanged; each pillar block names which candidate mechanisms it can draw on |
| 5 | Điểm khác biệt | §3 | unchanged |
| 6 | Định dạng và phép thử | §4 | unchanged |
| 7 | Ranh giới nội dung tự nhiên | §5 | unchanged |

**§2 and §3 sit above §4 deliberately** — §4's pillar blocks draw on the
mechanisms, so the supply has to be on the page before the thing that consumes it.

**The sophistication constraint is stated once, as a numbered §1 rule** (§1's
`1.1, 1.2, …` numbering is unchanged in form, so it takes the next free number):
how indirect this month's openings must be, or the `NOT STATED` gap line. §3 and
§4 point at that number; the existing anti-repetition rule ("is this already true
in §1? then delete it here") is what keeps them from restating it.

**Every cross-reference that moves** — this is the renumbering checklist, and the
change is not done until each is confirmed:

| Where | Today | After |
|---|---|---|
| Step 2, allocation note | "let the allocated emphasis shape which pillars get a block in **§2**" | §4 |
| Step 4, `brand/angles` entry | "the vocabulary **§2's** differentiation move is expressed in" | §4 |
| Step 6, length paragraph | "so **§2-§5** cost a line each" | §4–§7 |
| Step 6, §1-is-shared paragraph | "**§2 onward** reference it"; "ask of every sentence in **§2–§5**" | §4 onward; §4–§7 |
| Step 6, numbering paragraph | "**§4** says 'chấm theo mức nền ở mục 1.5' and **§5** says 'ràng buộc ở mục 1.7'" | §6 … §7 |
| Step 6, §1 description | "a one-line compliance statement pointing at **§5**" | §7 |
| Step 6, examples section | "**§1** — measured ✅/❌ pairs" / "**§2–§5** — composed illustrations" | §1 unchanged / §4–§7, **plus** §2 and §3 named explicitly: §2 carries attributed quotes (not composed illustrations — an invented quote is the failure the core exists to stop) and §3 carries one worked candidate block |
| Step 6, section bodies | "**§2** — Trụ cột × persona", "**§3** — Điểm khác biệt", "**§4** — Định dạng và phép thử", "**§5** — Ranh giới nội dung tự nhiên" | §4, §5, §6, §7 — with §2 and §3 bodies written new |
| Step 6, §4 body | "scored against the baselines named in **§1**" | unchanged (§1 did not move) |
| Step 7 summary | adds two lines | see below |

**Length budget: ~1700 → ~2400** space-separated Vietnamese tokens, split roughly
1200 guidance + 500 examples + 700 for §2 and §3. **The `wc -w`-on-the-draft-file
check stays a real gate**, not a note: it is the forcing function that keeps
§4–§7 terse now that two sections have been added above them.

**Step 7 summary** gains exactly two lines: the inherited sophistication (or the
gap), and the count of candidate mechanisms proposed.

*Alternative rejected:* appending the two new sections at the end (§6, §7) to
avoid renumbering. It puts the mechanism supply after the sections that consume
it and reads as an appendix, which is how a supply gets ignored.

### D6 — `ssc-post-ideate`: round 2 carries, round 3 settles and reports off-supply

The supply arrives through `plan.context` — the approved Approaches — which
**Step 0 already reads and holds**. No second `get_strategy_brief`, no new tool,
no re-derivation. `orchestrates` stays `[ssc-brief-core]`; the core is *not*
dispatched from here.

- **Round 2 (2b).** Where a title matches a candidate in the approved supply
  (§3 of the doc), carry **that** candidate's mechanism on `save_idea`, as the
  approved doc states it — carried, not re-authored and not paraphrased. Where no
  candidate matches, **omit the argument exactly as today.** The existing rule is
  restated unchanged: never delay, shrink or withhold a title for want of a
  mechanism, and never pass filler.
- **Round 3, the mechanism pass.** Step 1 of the existing pass ("find the
  mechanism") now says **prefer the approved supply**. A mechanism *not* in the
  supply is **permitted** — the operator approved rails, not a closed list — but
  is **named as off-supply in the 3d report**, so the operator can see which ideas
  went outside the doc they approved and feed that back into next month's
  Approaches. Refusing an off-supply mechanism would stall a good idea behind an
  Approaches re-run; reporting it gives the same information without the stall.
- **Off-supply reporting is bounded by what is readable.** `mechanism` is
  write-only on today's tool surface (the skill's *Facts that bite* already says
  so). So the off-supply list is authoritative **only for mechanisms authored in
  this run**; an idea enriched in an earlier run goes in neither list, exactly as
  the existing third boundary already requires. The new report block reuses that
  boundary rather than inventing a second one.
- **Round 3 sophistication bar (3a).** The angle chosen in 3a, and the awareness
  stage declared with it, must clear the sophistication read carried in the
  approved doc's §1. At a saturated stage a bare benefit claim does not clear it.
  **The bar constrains the angle, never the draft:** an angle that does not clear
  it is rewritten (a different anchor, a different stage) — the idea is never held
  back, never delayed and never shrunk for it. Where the doc says `NOT STATED`,
  the round says so and applies no bar; it never assumes a stage.
- **3d report** gains: the bar line (the inherited read, or "NOT STATED — không
  áp mức chặn"), and a `**Cơ chế ngoài danh sách đã duyệt:** <n>` block listing
  idea × mechanism × why no supply candidate fitted. Both in Vietnamese, both
  reported every run — a silent pass reads the same as a pass that never ran.
- **Governance** gains one bullet tying the two together: the supply is a source
  to prefer, never a closed list, and the sophistication bar is inherited from the
  approved doc, never derived here.

### D7 — `ssc-post-schedule`: hold `plan.context` off the call it already makes

Step 2 already calls `get_channel_plan(channel='post', period)` for the
`approaches_approved` gate check. It starts holding **`plan.context`** off that
same response. **No new call, no new tool, no new KB doc** — the skill's "You need
no other KB doc" line stays true.

It reads **only the sophistication line from §1** of the approved doc. The
existing trap must be preserved verbatim: *"The Approaches doc has no key-date
section; do not look for one there."* Key dates remain the head's `research`.

**Sequencing rule.** Where the read says the market is saturated, mechanism-led
and indirect posts land ahead of direct ones. Placed in Step 5's *Order of work*
as a **preference inside step 3 (spread the remainder)** — it decides *which* idea
fills a free day, and it is subordinate to both the key-date pins (steps 1–2) and
the adjacency repair (step 4). Those already encode harder constraints; a
sequencing preference that could move a pinned key-date post would be a
regression.

**What it sorts on, since `mechanism` is not readable.** `list_ideas` does not
return `mechanism`. The sequencing judgement uses only what is actually on the
row: the idea's `tags` (`journey_stage`, `frame`, `entry`) and its brief fields
(`hook_direction`, `core_message`, and `awareness_stage` where it was persisted).
**It never re-derives a mechanism to sort by** — a guessed mechanism used as a
sort key is a silent, invisible error. This must be stated in the skill, because
the obvious reading of "mechanism-led posts first" is a field the tool surface
does not expose.

**Reporting.** One line in the Step 7 report naming the rule applied. Where the
read is `NOT STATED`, it **makes no sequencing claim** and says so.

### D8 — Wiring: register the core on both the agents and the calling skills

`orchestrates:` gains `ssc-approaches-core` on `plugins/ssc/agents/ssc-post-agent.md`
and `plugins/ssc/agents/ssc-ads-agent.md`, **placed last in the list** with an
inline comment marking it a shared sub-skill dispatched inside Approaches — the
same commenting convention `ssc-post-agent.md` already uses for `ssc-brief-core`.
It is *also* registered on the two calling skills' frontmatter
(`orchestrates: [ssc-approaches-core]`), which is the `ssc-post-ideate` →
`ssc-brief-core` precedent and is what records the actual dispatcher.

*Why both, and what the agent entry costs.* `scripts/build-chatgpt-bundle.mjs`
expands **agent** `orchestrates` into the workflow's `steps[]` and unions their
tools; skill-level `orchestrates` is carried in `documents` but is not expanded.
So the agent entry makes the core appear as a step of `/ssc-post-plan` and
`/ssc-ads-plan` in the ChatGPT bundle. That is a deliberate trade: ChatGPT has no
subagents, so a step entry is how it reaches the core's prose in the flow at all,
and the build gate then validates the wiring. Placing it last and opening its
`description` with "shared sub-skill, dispatched by the two Approaches skills,
never invoked directly" is what stops it reading as a fourth operator stage. The
tool union is a no-op — `get_knowledge` / `search_knowledge` are already in both
workflows.

Remaining wiring:

- `plugins/ssc/commands/ssc-post-plan.md` — the step table's **Approaches** row
  and the **Grounding order** section name the inherited sophistication read and
  the candidate-mechanism supply. The command stays a thin entry point: no
  orchestration logic added.
- This repo's root `CLAUDE.md` — the **Posts (plan)** and **Ads (plan)** rows of
  the pipeline table mention the shared core alongside the existing
  `ssc-brief-core` precedent. (The parent workspace `/Users/thang/dev/ssc/CLAUDE.md`
  is a different repo and is **not** touched.)
- `plugins/ssc/.claude-plugin/plugin.json` — version `2.53.0` → **`2.54.0`**
  (minor: a new skill plus additive behaviour, no removal), **in the same commit**
  as the prose change.
- `chatgpt/workflows.json` — regenerated via `scripts/publish-chatgpt-bundle.sh`
  and committed here. The mirror at
  `content/mcp-server/lib/brandos/workflows/workflows.json` is in a **different
  repo**: this change names the mirror commit and the brandos-express deploy as
  operator actions and does not perform them.

### D9 — Invariants, restated as constraints on every file touched

- **Propose-only.** The core holds no mutation tool at all. No skill or agent
  gains `approve`, `unapprove`, a publish/schedule tool, or uses `edit` to demote.
  No gate is added, moved or flipped.
- **No hard-coded KB content.** Every doc is named with its section and read live.
  No persona name in a closed list, no trigger, prohibition, ladder rung or proof
  family restated in a skill file. The persona roster stays open.
- **A failed KB read STOPS the run**, names the document, and never falls back to
  a remembered version — in the core and in every caller.
- **One outward pass per period.** The core holds no `WebSearch` and no fetch
  tool; the VOC pass is compiled from recorded sources only.
- **The channel authors no themes, no research, no look-back, no quantities.**
  Nothing here writes the head, `plan_targets`, or a `detail` payload.
- **Persisted prose is Vietnamese, headings included.**
- **Every MCP tool named already exists on the BrandOS surface**
  (`get_knowledge`, `search_knowledge`, `get_month_plan`, `get_channel_plan`,
  `get_strategy_brief`, `save_channel_plan`, `save_idea`, `save_brief`, `edit`,
  `list_ideas`, `list_briefs`, `save_schedule_entries`, `allocate_channel`) — the
  change introduces none.

## Risks / Trade-offs

- **The ads refactor silently changes the persisted artifact** → The Step 6 doc
  template and the Step 6b `creative_target` rules must **diff clean** against
  `main`. Make that an explicit check, not an assumption; if either moved, the
  refactor is wrong.
- **A renumbering cross-reference is missed in `ssc-post-approaches`** → The
  checklist in D5 is exhaustive against the current file. After the edit, grep the
  file for `§` and for `mục ` and confirm every hit resolves to the new numbering.
- **Duplicated KB reads (core + caller) cost tokens** → Accepted, per D4 and the
  `ssc-brief-core` precedent. Correctness of a doctrine read beats the saving, and
  a "the caller already read it" optimisation is how a partial view ships.
- **The core appears as a workflow step in the ChatGPT bundle** → Accepted per
  D8; mitigated by last placement, the inline agent comment, and a description
  that opens by saying it is a sub-skill never invoked directly.
- **The 2400-token budget drifts because two sections were added** → The `wc -w`
  check on the draft file stays a hard pre-save gate, and §1's state-it-once rule
  is what pays for §2 and §3.
- **Off-supply reporting looks authoritative when it is not** (`mechanism` is
  write-only) → Reuse `ssc-post-ideate`'s existing third boundary verbatim: an
  idea from an earlier run goes in neither list and is reported as not readable
  through the tool surface.
- **The Schedule sequencing rule tempts a re-derived mechanism** → State the
  readable sort signals explicitly and forbid re-derivation, in the skill body and
  in its governance section.
- **The core grows a second channel conditional** → Bound it in governance as a
  hard rule: one conditional; anything else channel-shaped belongs to the caller.
- **`ssc-post-approaches` and `ssc-ads-approaches` drift apart again** → That is
  precisely what the shared core prevents; the guard is that neither caller may
  restate a rule the core holds. Add that as a governance bullet on both.

## Migration Plan

There is **no data migration** — no schema change, no new field, no back-fill.

**Backwards compatibility is the rollback story.** An Approaches doc approved
under the five-section shape simply has no §2 and no §3, and no sophistication
line in §1. Downstream that degrades exactly the way an absent input already
degrades today:

- `ssc-post-ideate` finds no supply → round 2 omits `mechanism` and round 3 settles
  it from the same grounding as today, reporting "no supply in the approved doc".
- `ssc-post-schedule` finds no sophistication line → makes no sequencing claim and
  says so, which is the same behaviour as `NOT STATED`.

So the change applies from the **next authored doc** forward. No approved doc,
idea, brief or calendar is re-opened or re-written.

**Release order (single commit in this repo):**

1. New skill + the four skill edits + the two agent edits + the command edit +
   root `CLAUDE.md`.
2. `plugin.json` version bump — same commit, non-negotiable (operators update by
   version).
3. `node scripts/build-chatgpt-bundle.mjs`, then
   `scripts/publish-chatgpt-bundle.sh`, and commit the regenerated
   `chatgpt/workflows.json` in the same commit.
4. **Operator actions, named but not performed here** (different repo): commit
   the refreshed mirror in `content/`, deploy brandos-express. Until that lands
   ChatGPT keeps running the old prose — Cowork gets the change immediately.

**Rollback:** revert the single commit and re-run the bundle publish. Nothing
persisted changes shape, so there is nothing to unwind on the server.

## Verification

**This repo has no test harness for prose.** There is no lint and no test for
skills, agents or commands (a design for one is parked at
`docs/superpowers/specs/2026-07-03-plugin-test-lint-harness-design.md`). Saying
"the prose reads correctly" is not a gate. The gates that actually exist, all of
which must pass with reported output before the change is called done:

1. **`node scripts/build-chatgpt-bundle.mjs`** — the nearest thing to a test here.
   It fails on a skill directory that does not match its frontmatter `name`, on a
   missing `metadata.dispatches`, and on an `orchestrates` entry naming no such
   skill. This is what proves `ssc-approaches-core` is wired.
2. **`node --test hooks/`** from `plugins/ssc/` — unchanged by this design; run it
   to confirm nothing regressed, and report the actual counts.
3. **`scripts/publish-chatgpt-bundle.sh --check`** — exits 1 if the mirror is
   stale.
4. **`git diff` on the two ads sections that must not move** — Step 6's doc
   template and Step 6b's `creative_target` rules. Clean diff = the refactor is
   behaviour-preserving.
5. **A live read-through against the BrandOS surface**, rather than trusting this
   document's account of it: confirm `get_strategy_brief` returns
   `sophisticationStage` + `sophisticationRead` and `get_month_plan` returns
   `proofInventory` / `offerState` for a real period.

## Drift Log

Two decisions changed during implementation. Both were reviewed and accepted
rather than reverted.

**DL1 — D3's Step 6 row: the "only edit" clause is struck.** D3 said the ads doc
template was "unchanged, byte for byte… the only edit is that they now say the
content comes from the core's block" — self-contradictory as written. The clean
diff is the binding intent: it is stated four times (D3 in bold, Risks §1, task
2.6, Verification gate 4) and it is what makes the refactor provably
behaviour-preserving. Because the step numbers stayed put, the template's existing
`<Step 4's output: …>` now resolves to the core dispatch and `<Step 5's output: …>`
to the compose step — the pointer is correct without an edit. **Resolution:** Step
6 stays byte-identical; the "only edit" clause of D3 no longer applies.

**DL2 — accepted residual duplication of the candidate-mechanism construction in
the ads skill.** `ssc-ads-approaches` Step 1b still says candidate mechanisms "may
lean only on a device stated here", and both Approaches doc templates restate the
four per-candidate fields including the proof-inventory and indirectness rules.
That is a second statement of construction the core now owns, which the
`approaches-shared-core` spec's "neither channel skill holds a second copy"
scenario targets. It was left in place because removing it means editing Step 6,
which DL1 forbids in this change. **Resolution:** recorded as accepted residual
duplication — the core is authoritative, and the next edit to either Approaches
skill removes the copy.

The same residue covers the **VOC pass**: the ads Step 6 template (frozen by DL1)
and the post §2 body both restate the attribution rule, the ranked sources and the
never-invent-a-quote rule. Same resolution — the core is authoritative and the next
Approaches edit removes the copies. The **sophistication-inherit rule** carries no
residue: it was reduced to a hold plus a pointer in both callers, symmetrically.

**DL3 — the core also reads `rules/banned-words`.** D1's KB list does not name it.
The core authors Vietnamese the callers are forbidden to re-word, so the check
belongs where the string is written: `rules/banned-words` is on the core's read
list, a failed read of it stops the core's run like any other, and a violation
found inside returned material stops the save and is reported rather than silently
re-worded. The callers' own pre-save gates are unchanged — they still check the
whole document.

## Open Questions

None blocking. Item 5 above is a **verification**, not an unsettled decision — the
fields are already read by `ssc-ads-approaches` and the head skills today, and the
live check exists because "MCP tool descriptions and skill prose about the server
were both wrong" is a failure this workspace has already paid for.
