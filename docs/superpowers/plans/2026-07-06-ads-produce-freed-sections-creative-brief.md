# Ads-Produce Freed Sections + Creative Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Free `headline`/`description`/`image_content` from chaining each other in `ssc-ads-writer` (each gated only on `approved(copy)`, each re-invocable at will), and add a new sibling skill `ssc-ads-brief` that revises the idea's own creative-brief fields (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`/`theme`) any time after `copy` is approved.

**Architecture:** This repo is a Claude Code marketplace plugin made of **prose** (markdown skills/commands) — there is no compiled code and no test runner. "Implementation" = editing/creating markdown so `/ssc.ads-produce` routes between two skills (`ssc-ads-writer` for the four `content`-row text sections, `ssc-ads-brief` for the idea-level brief fields) and `ssc-ads-writer`'s gate only chains `copy` in front of the other three. Verification is a `grep`-based consistency sweep plus the one governance-hook smoke test. The only real code (the PreToolUse hook) is **not touched** and must stay green.

**Tech Stack:** Markdown (skills/commands/docs). Node 20 for the governance hook smoke test only. `git` for commits. `grep` for verification.

## Global Constraints

Copied from the design spec (`docs/superpowers/specs/2026-07-06-ads-produce-freed-sections-creative-brief-design.md`) — every task's requirements implicitly include these:

- **The four `content.section` values are unchanged** — still exactly `headline | copy | description | image_content`. `creative_brief` is **not** a `content` section value and must **never** be passed to `save_post_content`/appear in `list_post_content`.
- **`copy` stays the mandatory cold-start section** — no earlier input, must be approved before anything else (including `creative_brief`) can run.
- **`headline`, `description`, `image_content` are each gated ONLY on `approved(copy)`** — never on each other — and each is **re-invocable at will**, even after its own approval, producing a fresh batch grounded in whatever is currently live-approved.
- **`creative_brief` is produced by a new sibling skill `ssc-ads-brief`**, gated only on `approved(copy)`. It is **never auto-picked** by `/ssc.ads-produce`'s no-argument default — reachable only via the explicit `section=creative_brief` argument.
- **`ssc-ads-brief` writes the idea's own detail fields** (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`, `theme` — the same field names `ssc-post-ideate` already uses for posts) via an `update_idea` tool call. Every invocation **directly overwrites** these six fields — no draft/approve state, no `content` row, no scoring loop, one canonical revision per run. `update_idea` never touches the idea's `status`.
- **`ssc-ads-brief` does not gate `ssc-ads-image`** — that skill's precondition remains `approved(image_content)` only.
- **Preserve every existing invariant in `ssc-ads-writer` unchanged:** the ≥3-proof-density rules, the Step 7 quality gate + honest 1–5 scoring + replacement loop, banned-words/compliance/food-placeholder/authenticity rails, save-to-server-not-present-in-chat, and every propose-only rule (never `approve_*`/`unapprove_*`/`update_status`/publish; never edit or delete a `content` row).
- **All persisted prose stays Vietnamese** — saved `body`/`comment` in `ssc-ads-writer`; the six brief fields in `ssc-ads-brief`. Chat/system text may be English.
- **Do not touch:** `save_post_content`'s contract, the `/ad/[id]` dashboard, `plugin.json`'s `mcpServers` config, `.mcp.json`, `marketplace.json`, the planning pipeline (Focus → Approaches → Blueprint → Ideate), `ssc-ads-image`'s gate, and `hooks/approval-gate.mjs`.

---

## File Structure

Files **modified**:
- `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` — **the core.** Frontmatter description, Inputs, body intro, Step 2 (gate), Step 4 (input reload), Step 7 (conditional complement check), Step 9 (summary + next-actions), Output, Governance.
- `plugins/ssc-content/commands/ssc.ads-produce.md` — thin router: dispatches `ssc-ads-writer` or `ssc-ads-brief` based on the (optional) `section` argument.
- `CLAUDE.md` (repo root) — pipeline table row 61 (accuracy).
- `plugins/ssc-content/commands/ssc.ads-image.md` — line 24 wording (accuracy — the "text chain … is complete" framing is now inaccurate since `image_content` no longer requires headline/description).
- `plugins/ssc-content/.claude-plugin/plugin.json` — version bump.

Files **created**:
- `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` — new skill.

**Note:** `plugins/ssc-content/skills/ssc-ads-image/SKILL.md` contains no chain string (its only precondition is `approved(image_content)`) — do **not** edit it.

---

## Task 1: Free `headline`/`description`/`image_content` from chaining in `ssc-ads-writer/SKILL.md`

This is the substantive task. Apply every edit below in order, then run the verification greps, then commit.

**Files:**
- Modify: `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: the canonical freed-gating language (`gated only on copy being approved`, `re-invocable at will`) and the `section` input argument that Task 3 (command) references by name.

- [ ] **Step 1: Read the file**

Run: `Read plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` (full). You need the exact current text to make each Edit below match.

- [ ] **Step 2: Frontmatter `description` — two replacements (line 3)**

Replace:

```
then reads list_post_content to find the single NEXT open section in the approval chain copy → headline → description → image_content (the first not yet approved), and produces N rated Vietnamese variations for THAT one section
```

with:

```
then reads list_post_content to find the target section — copy is the mandatory cold start; once copy is approved, headline, description, and image_content are each independently producible (gated only on copy, not on each other), chosen via an optional section argument or auto-picked among those not yet approved — and produces N rated Vietnamese variations for THAT one section
```

Then replace:

```
The operator reviews/edits/approves that section in the /ad/[month]/[id] dashboard, then re-invokes for the next section; headline distils the approved copies, description compresses those copies, image_content builds on those + headlines + descriptions.
```

with:

```
The operator reviews/edits/approves that section in the /ad/[month]/[id] dashboard, then re-invokes for any of headline/description/image_content in any order, or re-invokes the same section again for a fresh revision; headline distils the approved copies, description compresses those copies (complementing an approved headline when one exists), image_content builds on those copies plus headlines/descriptions when they exist.
```

- [ ] **Step 3: Body intro — chain sentence (line ~15)**

Replace:

```
and, on each invocation, produce the **single next open section** in the approval chain **`copy` → `headline` → `description` → `image_content`**: N rated, finished **Vietnamese** variations for that one section
```

with:

```
and, on each invocation, produce **ONE target section**: `copy` first (mandatory, no earlier input), then — once `copy` is approved — `headline`, `description`, and `image_content`, each independently (gated only on `copy` being approved, not on each other, and each re-invocable after its own approval for a fresh revision), named via an optional `section` argument or auto-picked among those without an approved row: N rated, finished **Vietnamese** variations for that one section
```

- [ ] **Step 4: Body intro — "State-driven per-section stepping" paragraph (line ~19)**

Replace the entire paragraph:

```
**State-driven per-section stepping.** Each invocation runs the **next open step**: you read `list_post_content(idea_id)` to see which sections already have an **approved** row, and produce only the first section in the chain that is not yet approved. A section runs only when every earlier section has ≥1 approved row. **Later sections read the LIVE APPROVED copy bodies as their input** — `headline` distils the approved copy(ies); `description` compresses the approved copy(ies) (with the approved headline as a secondary reference); `image_content` builds on the approved copy(ies) + headline(s) + description(s) — so the winning copy the operator approved (and any dashboard edits to it) carries forward.
```

with:

```
**State-driven per-section stepping, freed after copy.** Each invocation resolves ONE target section: `copy` is the mandatory cold start (no earlier input); once `copy` has ≥1 approved row, `headline`, `description`, and `image_content` are each **independently** producible — gated only on `copy` being approved, never on each other — selected via an optional `section` argument (Step 2) or auto-picked among those without an approved row yet. Any of the three may also be **re-invoked after its own approval** to produce a fresh revision. **Each reads the LIVE APPROVED bodies of whichever sections happen to be approved when it runs** — `headline` distils the approved copy(ies); `description` compresses the approved copy(ies), complementing the approved headline(s) if any exist yet; `image_content` builds on the approved copy(ies) plus the approved headline(s)/description(s) if any exist yet — so the winning copy the operator approved (and any dashboard edits to it) always carries forward, and nothing blocks on a section the operator hasn't gotten to.
```

- [ ] **Step 5: Inputs — add the `section` targeting argument**

Replace:

```
- `idea_id` — a specific approved ad concept's idea id, targeting that concept directly.
- `date` — a calendar day (YYYY-MM-DD); resolved to the approved ad concept(s) for that day.

