# Ads-Produce Copy-First Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reverse the ad-TEXT production chain from `headline → copy → description → image_content` to `copy → headline → description → image_content`, so the headline (and description and image_content) distil from the operator-approved copies, which become the single source of truth.

**Architecture:** This repo is a Claude Code marketplace plugin made of **prose** (markdown skills/commands) — there is no compiled code and no test runner. "Implementation" = editing markdown so the state-driven stepper `ssc-ads-writer` produces sections in the new order and every downstream section leads from the live approved copies. Verification is a `grep`-based consistency sweep plus the one governance-hook smoke test. The only real code (the PreToolUse hook) is **not touched** and must stay green.

**Tech Stack:** Markdown (skills/commands/docs). Node 20 for the governance hook smoke test only. `git` for commits. `grep`/`rg` for verification.

## Global Constraints

Copied verbatim from the design spec (`docs/superpowers/specs/2026-07-05-ads-produce-copy-first-reorder-design.md`) — every task's requirements implicitly include these:

- **The four `section` values are unchanged** — still exactly `headline | copy | description | image_content`. Only the production *order* changes. Never introduce a new section value; never resurrect the retired `image` value.
- **New chain (strict, one section per invocation):** `copy → headline → description → image_content`. copy has no precondition; headline needs ≥1 approved copy; description needs approved copy + headline; image_content needs all three.
- **Copy is the source of truth.** headline, description, and image_content all lead from the **live** approved copies (re-read every run so operator UI edits to copies are always reflected). headline = free distillation across all approved copies (not 1:1). description = compress an approved copy's promise (headline is a secondary reference, not the anchor). image_content = anchor each version to one approved copy (unchanged behavior).
- **Preserve every invariant unchanged:** the ≥3-proof-density rules (each `copy` and each `image_content` version carries ≥3 distinct proof points; each `headline`/`description` carries 1–2 with the section's set covering ≥3), the Step 7 quality gate + honest 1–5 scoring + replacement loop, banned-words / compliance / food-placeholder / authenticity rails, save-to-server-not-present-in-chat, and all propose-only rules (never `approve_*`/`unapprove_*`/`update_status`/publish; never edit or delete a row).
- **All persisted prose stays Vietnamese** (saved `body` + `comment`). Chat/system text may be English.
- **Do not touch:** `save_post_content` contract, the `/ad/[id]` dashboard, `plugin.json`, `.mcp.json`, `marketplace.json`, the planning pipeline (Focus → Approaches → Blueprint → Ideate), and `hooks/approval-gate.mjs`.

---

## File Structure

Files modified (no files created except this plan's outputs):

- `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` — **the core.** The stepper logic: frontmatter description, body intro, Step 2 (gate table), Step 4 (input reload), Step 5 (Hook Bank framing), Step 6 (per-section drafting), Step 9 (summary + next-actions), Output, Governance.
- `plugins/ssc-content/commands/ssc.ads-produce.md` — thin entry point; chain strings only (accuracy).
- `CLAUDE.md` (repo root) — pipeline table row 61 (accuracy).
- `plugins/ssc-content/commands/ssc.ads-image.md` — line 24 parenthetical text-chain string (accuracy; the visual flow still gates on `image_content` approved, which stays last).

**Note:** `plugins/ssc-content/skills/ssc-ads-image/SKILL.md` does **not** contain the text-chain string (it references only `image_content` approval as its precondition) — do **not** edit it.

---

## Task 1: Rewrite `ssc-ads-writer/SKILL.md` to copy-first

This is the substantive task. Three logic changes (Step 6 `copy`, `headline`, `description` instructions + the Step 4 reload rewrite); everything else is reordering the chain string and dependency prose. Apply every edit below, then run the verification grep, then commit.

**Files:**
- Modify: `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: the canonical copy-first chain string `copy → headline → description → image_content` and the gate/reload/next-action prose that Tasks 2–4 mirror. Later tasks must use this exact chain string.

- [ ] **Step 1: Read the file**

Run: `Read plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` (full). You need the exact current text to make each Edit below match.

- [ ] **Step 2: Frontmatter description — reorder the chain + dependency phrases**

In the `description:` line (line ~3), make these two replacements:

- Replace `the approval chain headline → copy → description → image_content` with `the approval chain copy → headline → description → image_content`.
- Replace `copy builds on the approved headlines, description on those + copies, image_content on those + descriptions` with `headline distils the approved copies, description compresses those copies, image_content builds on those + headlines + descriptions`.

- [ ] **Step 3: Body intro — chain string (line ~15)**

In the intro paragraph, the chain appears as the code-fenced tokens `headline` → `copy` → `description` → `image_content` (each word in backticks). Swap the first two tokens so it reads `copy` → `headline` → `description` → `image_content` (backticks preserved on each word).

- [ ] **Step 4: Body intro — "Later sections read..." dependency sentence (line ~19)**

Find:

> **Later sections read the APPROVED earlier-section bodies as their input** — `copy` builds on the approved headline(s); `description` on the approved headline(s) + copy(ies); `image_content` on the approved headline(s) + copy(ies) + description(s) — so the winning hooks the operator approved carry forward.

Replace with:

> **Later sections read the LIVE APPROVED copy bodies as their input** — `headline` distils the approved copy(ies); `description` compresses the approved copy(ies) (with the approved headline as a secondary reference); `image_content` builds on the approved copy(ies) + headline(s) + description(s) — so the winning copy the operator approved (and any dashboard edits to it) carries forward.

- [ ] **Step 5: Step 2 — retitle intro + rewrite the gate table (lines ~107–135)**

Replace the sentence:

> The sections are produced one per invocation, in the strict chain **`headline` → `copy` → `description` → `image_content`**, each gated on the previous being approved.

with:

> The sections are produced one per invocation, in the strict chain **`copy` → `headline` → `description` → `image_content`**, each gated on the previous being approved.

Then replace the entire gate table (the block of 9 `| Condition | Action |` rows) with:

```markdown
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
```

Then replace the trailing "strict" sentence:

> The chain is strict: never produce `copy` before a headline is approved, `description` before a copy is approved, or `image_content` before a description is approved.

with:

> The chain is strict: never produce `headline` before a copy is approved, `description` before a headline is approved, or `image_content` before a description is approved.

- [ ] **Step 6: Step 4 — replace the whole step with the copy-led + live-reload version (lines ~188–196)**

Replace the entire Step 4 block (from the `### Step 4:` heading through the paragraph ending "...ground it in the concept brief + build_spec + KB only.") with:

```markdown
### Step 4: Reload the LIVE approved copies (the source of truth) + earlier-section input

The **copy is the source of truth** for the concept — the headline, description, and image_content sections all lead from the approved copies. Because the operator may **edit an approved copy in the dashboard at any time** (even after the headline was approved), you MUST ground every downstream section in the **current** approved copy bodies. You already re-read `list_post_content(idea_id)` this run (Step 2), so read the live approved rows from that result — **never** a cached or prior-run body.

If the active section (from Step 2) is **`headline`**, **`description`**, or **`image_content`**, gather the live approved bodies from the Step 2 `list_post_content` result (you already have it):

- for **`headline`** — every `section='copy'` row with `status='approved'`: hold their live `body` values (the approved copies). The headline distils a short standalone on-creative hook from the **pooled** approved copy hooks — **free distillation across all approved copies** (not a 1:1 one-headline-per-copy mapping): pick the sharpest opening lines across the whole approved-copy pool.
- for **`description`** — every approved `copy` body (the **primary** input) AND every approved `headline` body (a **secondary** hook reference). The description **compresses an approved copy's promise** into one tight benefit/CTA line; the headline is only a reference, not the anchor.
- for **`image_content`** — every approved `copy`, `headline`, AND `description` body: **anchor each version to one approved `copy`** and distil **that copy's HOOK (its opening / sharpest line) into the on-image HEADLINE** — leverage the winning copy's proven hook, not merely a restated standalone `headline` (an approved `headline` may sharpen the wording, but the copy's hook drives it); the anchor copy's — and the descriptions' — strongest proof lines feed the **SUBHEADLINE** + the **3 BULLETS**.

These live approved bodies are your **input** — the winning copies the operator selected (and possibly edited; you read the live approved rows, so any dashboard edits are always reflected). Your variations for the active section must **build on them**: a `headline` distils an approved copy's hook; a `description` compresses an approved copy's promise; an `image_content` version leverages an approved **copy** — that copy's hook distilled into the on-image HEADLINE up top, a key proof from it as the subheadline, and 3 distinct proof points as the bullets. If the active section is **`copy`**, there is **no** earlier-section input — ground it in the concept brief + `build_spec` + KB + the Hook Formula Bank only (the copy owns the hook).
```

- [ ] **Step 7: Step 5 — reframe the Hook Bank to drive the copy's hook first (line ~200)**

Find:

> Apply the brand's headline craft (sourced from `ad/headline-formulas` + `ad/creative-guidelines` — read the live numbers/patterns there; the guidance below is the operating frame) to write the `headline` section and the opening hook of each `copy`.

Replace with:

> Apply the brand's headline craft (sourced from `ad/headline-formulas` + `ad/creative-guidelines` — read the live numbers/patterns there; the guidance below is the operating frame) to write the **opening hook of each `copy`** (the copy is the first section — this is where the hook is born) and, at the headline step, the short standalone `headline` **distilled from an approved copy's hook**.

- [ ] **Step 8: Step 6 — reorder the per-section bullets to copy-first and rewrite `copy`/`headline`/`description` (lines ~223–237)**

The Step 6 intro reads `Produce **only the active section's** variations (from Step 2), not all three:`. Below it are four `- if active = ...` bullets currently ordered headline, copy, description, image_content. Reorder them to **copy, headline, description, image_content** and replace the `copy`, `headline`, and `description` bullets with the versions below (leave the `image_content` bullet's body text exactly as-is, just ensure it comes last):

Replace the current "if active = headline" bullet and the current "if active = copy" bullet so that copy comes first, and the two read exactly:

```markdown
- if active = **`copy`** — `n_copies` variations (default **5**). Each the **primary text / body**: **a hook line that owns the concept's hook — grounded in the concept brief + `build_spec` + the Hook Formula Bank (Step 5), with NO earlier-section input** → the concept's benefit expressed through its `value`+`frame` → a **soft, compliant CTA from `ad/cta-catalog`**. Vary the angle/structure across the set (e.g. the emotional cost, the practical "how", the reframe-against-a-misconception).
- if active = **`headline`** — `n_headlines` variations (default **5**). Each a SHORT on-creative hook (per the length discipline) **distilled from the pooled LIVE approved copies' hooks (Step 4)** — take the sharpest opening lines across all approved copies and compress each to headline length (free distillation, not 1:1); an approved copy may be sharpened in wording, but don't merely restate a full copy line. Use a *different* hook quality/pattern from the Bank across the set; no two headlines may be paraphrases of one opening.
```

Then ensure the `description` bullet reads (compress-an-approved-copy wording is already close; confirm it says "compresses an APPROVED copy's promise"):

```markdown
- if active = **`description`** — `n_descriptions` variations (default **5**). Each a tight **link-description** line (one benefit + a soft CTA) that **compresses an APPROVED copy's promise** (from Step 4), distinct from the others.
```

Leave the `image_content` bullet unchanged (it is already copy-anchored) but confirm it is the **last** of the four bullets.

- [ ] **Step 9: Step 9 — reorder the "Built on approved input" line + the four next-action lines (lines ~343, ~357–360)**

Replace the summary field line:

> **Built on approved input:** <"— (headline is the first step)" | "<N> approved headline(s)" | "<N> approved headline(s) + <M> approved copy(ies)" | "approved headline(s) + copy(ies) + description(s)">

with:

> **Built on approved input:** <"— (copy is the first step)" | "<N> approved copy(ies)" | "<N> approved copy(ies) + <M> approved headline(s)" | "approved copy(ies) + headline(s) + description(s)">

Then replace the four `End with the correct NEXT action` bullets:

```markdown
  - after **copy**: `Next: open /ad/<month>/<idea_id> → review/edit/approve ≥1 copy, then re-run /ssc.ads-produce <idea_id> to produce the headlines.`
  - after **headline**: `Next: approve ≥1 headline in /ad/<month>/<idea_id>, then re-run /ssc.ads-produce <idea_id> to produce the descriptions.`
  - after **description**: `Next: approve ≥1 description in /ad/<month>/<idea_id>, then re-run /ssc.ads-produce <idea_id> to produce the image content.`
  - after **image_content**: `Next: approve ≥1 image-content set in /ad/<month>/<idea_id>. That completes all four sections for this concept.`
```

- [ ] **Step 10: Output section — reorder the dependency sentence (line ~365)**

Find:

> **One section per invocation.** The operator approves in the dashboard and re-invokes for the next section; `copy` builds on the approved headline(s), `description` on the approved headline(s) + copy(ies), `image_content` on the approved headline(s) + copy(ies) + description(s).

Replace with:

> **One section per invocation.** The operator approves in the dashboard and re-invokes for the next section; `headline` distils the approved copy(ies), `description` compresses the approved copy(ies) (with the headline as a secondary reference), `image_content` on the approved copy(ies) + headline(s) + description(s).

- [ ] **Step 11: Governance — reorder the "Approved input carries forward" bullet (line ~375)**

Find:

> - **Approved input carries forward.** `copy` variations are grounded in the APPROVED `headline` bodies; `description` variations in the APPROVED `headline` + `copy` bodies; `image_content` versions in the APPROVED `headline` + `copy` + `description` bodies (read from `list_post_content`, so operator edits are reflected).

Replace with:

> - **Approved input carries forward (copy is the source of truth).** `headline` variations distil the LIVE APPROVED `copy` bodies (free distillation across all approved copies); `description` variations compress a LIVE APPROVED `copy` promise (with the approved `headline` as a secondary reference); `image_content` versions anchor to a LIVE APPROVED `copy` and read the approved `headline` + `description` too — all re-read from `list_post_content` each run, so operator edits to copies are always reflected.

- [ ] **Step 12: Verify the reorder — grep for stale old-order strings**

Run:

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n "headline → copy\|builds on an APPROVED headline\|builds on the approved headline\|approved headline(s) + copy\|headline is the first step\|to produce the copies" plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
```

Expected: **no output** (all old-order strings gone). Then confirm the new chain string is present:

```bash
grep -c "copy → headline → description → image_content\|copy` → `headline` → `description` → `image_content`\|copy` → `headline`" plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
```

Expected: **≥1**.

- [ ] **Step 13: Verify invariants are intact — grep the untouched rules still exist**

Run:

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -c "≥3 distinct\|propose-only\|never call\|Vietnamese\|save_post_content" plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
```

Expected: a count clearly **> 5** (the proof-density, propose-only, Vietnamese, and save invariants are all still present — the reorder must not have deleted them).

- [ ] **Step 14: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
git commit -m "feat(ads-writer): reverse chain to copy-first; copy is source of truth

copy → headline → description → image_content. headline/description/
image_content distil from the LIVE approved copies (re-read each run so
operator UI edits are reflected). headline = free distillation across
all approved copies; description compresses an approved copy (headline
secondary). Invariants (≥3 proof, quality gate, propose-only, VN) intact.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Update `/ssc.ads-produce` command chain strings

Accuracy-only: the thin entry point mirrors the chain and dependency prose in four spots.

**Files:**
- Modify: `plugins/ssc-content/commands/ssc.ads-produce.md`

**Interfaces:**
- Consumes: the copy-first chain string from Task 1.
- Produces: nothing downstream.

- [ ] **Step 1: Read the file**

Run: `Read plugins/ssc-content/commands/ssc.ads-produce.md`.

- [ ] **Step 2: Frontmatter `description` — reorder chain + dependency phrases**

In the `description:` line, replace:
- `the single next open section in the chain headline → copy → description → image_content` → `the single next open section in the chain copy → headline → description → image_content`.
- `copy builds on the approved headlines, description on those + copies, image_content on those + descriptions` → `headline distils the approved copies, description compresses those copies, image_content builds on those + headlines + descriptions`.

- [ ] **Step 3: §28 — the "state-driven, per-section stepper" sentence**

In this sentence the chain appears as bold code-fenced tokens `headline` → `copy` → `description` → `image_content`. Swap the first two so it reads `copy` → `headline` → `description` → `image_content` (backticks and bold preserved).

- [ ] **Step 4: §32 — the table cell "The writer does" column**

Find the sentence that begins "Reads `list_post_content(idea_id)` to find the next section not yet approved (headline → copy → description → image_content)." and replace only the parenthetical with "(copy → headline → description → image_content)".

Then find `Later sections build on the operator's **approved** earlier sections (copy on approved headlines; description on those + copies; image_content = an on-image copy set — headline hook + USP/proof subheadline + 3 proof bullets — on those + descriptions).` and replace with `Later sections build on the operator's **approved** copies (the source of truth, re-read live each run so UI edits are reflected): headline distils the approved copies; description compresses those copies; image_content = an on-image copy set — headline hook + USP/proof subheadline + 3 proof bullets — anchored to an approved copy, on those + headlines + descriptions.`

- [ ] **Step 5: §42 — the "After it runs" sentence**

Replace the parenthetical `to produce the next section (headline → copy → description → image_content)` with `to produce the next section (copy → headline → description → image_content)`.

- [ ] **Step 6: Verify**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -n "headline → copy\|copy on approved headlines\|copy builds on the approved headlines" plugins/ssc-content/commands/ssc.ads-produce.md
```

Expected: **no output**. Then:

```bash
grep -c "copy → headline → description → image_content" plugins/ssc-content/commands/ssc.ads-produce.md
```

Expected: **≥3**.

- [ ] **Step 7: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add plugins/ssc-content/commands/ssc.ads-produce.md
git commit -m "docs(ads): copy-first chain strings in /ssc.ads-produce command

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Accuracy ripples — repo CLAUDE.md + ads-image command

Two one-line accuracy edits in different files. The visual pipeline still gates on `image_content` approved (last in both orderings), so `/ssc.ads-image` behavior is unaffected — this is a string fix only.

**Files:**
- Modify: `CLAUDE.md` (repo root) — line 61
- Modify: `plugins/ssc-content/commands/ssc.ads-image.md` — line 24

**Interfaces:**
- Consumes: the copy-first chain string from Task 1.
- Produces: nothing downstream.

- [ ] **Step 1: Fix the repo-root `CLAUDE.md` pipeline table row (line 61)**

In `CLAUDE.md`, replace:

```
| Ads (produce) | `/ssc.ads-produce` | *(direct)* | ads-writer — text only, state-driven per-section stepper (headline → copy → description) |
```

with:

```
| Ads (produce) | `/ssc.ads-produce` | *(direct)* | ads-writer — text only, state-driven per-section stepper (copy → headline → description) |
```

- [ ] **Step 2: Fix the `/ssc.ads-image` command text-chain parenthetical (line 24)**

In `plugins/ssc-content/commands/ssc.ads-image.md` line 24, the code-fenced chain reads `headline → copy → description → image_content`. Change it to `copy → headline → description → image_content` (the surrounding sentence — "It runs after the concept's text chain (...) is complete" — is unchanged).

- [ ] **Step 3: Verify**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -rn "headline → copy" CLAUDE.md plugins/ssc-content/commands/ssc.ads-image.md
```

Expected: **no output**.

- [ ] **Step 4: Commit**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
git add CLAUDE.md plugins/ssc-content/commands/ssc.ads-image.md
git commit -m "docs(ads): copy-first chain strings in CLAUDE.md + ads-image command

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Repo-wide verification sweep + governance-hook smoke test

Final gate: confirm no stale old-order string survives anywhere (outside the design/plan docs, which describe the change), the new chain is coherent, and the governance hook is still green.

**Files:**
- None modified (verification only).

**Interfaces:**
- Consumes: all edits from Tasks 1–3.
- Produces: nothing.

- [ ] **Step 1: Sweep for the old order across the whole plugin (excluding design/plan docs)**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -rn "headline → copy\|builds on an APPROVED headline\|copy builds on the approved headline\|copy on approved headlines" plugins/ CLAUDE.md | grep -v "docs/superpowers"
```

Expected: **no output**. (Design/plan docs under `docs/superpowers/` legitimately quote the old order when describing the change; they are excluded.)

- [ ] **Step 2: Confirm the new chain string is coherent across the shipped files**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -rln "copy → headline → description → image_content\|copy` → `headline`" plugins/ CLAUDE.md
```

Expected: lists at least `ssc-ads-writer/SKILL.md`, `commands/ssc.ads-produce.md`, `CLAUDE.md`, and `commands/ssc.ads-image.md`.

- [ ] **Step 3: Confirm the four section values are unchanged (no new/renamed section)**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
grep -c "'headline' | 'copy' | 'description' | 'image_content'\|headline\` | \`copy\` | \`description\` | \`image_content\|headline|copy|description|image_content" plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
```

Expected: **≥1** (the section-value set is intact). Also confirm no stray new value:

```bash
grep -n "section='image'\|section = 'image'" plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
```

Expected: only the existing "retired `image`" references (legacy-ignore lines), never a new production value.

- [ ] **Step 4: Governance hook smoke test — must still be green (unchanged code)**

```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
echo '{"tool_name":"mcp__ssc__approve_idea","agent_id":"ssc-post-agent"}' | node plugins/ssc-content/hooks/approval-gate.mjs
echo '{"tool_name":"mcp__ssc__approve_idea"}' | node plugins/ssc-content/hooks/approval-gate.mjs
```

Expected: the first emits a **deny** decision (subagent), the second an **ask** decision (main conversation) — exactly as before (the hook was not touched).

- [ ] **Step 5: Final internal-consistency read**

Re-read `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` Steps 2, 4, 6, and 9 and confirm they all agree on the order `copy → headline → description → image_content`, that copy has no earlier input, and that headline/description/image_content each read the live approved copies. No commit needed if all prior tasks committed cleanly; if the read surfaces a missed stale string, fix it and commit with `docs(ads): fix stale chain string`.

---

## Self-Review

**1. Spec coverage** — every spec section maps to a task:
- New chain + gate table → Task 1 Steps 3, 5.
- Copy-led + live-reload (headline/description/image_content) → Task 1 Steps 6, 8, 10, 11.
- Headline free-distillation decision → Task 1 Steps 6, 8.
- Two→three substantive Step-6 changes → Task 1 Steps 7, 8.
- Edit surface B (command) → Task 2.
- Edit surface C (CLAUDE.md) → Task 3 Step 1.
- Edit surface D (ads-image) → Task 3 Step 2 (SKILL.md correctly excluded — it has no chain string).
- "NOT changing" contracts → Global Constraints + Task 4 Steps 3–4.
- Testing/verification section → Task 1 Steps 12–13, Task 4.

**2. Placeholder scan** — no TBD/TODO; every edit shows exact find/replace text and every verification shows the exact command + expected output.

**3. Type/string consistency** — the canonical chain string `copy → headline → description → image_content` is defined in Task 1 and reused verbatim in Tasks 2–4; the gate-table predicate names (`approved(copy)` etc.) and the four section values are consistent across tasks.