Optional (variation counts — **configurable**):
```

with:

```
- `idea_id` — a specific approved ad concept's idea id, targeting that concept directly.
- `date` — a calendar day (YYYY-MM-DD); resolved to the approved ad concept(s) for that day.

Optional (section targeting):

- `section` — one of `headline` | `description` | `image_content`. Names the specific section to produce this invocation, regardless of whether the others are approved yet, and even if this section already has an approved row (produces a fresh revision). Omit to auto-pick: the first of `headline → description → image_content` (nominal order) without an approved row yet. Has no effect before `copy` is approved — `copy` is always the mandatory first section regardless of this argument.

Optional (variation counts — **configurable**):
```

- [ ] **Step 6: Step 2 — replace the gate intro + table + trailing sentence (lines ~107–135)**

Replace the whole block from the `### Step 2:` heading through the trailing "chain is strict" sentence:

```markdown
### Step 2: Determine the single next open section-step

The sections are produced one per invocation, in the strict chain **`copy` → `headline` → `description` → `image_content`**, each gated on the previous being approved. Read what already exists for this concept:

```
Call: list_post_content
  idea_id: <idea.id>
```

It returns `variations[]`, each with `section` (`headline`|`copy`|`description`|`image_content`|`image`), `status` (`draft`|`approved`), `score`, `comment`, `body` (newest first). Ignore any legacy `section='image'` rows (the retired rendered-PNG creative). For each text section S ∈ {`headline`, `copy`, `description`, `image_content`} compute:

- `approved(S)` = at least one row with `section = S` AND `status = 'approved'`
- `has_drafts(S)` = at least one row with `section = S` AND `status = 'draft'`

Apply the **FIRST** matching rule. Either set the **active section** and continue to Step 3, or **STOP** with the stated message (Step 9 emits it):

| Condition | Action |
|---|---|
| not `approved(copy)` AND `has_drafts(copy)` | **STOP** — copies are saved as drafts awaiting your review; review/edit and **approve ≥1 copy** in `/ad/[month]/[id]`, then re-invoke. (Do NOT produce a second batch.) |
| not `approved(copy)` | active section = **`copy`** → Step 3 |
| `approved(copy)`, not `approved(headline)`, `has_drafts(headline)` | **STOP** — **approve ≥1 headline** in `/ad/[month]/[id]`, then re-invoke. |
| `approved(copy)`, not `approved(headline)` | active section = **`headline`** → Step 3 |
| `approved(copy)` & `approved(headline)`, not `approved(description)`, `has_drafts(description)` | **STOP** — **approve ≥1 description** in `/ad/[month]/[id]`, then re-invoke. |
| `approved(copy)` & `approved(headline)`, not `approved(description)` | active section = **`description`** → Step 3 |
| `approved(copy)`+`approved(headline)`+`approved(description)`, not `approved(image_content)`, `has_drafts(image_content)` | **STOP** — **approve ≥1 image-content set** in `/ad/[month]/[id]`, then re-invoke. |
| `approved(copy)`+`approved(headline)`+`approved(description)`, not `approved(image_content)` | active section = **`image_content`** → Step 3 |
| `approved(copy)` & `approved(headline)` & `approved(description)` & `approved(image_content)` | **STOP** — production is complete for this concept; all four sections have an approved variation. |

The chain is strict: never produce `headline` before a copy is approved, `description` before a headline is approved, or `image_content` before a description is approved.
```

with:

```markdown
### Step 2: Determine the target section

`copy` is the mandatory cold-start section — nothing else can be produced before it is approved. Once `copy` has ≥1 approved row, `headline`, `description`, and `image_content` are each independently producible: gated only on `copy` being approved, not on each other, and each re-invocable at will (even after its own approval, to produce a fresh revision grounded in whatever is currently approved). Read what already exists for this concept:

```
Call: list_post_content
  idea_id: <idea.id>
```

It returns `variations[]`, each with `section` (`headline`|`copy`|`description`|`image_content`|`image`), `status` (`draft`|`approved`), `score`, `comment`, `body` (newest first). Ignore any legacy `section='image'` rows (the retired rendered-PNG creative). For each text section S ∈ {`headline`, `copy`, `description`, `image_content`} compute:

- `approved(S)` = at least one row with `section = S` AND `status = 'approved'`
- `has_drafts(S)` = at least one row with `section = S` AND `status = 'draft'`

Apply the **FIRST** matching rule. Either set the **active section** and continue to Step 3, or **STOP** with the stated message (Step 9 emits it):

| Condition | Action |
|---|---|
| not `approved(copy)` AND `has_drafts(copy)` | **STOP** — copies are saved as drafts awaiting your review; review/edit and **approve ≥1 copy** in `/ad/[month]/[id]`, then re-invoke. (Do NOT produce a second batch.) |
| not `approved(copy)` | active section = **`copy`** → Step 3 |
| `approved(copy)`; a `section` input names `headline`, `description`, or `image_content`; `has_drafts(<that section>)` | **STOP** — that section has unreviewed drafts pending; **approve/reject them** in `/ad/[month]/[id]` first, then re-invoke. |
| `approved(copy)`; a `section` input names `headline`, `description`, or `image_content` | active section = **the named section** → Step 3 (produces a fresh batch whether or not it already has an approved row) |
| `approved(copy)`; no `section` input; every one of `headline`/`description`/`image_content` already has an approved row | **STOP** — all three text sections have an approved variation; name a `section` for a fresh revision, or run `/ssc.ads-produce <idea_id> creative_brief` for the handoff brief. |
| `approved(copy)`; no `section` input; the first of `headline → description → image_content` (nominal order) without an approved row has pending drafts (`has_drafts`) | **STOP** — that section has unreviewed drafts pending; **approve/reject them** in `/ad/[month]/[id]` first, then re-invoke. |
| `approved(copy)`; no `section` input | active section = **the first of `headline → description → image_content` without an approved row** → Step 3 |

`headline`, `description`, and `image_content` are **not** chained to each other — only to `copy`. Never produce anything before `copy` is approved; once `copy` has an approved row, any of the other three can be targeted in any order, any number of times.
```

- [ ] **Step 7: Step 4 — replace the whole step with the "whatever is approved" version (lines ~190–200)**

Replace the entire Step 4 block (from the `### Step 4:` heading through the paragraph ending "...ground it in the concept brief + build_spec + KB only.") with:

```markdown
### Step 4: Reload the LIVE approved copies (the source of truth) + whatever else is approved

The **copy is the source of truth** for the concept — `headline`, `description`, and `image_content` all lead from the approved copies. Because the operator may **edit an approved copy in the dashboard at any time**, you MUST ground every section in the **current** approved copy bodies. You already re-read `list_post_content(idea_id)` this run (Step 2), so read the live approved rows from that result — **never** a cached or prior-run body.

Since `headline`/`description`/`image_content` no longer gate on each other, when you run one of them the others may or may not be approved yet. Gather whatever is live-approved, from the Step 2 `list_post_content` result:

- for **`headline`** — every `section='copy'` row with `status='approved'`: hold their live `body` values (the approved copies). The headline distils a short standalone on-creative hook from the **pooled** approved copy hooks — **free distillation across all approved copies** (not a 1:1 one-headline-per-copy mapping): pick the sharpest opening lines across the whole approved-copy pool.
- for **`description`** — every approved `copy` body (the **primary** input for the promise), AND every approved `headline` body **if any exist yet** — read them so the description can **COMPLEMENT** them, never echo them (per `ad/copy-checklist` Bước 2B): the headline carries the hook/problem, so each description must land a **different beat** — the payoff, a concrete proof, or the "so what". If no headline is approved yet, ground the description in the approved copy alone and note in the Step 9 summary that there was no approved headline to complement against.
- for **`image_content`** — every approved `copy` body (the anchor), AND every approved `headline`/`description` body **if any exist yet**: **anchor each version to one approved `copy`** and distil **that copy's HOOK (its opening / sharpest line) into the on-image HEADLINE** — leverage the winning copy's proven hook, not merely a restated standalone `headline` (an approved `headline`, if one exists, may sharpen the wording, but the copy's hook drives it). If no headline/description is approved yet, derive the SUBHEADLINE + BULLETS from the anchor copy's own proof lines alone, and note the gap in the Step 9 summary.

These live approved bodies are your **input** — the winning copies the operator selected (and possibly edited; you read the live approved rows, so any dashboard edits are always reflected). If the active section is **`copy`**, there is **no** earlier-section input — ground it in the concept brief + `build_spec` + KB + the Hook Formula Bank only (the copy owns the hook).
```

- [ ] **Step 8: Step 7 — make the description "complements, doesn't echo" check conditional on a headline existing**

Replace:

```
- [ ] **Complements, doesn't echo (`description` only)** — per `ad/copy-checklist` Bước 2B: the description lands a **different beat** than every approved headline (payoff / proof / "so what"), **leads with one concrete proof** (not a vague benefit), and does not repeat another description's proof/beat. A description that restates an approved headline's angle, or leads with a vague benefit / no concrete proof, **cannot score ≥4**.
```

with:

```
- [ ] **Complements, doesn't echo, when a headline exists (`description` only)** — per `ad/copy-checklist` Bước 2B: **if at least one headline is approved**, the description must land a **different beat** than every approved headline (payoff / proof / "so what") and not restate its angle — a description that echoes an approved headline's angle **cannot score ≥4**. Regardless of whether a headline is approved yet, every description must **lead with one concrete proof** (not a vague benefit) and not repeat another description's proof/beat — a description that leads with a vague benefit / no concrete proof **cannot score ≥4**.
```

- [ ] **Step 9: Step 9 — rewrite "Built on approved input" line, the "If Step 2 stopped" line, and the next-action bullets (lines ~338, ~348, ~361–365)**

Replace:

```
**If Step 2 stopped** (a section had unapproved drafts, or all four sections are already approved), emit that stop message plainly — name the section and the exact next action (approve ≥1 in `/ad/[month]/[id]` then re-invoke; or "production complete for this concept").
```

with:

```
**If Step 2 stopped** (a target section had unapproved drafts, or `copy` isn't approved yet, or all three of headline/description/image_content already have an approved row and no `section` was named), emit that stop message plainly — name the section and the exact next action (approve ≥1 in `/ad/[month]/[id]` then re-invoke; or "name a section for a fresh revision, or run creative_brief").
```

Replace:

```
**Built on approved input:** <"— (copy is the first step)" | "<N> approved copy(ies)" | "<N> approved copy(ies) + <M> approved headline(s)" | "approved copy(ies) + headline(s) + description(s)">
```

with:

```
**Built on approved input:** <"— (copy is the first step)" | "<N> approved copy(ies)" | "<N> approved copy(ies) + <M> approved headline(s) (if any)" | "<N> approved copy(ies) + approved headline(s)/description(s), whichever are approved">
```

Replace the four next-action bullets:

```markdown
  - after **copy**: `Next: open /ad/<month>/<idea_id> → review/edit/approve ≥1 copy, then re-run /ssc.ads-produce <idea_id> to produce the headlines.`
  - after **headline**: `Next: approve ≥1 headline in /ad/<month>/<idea_id>, then re-run /ssc.ads-produce <idea_id> to produce the descriptions.`
  - after **description**: `Next: approve ≥1 description in /ad/<month>/<idea_id>, then re-run /ssc.ads-produce <idea_id> to produce the image content.`
  - after **image_content**: `Next: approve ≥1 image-content set in /ad/<month>/<idea_id>. That completes all four sections for this concept.`
```

with:

```markdown
  - after **copy**: `Next: open /ad/<month>/<idea_id> → review/edit/approve ≥1 copy, then re-run /ssc.ads-produce <idea_id> [section] to produce headline/description/image_content in any order.`
  - after **headline**, **description**, or **image_content**: `Next: review/approve in /ad/<month>/<idea_id>. Run /ssc.ads-produce <idea_id> <section> for either of the other two, re-run this same section any time for a fresh revision, or run /ssc.ads-produce <idea_id> creative_brief once ready for the handoff brief.`
```

- [ ] **Step 10: Output section — reorder/generalize the dependency sentence (line ~370)**

Replace:

```
- **One section per invocation.** The operator approves in the dashboard and re-invokes for the next section; `headline` distils the approved copy(ies), `description` compresses the approved copy(ies) (with the headline as a secondary reference), `image_content` on the approved copy(ies) + headline(s) + description(s).
```

with:

```
- **One section per invocation, freed after copy.** `copy` must be approved first; after that, the operator can invoke `headline`, `description`, and `image_content` in any order (or re-invoke any of them again for a fresh revision) — each reads whichever of the others are currently approved and grounds in the live approved copy regardless.
```

- [ ] **Step 11: Governance — generalize two bullets (lines ~379, ~380)**

Replace:

```
- **State-driven per-section stepping (hard rule).** Each invocation reads `list_post_content(idea_id)` and produces the single next section in the chain `copy → headline → description → image_content` that is not yet approved. A section runs only when every earlier section has ≥1 approved row. If the next section already has unapproved drafts, STOP and ask the operator to approve/edit them first — do NOT produce a second batch.
```

with:

```
- **State-driven per-section stepping, freed after copy (hard rule).** Each invocation reads `list_post_content(idea_id)` and produces ONE target section: `copy` is the mandatory cold start; once `copy` has ≥1 approved row, `headline`/`description`/`image_content` are each independently producible — gated only on `copy`, never on each other — via an explicit `section` input or auto-picked among those without an approved row. Any of the three may be re-invoked after its own approval for a fresh revision. If the target section already has unapproved drafts, STOP and ask the operator to approve/reject them first — do NOT produce a second batch.
```

Replace:

```
- **Approved input carries forward (copy is the source of truth).** `headline` variations distil the LIVE APPROVED `copy` bodies (free distillation across all approved copies); `description` variations compress a LIVE APPROVED `copy` promise (with the approved `headline` as a secondary reference); `image_content` versions anchor to a LIVE APPROVED `copy` and read the approved `headline` + `description` too — all re-read from `list_post_content` each run, so operator edits to copies are always reflected.
```

with:

```
- **Approved input carries forward (copy is the source of truth).** `headline` variations distil the LIVE APPROVED `copy` bodies (free distillation across all approved copies); `description` variations compress a LIVE APPROVED `copy` promise, complementing the approved `headline`(s) when any exist yet; `image_content` versions anchor to a LIVE APPROVED `copy` and read the approved `headline`/`description` too when they exist yet — all re-read from `list_post_content` each run, so operator edits to copies are always reflected, and none of the three blocks on a section the operator hasn't reached yet.
```

- [ ] **Step 12: Verify the freed gating — grep for stale strict-chain strings**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n "each gated on the previous being approved\|A section runs only when every earlier section has ≥1 approved row\|never produce \`headline\` before a copy is approved\|the strict chain \*\*\`copy\`" plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
```

Expected: **no output** (all strict-chain framing gone). Then confirm the new freed-gating language is present:

```bash
grep -c "gated only on \`copy\`\|gated only on copy\|re-invocable at will\|not chained to each other" plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
```

Expected: **≥3**.

- [ ] **Step 13: Verify invariants are intact**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -c "≥3 distinct\|propose-only\|never call\|Vietnamese\|save_post_content" plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
```

Expected: a count clearly **> 5** (proof-density, propose-only, Vietnamese, and save invariants are all still present).

- [ ] **Step 14: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
git commit -m "$(cat <<'EOF'
feat(ads-writer): free headline/description/image_content from chaining each other

copy stays the mandatory cold-start section. Once copy is approved,
headline/description/image_content are each independently producible —
gated only on approved(copy), never on each other — chosen via an
optional section argument or auto-picked, and re-invocable at will
after their own approval for a fresh revision. Each still grounds in
whatever upstream is currently live-approved. Invariants (≥3 proof,
quality gate, propose-only, VN) intact.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create the new `ssc-ads-brief` skill

**Files:**
- Create: `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md`

**Interfaces:**
- Consumes: `list_post_content` shape from Task 1 (unchanged); `approved(copy)` gate concept from Task 1.
- Produces: the skill name `ssc-ads-brief` and its `section=creative_brief` trigger keyword, which Task 3's command routes to by name.

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p /Users/thang/dev/ssc/ssc-content-plugin/plugins/ssc-content/skills/ssc-ads-brief
```

- [ ] **Step 2: Write the new SKILL.md**

Create `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` with exactly this content:

```markdown
---
name: ssc-ads-brief
description: Revises the CREATIVE BRIEF fields on ONE approved ad concept's idea row — the handoff synthesis sibling of ssc-ads-writer. Resolves ONE approved ad concept (an ideas row, channel='ad', status='approved' — by idea id or by date) plus its ad-set build_spec, requires the concept's copy section to have ≥1 approved row, then reads list_post_content for whichever of headline/description/image_content are also currently approved and derives the idea's structured brief fields — hook_direction, core_message, why_now, story_moment, cta, theme — the same field shape ssc-post-ideate already writes for post ideas. Writes them via update_idea (id, plus the six fields) and STOPS. There is no draft/approve step for these fields — every invocation directly overwrites with freshly-derived values, so re-running after more sections are approved refreshes ("revises") the brief. Propose-only: update_idea only revises informational fields on an idea that is already approved — it never touches status, never approves/publishes/schedules, and never flips any gate. All persisted prose Vietnamese.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_idea, get_channel_plan, list_post_content, update_idea]
---

# Ads Brief (`ssc-ads-brief`)

You are the **creative-brief revisor** of the standalone Cambridge Diet Vietnam ad-production workflow — the handoff-synthesis sibling of `ssc-ads-writer`. You take **ONE approved ad concept** (an `ideas` row, `channel='ad'`, `status='approved'`) whose **`copy` section has ≥1 approved row**, and on each invocation you **revise the idea's structured brief fields** — `hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`, `theme` — the same field shape `ssc-post-ideate` already writes for post ideas, so ad concepts end up with a comparable brief for whoever builds the visual or traffics the ad.

**No draft/approve step, no scoring loop, one canonical revision per run.** Unlike `ssc-ads-writer`'s sections, the brief fields live directly on the idea row, not as `content` rows — there is no separate draft/approved state to manage. Every invocation **directly overwrites** the six fields with freshly-derived values grounded in whatever is currently approved. This is what makes it a "revise": running it again after more sections get approved simply produces a richer, more accurate brief — there is nothing stale to reload and nothing to approve first.

You are propose-only: `update_idea` only revises **informational fields** on an idea that is already `approved` — it never touches `status`, never approves/publishes/schedules anything, and you **never** call `approve_*`, `unapprove_*`, `update_status`, or any publish/schedule tool.

This is the **handoff step** of the ad flow — it runs any time after `copy` is approved (independent of whether headline/description/image_content are approved yet), to give the design/media-buying team a synthesized reference of the concept. It does **not** gate `ssc-ads-image` — that skill's precondition remains `approved(image_content)` only.

## Inputs

One of (the concept selector):

- `idea_id` — a specific approved ad concept's idea id, targeting that concept directly.
- `date` — a calendar day (YYYY-MM-DD); resolved to the approved ad concept(s) for that day.

## Procedure

### Step 1: Resolve the approved concept (work ONE concept at a time)

**If given an `idea_id`:** call `get_idea`:

```
Call: get_idea
  id: <idea_id>
```

The result is FLAT: the single idea's lifecycle core (incl. `id`, `status`, `channel`, `plan_id`), its ad detail as **top-level fields** (`ad_slot_id`, `ad_notes`), and its `tags[]` (each `{ term_id, kind, code, label }`). If the idea does not resolve (`{ idea: null }`), STOP and tell the operator the idea id was not found.

**If given a `date`:** resolve the day's approved ad concept(s) for `channel='ad'` and take ONE. If several concepts are scheduled that day, work ONE concept at a time — resolve ONE concept and run Steps 2–5 for it. Announce in the Step 5 summary which concept you worked and that the remaining concepts for that date still need their own passes. Do NOT batch across concepts in a single run.

**Gate-check (concept must be APPROVED):** read the resolved idea's `status`. If `status !== 'approved'`, STOP and tell the operator:

> This ad concept is still a draft — curate and approve it first (Ideas → filter channel = ad), then re-invoke.

Also confirm `channel === 'ad'`; if not, STOP (this skill operates only on the ad channel). Hold:

- `idea.id` — passed to `list_post_content` and `update_idea`.
- `idea.title` — the concept's main idea (one Vietnamese line).
- `idea.ad_slot_id` — used in Step 1b to fetch the ad-set `build_spec`.
- `idea.ad_notes` — the structural shorthand + lane/source note.
- `idea.tags[]` — the structural dimensions: **layer** (`kind='campaign_layer'`), **value** (`kind='value'`), **frame** (`kind='frame'`), **persona** (`kind='persona'`), and any **entry** / **against** / **experience** present.

### Step 1b: Resolve the ad-set `build_spec`

Needed for the `why_now` field's audience-stage/timing rationale. The idea has no `period` field — derive the plan period `YYYY-MM` from this skill's own inputs: use the `date` input's month when a `date` was given; otherwise take the month from the idea's `created_at`; if still ambiguous, ask the operator for the plan month (one question). Then call:

```
Call: get_channel_plan
  channel: ad
  period: <the concept's plan period, YYYY-MM>
```

From `{ plan }`, find the `plan.ad_slots[]` row whose `id === idea.ad_slot_id` and hold its `slot_name`, `layer`, and `build_spec` (`objective`, `audience`, `optimizationGoal`, `placements`, `frequencyCap`, `budgetShare`, tier `kpi`). If `idea.ad_slot_id` is null or the row is not found, proceed WITHOUT the build_spec (derive `why_now` from the idea's tags + plan period alone) and note that in the Step 5 summary. Do NOT stop.

### Step 2: Gate — require an approved `copy`

Read the concept's saved content:

```
Call: list_post_content
  idea_id: <idea.id>
```

It returns `variations[]`, each with `section` (`headline`|`copy`|`description`|`image_content`|`image`), `status` (`draft`|`approved`), `body`. Compute `approved(copy)` = at least one row with `section='copy'` AND `status='approved'`.

If **not** `approved(copy)`, STOP and tell the operator:

> The concept's copy hasn't been approved yet — approve ≥1 copy in `/ad/[month]/[id]` (run `/ssc.ads-produce <idea_id>` first if no copy has been drafted), then re-invoke `/ssc.ads-produce <idea_id> creative_brief`.

Otherwise, hold the live approved rows from this same `list_post_content` result:

- every `section='copy'` row with `status='approved'` (required, ≥1).
- every `section='headline'` row with `status='approved'` (optional, may be empty).
- every `section='description'` row with `status='approved'` (optional, may be empty).
- every `section='image_content'` row with `status='approved'` (optional, may be empty).

### Step 3: Derive the six brief fields

Ground every field in the concept's `title`/`tags`/`ad_notes` (Step 1), the `build_spec` context (Step 1b), and the live approved bodies (Step 2). Never fabricate detail beyond what these sources support.

- **`hook_direction`** — the opening-hook strategy. Take it from the winning approved copy's opening line; if an approved headline exists, it already distils that hook, so prefer stating the headline's distilled form with a one-clause note of the copy hook it came from.
- **`core_message`** — one clear Vietnamese sentence stating the strategic argument: `idea.title` sharpened by the approved copy's core promise (the transformation/benefit it argues for).
- **`why_now`** — the ad-set's audience-stage/timing rationale: cold/L1 (problem-aware — name the pain/curiosity this month serves), warm/L3 (most-aware — name the proof/offer this serves), or L2 omnipresence (reach — name the lived-proof angle), combined with the plan period. If `build_spec` was unavailable (Step 1b), derive this from the idea's tags + plan period alone and say so.
- **`story_moment`** — a concrete scene **from the approved copy**, only if the concept is story/person-led (`frame=confession` or an `against`/persona tag implying a lived scene). If the concept is not story-led, write exactly: `Không áp dụng — concept không thuộc dạng kể chuyện.` (never invent a scene to fill the field).
- **`cta`** — the actual CTA phrasing used in the approved copy (or approved description, if it states one more concretely). Quote it, don't paraphrase it into something new.
- **`theme`** — a short Vietnamese label combining the concept's `value` + `frame` tags (e.g. "Bền vững · Confession").

All six values are Vietnamese prose (short — a phrase to one sentence each, not paragraphs).

### Step 4: Write the brief fields

```
Call: update_idea
  id:             <idea.id>
  hook_direction: <derived value>
  core_message:   <derived value>
  why_now:        <derived value>
  story_moment:   <derived value, or the "Không áp dụng" line>
  cta:            <derived value>
  theme:          <derived value>
```

This call only revises the six informational fields above — it does not touch `status` or any other lifecycle field. Do NOT pass any approval field. Capture the returned confirmation for the Step 5 summary. **Never call `approve_idea`, `update_status`, or any publish/schedule tool.**

### Step 5: Output summary

```
## Ads Brief — <concept title> — revised

**Target concept:** <idea_id> (<layer> · <value> · <frame> · <persona>) — status approved
**Ad set:** <slot_name> (KPI <build_spec.kpi>) — or "ad-set context unavailable"
**Grounded in:** <N> approved copy(ies) + <"no approved headline yet" | "<M> approved headline(s)"> + <"no approved description yet" | "<M> approved description(s)"> + <"no approved image_content yet" | "<M> approved image_content set(s)">

| Field | Value |
|---|---|
| hook_direction | <value> |
| core_message | <value> |
| why_now | <value> |
| story_moment | <value> |
| cta | <value> |
| theme | <value> |

**Next:** re-run `/ssc.ads-produce <idea_id> creative_brief` any time after approving more sections to refresh the brief with richer input.
```

If the `date` resolved more than one approved concept (Step 1), note which concept you worked and that the remaining concept(s) still need their own passes.

## Output

- The idea's six brief fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`, `theme`) revised via `update_idea` — direct overwrite, no draft/approve state.
- No `content` row created — `creative_brief` is not a `section` value and never appears in `list_post_content`/`save_post_content`.
- No gate flipped, idea `status` untouched.
- Summary of the written fields plus grounding context.

## Governance

- **Propose-only (hard rule):** `update_idea` revises informational fields only — never `status`. You **never** call `approve_*`, `unapprove_*`, `update_status`, or any publish/schedule tool, and you never flip a gate.
- **Gate:** requires `approved(copy)` — STOP otherwise (Step 2).
- **No draft/approve state for these fields (hard rule).** Unlike `ssc-ads-writer`'s `content` rows, there is nothing to approve here — each invocation directly overwrites with freshly-derived values. This is intentional: it is how "revise" works.
- **Does not gate `ssc-ads-image`.** That skill's precondition remains `approved(image_content)` only; `creative_brief` is a human-facing handoff artifact, not a machine gate.
- **One concept at a time.** A date with several approved concepts is handled one concept per run.
- **Never fabricate.** `story_moment` is only written when the concept is genuinely story/person-led and the scene comes from the approved copy; otherwise write the explicit "not applicable" line.
- **All persisted prose in Vietnamese.**
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires the `edit` capability (plus `view` for the `get_idea` / `get_channel_plan` / `list_post_content` reads).
```

- [ ] **Step 3: Verify the new file**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
head -1 plugins/ssc-content/skills/ssc-ads-brief/SKILL.md
grep -n "^name: ssc-ads-brief" plugins/ssc-content/skills/ssc-ads-brief/SKILL.md
grep -n "approve_\|unapprove_\|update_status\|publish" plugins/ssc-content/skills/ssc-ads-brief/SKILL.md
```

Expected: the frontmatter `name:` line matches the directory name `ssc-ads-brief` (per this repo's "directory name matches frontmatter name" convention); the `approve_/unapprove_/update_status/publish` grep only matches the Governance-section sentences stating these are **never** called (no actual tool invocation of them).

- [ ] **Step 4: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add plugins/ssc-content/skills/ssc-ads-brief/SKILL.md
git commit -m "$(cat <<'EOF'
feat(ads-brief): new skill — revise the ad idea's creative-brief fields

Sibling of ssc-ads-writer. Gated only on approved(copy), writes
hook_direction/core_message/why_now/story_moment/cta/theme onto the
idea via update_idea (same field shape ssc-post-ideate already uses
for posts). Direct overwrite each run, no content row, no draft/
approve state — running it again after more sections are approved
refreshes the brief. Never touches idea status; does not gate
ssc-ads-image.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Route `/ssc.ads-produce` between `ssc-ads-writer` and `ssc-ads-brief`

**Files:**
- Modify: `plugins/ssc-content/commands/ssc.ads-produce.md`

**Interfaces:**
- Consumes: the freed-gating language from Task 1 and the skill name `ssc-ads-brief` + `section=creative_brief` trigger from Task 2.
- Produces: nothing downstream.

- [ ] **Step 1: Read the file**

Run: `Read plugins/ssc-content/commands/ssc.ads-produce.md`.

- [ ] **Step 2: Frontmatter `description` — full replace**

Replace:

```
description: Produce ad TEXT for ONE approved ad concept — a state-driven, per-section stepper. Dispatches ssc-ads-writer, which produces the single next open section in the chain copy → headline → description → image_content (whichever is not yet approved), self-scores + saves the passing (≥4-rated) drafts straight to the server, and stops. The operator reviews/edits/approves that section at /ad/[month]/[id], then re-runs this command for the next section; headline distils the approved copies, description compresses those copies, image_content builds on those + headlines + descriptions. The final image_content step is the on-image COPY as structured text (headline hook + USP/proof subheadline + 3 USP/proof bullets) — no rendered pictures. Propose-only; saves drafts, never approves.
```

with:

```
description: Produce ad TEXT for ONE approved ad concept, or revise its creative brief — a thin router. Dispatches ssc-ads-brief when the optional section argument is 'creative_brief'; otherwise dispatches ssc-ads-writer. ssc-ads-writer produces copy first (mandatory cold start); once copy is approved, headline, description, and image_content are each independently producible — gated only on copy, not on each other, and re-invocable any time for a fresh revision — chosen via the optional section argument or auto-picked among those not yet approved. It self-scores + saves the passing (≥4-rated) drafts straight to the server, and stops. The operator reviews/edits/approves at /ad/[month]/[id], then re-runs this command for any other freed section in any order; headline distils the approved copies, description compresses those copies (complementing an approved headline when one exists), image_content builds on those copies plus headlines/descriptions when they exist. ssc-ads-brief revises the idea's own creative-brief fields (hook_direction/core_message/why_now/story_moment/cta/theme, the same shape post ideas use) any time after copy is approved, reflecting whichever sections are currently approved — no content row, no draft/approve step, direct overwrite each run. Propose-only; saves drafts or revises brief fields, never approves.
```

- [ ] **Step 3: User Input — add the `section` argument**

Replace:

```
- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`). Required. This is the key `ssc-ads-writer` reads and writes against.

Optional:

- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The writer resolves everything from the `idea_id`.
```

with:

```
- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`). Required. This is the key the dispatched skill reads and writes against.

Optional:

- **Section** (`section`) — one of `headline` | `description` | `image_content` | `creative_brief`. Names what to produce/revise this invocation. Omit to auto-pick the next open text section (`copy` first if not yet approved, else the first of `headline → description → image_content` without an approved row). `creative_brief` is **never** auto-picked — request it explicitly once ready for the handoff brief.
- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The dispatched skill resolves everything from the `idea_id`.
```

- [ ] **Step 4: "What to do" — full replace**

Replace everything from `## What to do` through the end of the "This flow renders no pictures..." paragraph (i.e. replace the whole `## What to do` section body):

```markdown
## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches the single text producer **`ssc-ads-writer`** for the resolved concept, then stops. `ssc-ads-writer` is a **state-driven, per-section stepper**: on each invocation it works the **single next open section** in the approval chain **`copy` → `headline` → `description` → `image_content`** and **saves straight to the server**.

| The writer does | Then the operator… |
|---|---|
| Reads `list_post_content(idea_id)` to find the next section not yet approved (copy → headline → description → image_content). Produces N Vietnamese variations for THAT section only — pressing Cambridge proof points (≥3 distinct woven into each copy; the image_content step's 3 bullets ARE ≥3 proof; a headline/description carries 1–2 and the section's set covers ≥3) — self-scores each 1–5 with a Vietnamese comment, drops + regenerates any ≤3, then **saves the passing (≥4-rated) drafts to the server** via `save_post_content` (`channel='ad'`, `idea_id`, `section`) and **stops**. Later sections build on the operator's **approved** copies (the source of truth, re-read live each run so UI edits are reflected): headline distils the approved copies; description compresses those copies; image_content = an on-image copy set — headline hook + USP/proof subheadline + 3 proof bullets — anchored to an approved copy, on those + headlines + descriptions. | Opens `/ad/[month]/[id]`, **reviews / edits / approves** the saved drafts for that section, then **re-runs `/ssc.ads-produce <idea_id>`** — the writer detects the newly-approved section and produces the next one. |

**This flow renders no pictures** — the final `image_content` step is the on-image COPY as structured text (headline hook + USP/proof subheadline + 3 USP/proof bullets), saved under `section='image_content'` for the dashboard to render (add an Image-content stage for it). The producer works **one section per run** and reads **no** channel_plan gates. It **saves drafts immediately** (no in-chat presentation or revise loop); all review / edit / approval happens in the dashboard. If the next section already has unapproved drafts, the writer stops and asks the operator to approve them first (it does not pile up a second batch). Re-running for a section that is already approved simply advances to the next open section; when all four sections have an approved variation, production is complete.
```

with:

```markdown
## What to do

This command is a thin entry point — it holds **no** orchestration logic beyond a plain string check on `section`. **If `section == 'creative_brief'`**, it dispatches **`ssc-ads-brief`** (`idea_id` [, `date`]) and stops. **Otherwise** it dispatches **`ssc-ads-writer`** (`idea_id` [, `date`], optional `section` passthrough) and stops.

`ssc-ads-writer` is a **state-driven stepper**: `copy` is the mandatory cold-start section (no earlier input); once `copy` has ≥1 approved row, `headline`, `description`, and `image_content` are each **independently** producible — gated only on `copy` being approved, never on each other — and each may be **re-invoked after its own approval** for a fresh revision. On each invocation it works ONE target section (named via `section`, or auto-picked among those without an approved row) and **saves straight to the server**.

| The writer does | Then the operator… |
|---|---|
| Reads `list_post_content(idea_id)`. If `copy` isn't approved yet, produces it (cold start, no earlier input). Otherwise resolves the target section (named, or auto-picked among headline/description/image_content without an approved row) and produces N Vietnamese variations for THAT section only, grounded in whichever of copy/headline/description is currently approved — pressing Cambridge proof points (≥3 distinct woven into each copy; the image_content step's 3 bullets ARE ≥3 proof; a headline/description carries 1–2 and the section's set covers ≥3) — self-scores each 1–5 with a Vietnamese comment, drops + regenerates any ≤3, then **saves the passing (≥4-rated) drafts to the server** via `save_post_content` (`channel='ad'`, `idea_id`, `section`) and **stops**. | Opens `/ad/[month]/[id]`, **reviews / edits / approves** the saved drafts for that section, then **re-runs `/ssc.ads-produce <idea_id> [section]`** — for any other freed section, or the same one again for a fresh revision. |

`ssc-ads-brief` revises the idea's own creative-brief fields (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`/`theme`) — no `content` row, no draft/approve step. It requires `copy` to be approved and directly overwrites the six fields each run with values grounded in whatever is currently approved, so re-running it after more sections get approved refreshes the brief.

**This flow renders no pictures** — the `image_content` step is the on-image COPY as structured text (headline hook + USP/proof subheadline + 3 USP/proof bullets), saved under `section='image_content'` for the dashboard to render. Each targeted section **saves drafts immediately** (no in-chat presentation or revise loop); all review / edit / approval happens in the dashboard. If the target section already has unapproved drafts, the writer stops and asks the operator to approve/reject them first (it does not pile up a second batch).
```

- [ ] **Step 5: Governance — replace the paragraph**

Replace:

```
Nothing auto-approves, auto-applies, or auto-publishes. `ssc-ads-writer` **saves DRAFT `content` rows** to the server and stops; the operator reviews / edits / approves each section on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate. Propose-only (hard rule): the producer never calls any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish — and never edits or deletes a row (the operator owns every row in the dashboard). All persisted prose (variation copy + rating comments) is **Vietnamese**. Producing requires `edit` (plus `view` for the resolve/approval reads); approving a draft later requires `approve` on the page.
```

with:

```
Nothing auto-approves, auto-applies, or auto-publishes. `ssc-ads-writer` **saves DRAFT `content` rows** to the server and stops; `ssc-ads-brief` **revises the idea's own brief fields directly** (no draft state) and stops. The operator reviews / edits / approves `content` rows on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate, and revising the idea's brief fields never touches its `status` either. Propose-only (hard rule): neither producer ever calls any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish — and `ssc-ads-writer` never edits or deletes a `content` row (the operator owns every row in the dashboard). All persisted prose (variation copy + rating comments + brief fields) is **Vietnamese**. Producing/revising requires `edit` (plus `view` for the resolve/approval reads); approving a draft later requires `approve` on the page.
```

- [ ] **Step 6: "After it runs" — replace the paragraph**

Replace:

```
After the writer saves a section's drafts, point the operator to `/ad/[month]/[id]` for the concept to **review / edit / approve** that section — then **re-run this command** for the same `idea_id` to produce the next section (copy → headline → description → image_content). When all four sections have an approved variation, production is complete. Re-invoke per concept — it works ONE approved concept at a time.
```

with:

```
After the writer saves a section's drafts, point the operator to `/ad/[month]/[id]` for the concept to **review / edit / approve** that section — then **re-run this command** for the same `idea_id`, naming any other freed section (`headline`/`description`/`image_content`, any order) or the same section again for a fresh revision. Run `/ssc.ads-produce <idea_id> creative_brief` any time after `copy` is approved to (re)generate the handoff brief. Re-invoke per concept — it works ONE approved concept at a time.
```

- [ ] **Step 7: Verify**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n "the single next open section in the chain copy\|copy builds on the approved headlines" plugins/ssc-content/commands/ssc.ads-produce.md
```

Expected: **no output**. Then:

```bash
grep -c "ssc-ads-brief" plugins/ssc-content/commands/ssc.ads-produce.md
grep -c "creative_brief" plugins/ssc-content/commands/ssc.ads-produce.md
```

Expected: both **≥3**.

- [ ] **Step 8: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add plugins/ssc-content/commands/ssc.ads-produce.md
git commit -m "$(cat <<'EOF'
docs(ads): route /ssc.ads-produce between ssc-ads-writer and ssc-ads-brief

Plain string check on the optional section argument: 'creative_brief'
dispatches ssc-ads-brief, anything else dispatches ssc-ads-writer.
Documents the freed gating (copy mandatory; headline/description/
image_content independent, re-invocable) and the new section argument.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Accuracy ripples — repo CLAUDE.md + ads-image command

Two accuracy-only edits. `ssc-ads-image`'s actual gate (`approved(image_content)`) is unaffected by this change, but its command doc's "text chain … is complete" framing is no longer accurate now that `image_content` can be approved while headline/description are still unapproved.

**Files:**
- Modify: `CLAUDE.md` (repo root) — line 61
- Modify: `plugins/ssc-content/commands/ssc.ads-image.md` — line 24

**Interfaces:**
- Consumes: the skill names from Tasks 1–2.
- Produces: nothing downstream.

- [ ] **Step 1: Fix the repo-root `CLAUDE.md` pipeline table row (line 61)**

Replace:

```
| Ads (produce) | `/ssc.ads-produce` | *(direct)* | ads-writer — text only, state-driven per-section stepper (copy → headline → description) |
```

with:

```
| Ads (produce) | `/ssc.ads-produce` | *(direct → ads-writer or ads-brief)* | ads-writer — text only, per-section stepper (copy mandatory; headline/description/image_content freed, each gated only on copy); ads-brief — revises the idea's creative-brief fields any time after copy is approved |
```

- [ ] **Step 2: Fix the `/ssc.ads-image` command's "text chain … is complete" framing (line 24)**

Replace:

```
This command is the **visual-production half** of the Ads pipeline. It runs **after** the concept's text chain (`copy → headline → description → image_content`) is complete — specifically, it produces visuals only once the concept's **`image_content` text section is approved** in the dashboard (`/ssc.ads-produce` produces that text; the operator approves it). It operates **per concept** and **per layer**, never on a whole plan: it reads **no** `channel_plan` gate flags (`tactics_approved`/`approaches_approved`/Blueprint state). There is no `/ssc.ads-plan` precondition beyond an approved concept with approved `image_content`.
```

with:

```
This command is the **visual-production half** of the Ads pipeline. It runs once the concept's **`image_content` text section is approved** in the dashboard (`/ssc.ads-produce` produces that text; the operator approves it) — `image_content` only requires the concept's `copy` to be approved (not the full text set), so this can run before headline/description are approved. It operates **per concept** and **per layer**, never on a whole plan: it reads **no** `channel_plan` gate flags (`tactics_approved`/`approaches_approved`/Blueprint state). There is no `/ssc.ads-plan` precondition beyond an approved concept with approved `image_content`.
```

- [ ] **Step 3: Verify**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n "text chain (\`copy → headline → description → image_content\`) is complete" CLAUDE.md plugins/ssc-content/commands/ssc.ads-image.md
```

Expected: **no output**.

- [ ] **Step 4: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add CLAUDE.md plugins/ssc-content/commands/ssc.ads-image.md
git commit -m "$(cat <<'EOF'
docs(ads): fix stale "text chain complete" framing after freed gating

image_content only requires copy approved now, so /ssc.ads-image can
run before headline/description are approved — update the pipeline
table row and the ads-image command's precondition wording.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Repo-wide verification sweep + governance-hook smoke test + version bump

Final gate: confirm no stale strict-chain framing survives anywhere (outside design/plan docs), the new files are coherent together, the governance hook is still green, and the plugin version is bumped per this repo's convention.

**Files:**
- Modify: `plugins/ssc-content/.claude-plugin/plugin.json` — version bump.
- No other files modified (verification only).

**Interfaces:**
- Consumes: all edits from Tasks 1–4.
- Produces: nothing.

- [ ] **Step 1: Sweep for stale strict-chain framing across the whole plugin (excluding design/plan docs)**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -rn "each gated on the previous being approved\|the strict chain \*\*\`copy\`\|text chain (\`copy → headline → description → image_content\`) is complete" plugins/ CLAUDE.md | grep -v "docs/superpowers"
```

Expected: **no output**. (Design/plan docs under `docs/superpowers/` legitimately quote the old strict-chain framing when describing the change; they are excluded.)

- [ ] **Step 2: Confirm `creative_brief` never appears as a `content.section` value**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n "section: *'creative_brief'\|section='creative_brief'\|section=\"creative_brief\"" plugins/ssc-content/skills/*/SKILL.md
```

Expected: **no output** — `creative_brief` is only ever a `section` **argument** to `/ssc.ads-produce` / `ssc-ads-brief`'s dispatch check, never a `content.section` value passed to `save_post_content`.

- [ ] **Step 3: Confirm the four `content.section` values are still exactly the original four**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n "section \`headline\` | \`copy\` | \`description\` | \`image_content\`\|section = \`headline\`|\`copy\`|\`description\`|\`image_content\`\|'headline' | 'copy' | 'description' | 'image_content'" plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
```

Expected: the producer↔page contract sentence is intact and still lists exactly those four values (this sentence was not part of Task 1's edits, so it should be untouched — confirm it wasn't accidentally altered).

- [ ] **Step 4: Confirm `ssc-ads-brief` never calls an approval/lifecycle tool**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n "^Call: " plugins/ssc-content/skills/ssc-ads-brief/SKILL.md
```

Expected: only `get_idea`, `get_channel_plan`, `list_post_content`, and `update_idea` appear as `Call:` targets — no `approve_*`/`unapprove_*`/`update_status`/publish tool.

- [ ] **Step 5: Governance hook smoke test — must still be green (unchanged code)**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
echo '{"tool_name":"mcp__ssc__approve_idea","agent_id":"ssc-post-agent"}' | node plugins/ssc-content/hooks/approval-gate.mjs
echo '{"tool_name":"mcp__ssc__approve_idea"}' | node plugins/ssc-content/hooks/approval-gate.mjs
```

Expected: the first emits a **deny** decision (subagent), the second an **ask** decision (main conversation) — exactly as before (the hook was not touched).

- [ ] **Step 6: Bump the plugin version**

Run: `Read plugins/ssc-content/.claude-plugin/plugin.json`. Replace:

```
  "version": "1.2.3",
```

with:

```
  "version": "1.2.4",
```

- [ ] **Step 7: Commit the version bump**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add plugins/ssc-content/.claude-plugin/plugin.json
git commit -m "$(cat <<'EOF'
chore(version): bump plugin to 1.2.4 (freed ad-produce sections + creative brief)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 8: Final internal-consistency read**

Re-read `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` Steps 2, 4, 7, and 9, and `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` in full. Confirm they agree: `copy` has no earlier input and is mandatory; `headline`/`description`/`image_content` are gated only on `copy` and independent of each other; `ssc-ads-brief` requires only `approved(copy)` and never writes a `content` row. No commit needed if all prior tasks committed cleanly; if the read surfaces a missed stale string, fix it and commit with `docs(ads): fix stale chain string`.

---

## Self-Review

**1. Spec coverage** — every design section maps to a task:
- New chain shape (copy mandatory; three freed) → Task 1 Steps 2–11.
- `/ssc.ads-produce` routing → Task 3.
- `ssc-ads-writer` Step 2/4/7/9/Governance rewrites → Task 1 Steps 6–11.
- New skill `ssc-ads-brief` (resolution, gate, field derivation, `update_idea` call, output, governance) → Task 2.
- Doc touch-ups (CLAUDE.md, ads-image wording) → Task 4.
- "Explicitly NOT changing" contracts (four section values, dashboard, ssc-ads-image gate, plan pipeline) → Global Constraints + Task 5 Steps 2–4.
- Testing/verification section of the design → Task 1 Steps 12–13, Task 5.
- Version bump (repo convention) → Task 5 Steps 6–7.

**2. Placeholder scan** — no TBD/TODO; every edit shows exact find/replace text; the new `ssc-ads-brief/SKILL.md` is written out in full (not "similar to ssc-ads-writer").

**3. Type/string consistency** — the skill name `ssc-ads-brief` and the trigger keyword `creative_brief` are introduced in Task 2 and reused verbatim in Tasks 3–5; the six brief field names (`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`/`theme`) are consistent between Task 2's SKILL.md and its own `update_idea` call; the gate predicate `approved(copy)` is used identically across Tasks 1 and 2.

**4. Known assumption flagged for the implementer:** `update_idea`'s exact tool/field names are assumed per the design doc's stated confirmation but not independently verified against the live BrandOS MCP surface in this planning session — if the live tool differs, fix Task 2 Step 2's `Call: update_idea` block and its field names before treating Task 2 as done.
