# Stepped, approval-gated, text-only ad production — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/ssc.ads-produce` into a text-only, state-driven per-section stepper: `ssc-ads-writer` produces the single next unapproved section (headline → copy → description), saves drafts straight to the server, and stops; the operator approves in the dashboard and re-runs for the next section; images are removed.

**Architecture:** Prose-only edits to a Claude Code plugin (markdown skills/commands + one doc). Task 1 rewrites `skills/ssc-ads-writer/SKILL.md` in full. Task 2 rewrites `commands/ssc.ads-produce.md` to text-only single-dispatch, deletes `skills/ssc-ads-creative/`, and updates `CLAUDE.md` — landing together so no dangling `ads-creative` reference survives.

**Tech Stack:** Markdown skill/command definitions over the BrandOS MCP surface. No test runner exists in this repo — verification is `grep` / filesystem / `git` assertions.

## Global Constraints

Copied from the spec ([docs/superpowers/specs/2026-07-03-ads-produce-stepped-approval-text-only-design.md](../specs/2026-07-03-ads-produce-stepped-approval-text-only-design.md)). Every task implicitly includes these:

- **Propose-only (hard rule).** Neither file may call or list `approve_*`, `unapprove_*`, `update_status`, `update_budget`, or any publish tool. The writer saves `status='draft'` rows and READS approval status; it never approves.
- **Tool surface (writer `tools:` frontmatter) — exact value:** `tools: [get_knowledge, get_idea, get_channel_plan, list_post_content, save_post_content]`. `list_post_content` is ADDED; `edit_content` and `delete_content` are REMOVED. Every tool listed exists on the BrandOS surface.
- **Text only.** No image production anywhere in this flow: no `section='image'`, no `upload_creative`, no `check_compliance`, no Playwright/screenshot, no `ssc-ads-creative`.
- **Section chain is strict:** `headline → copy → description`. A section is produced only when every earlier section has ≥1 row at `status='approved'`. If the next section already has `status='draft'` rows but none approved, STOP (no second batch).
- **Save-to-server, not present-in-chat.** After scoring, the writer saves the active section's ≥4 drafts immediately via `save_post_content` and stops — no in-chat candidate presentation, pause, or revise loop.
- **Keep the quality loop:** self-score 1–5 + one-line Vietnamese `comment`; drop + regenerate any ≤3 (bound 2 attempts/slot); save only ≥4.
- **USP/proof foregrounding — ≥3, sized to format:** Step 3 loads `brand/positioning` + `brand/proof-points`. Each **`copy`** variation weaves in **≥3 distinct** proof points; each **`headline`/`description`** carries the 1–2 that fit cleanly and the section's **variation set collectively surfaces ≥3 distinct**; every variation lands the concept's `against` match-up when present. The Direct-Response "Presses ≥3 real advantages (sized to format)" line + a headline/description **set-coverage check** enforce it (a `copy`, or a short-section set, under the minimum cannot score ≥4).
- **Posts in scope (Task 3):** `ssc-post-produce` + `ssc-post-authority` get the same ≥3-per-post rule (posts are long, so ≥3 applies per variation).
- **Compliance language preserved:** no fabricated number; **26** vi chất (never 25); spell out "nghiên cứu lâm sàng độc lập" — never the "RCT" acronym; no commercial drug-brand name; no income/MLM claim. Persisted prose is valid Vietnamese with correct diacritics.
- **Concurrent working tree:** the operator has STAGED `CLAUDE.md`, `README.md`, `plugin.json`, `.mcp.json`, and a harness spec, and committed `09aad90 "add reference"`. Every commit in this plan is **path-scoped** (`git commit -- <paths>`) so those staged files are never swept in. `CLAUDE.md` is edited in Task 2 and is one of the operator's staged files — its Task 2 commit layers the edits on top of the operator's staged content (surface at review).
- **Skill directory name = frontmatter `name`.** `ssc-ads-writer` unchanged.

## File structure

| File | Responsibility after this plan |
|---|---|
| `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` | The one text producer — state-driven per-section stepper, save-to-server, approved-input chaining, quality loop, USP foregrounding |
| `plugins/ssc-content/commands/ssc.ads-produce.md` | Thin entry point — dispatches only `ssc-ads-writer`; text-only; describes the stepped/dashboard-approval loop |
| `plugins/ssc-content/skills/ssc-ads-creative/` | DELETED |
| `CLAUDE.md` | Skill count 34→33; pipeline table row (text-only stepper); direct-dispatch mention drops `ssc-ads-creative` |

---

### Task 1: Rewrite `ssc-ads-writer` as the state-driven, save-to-server section stepper

**Files:**
- Rewrite (full file): `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md`

**Interfaces:**
- Consumes: MCP reads `get_idea`, `get_channel_plan`, `get_knowledge`, `list_post_content`; MCP write `save_post_content(channel, idea_id, section, body, score, comment)`. `list_post_content(idea_id)` returns `variations[]` each with `section` (headline|copy|description|image), `status` (draft|approved), `score`, `comment`, `body`.
- Produces: nothing another task imports. Task 2 references this skill by name only.

- [ ] **Step 1: Baseline — confirm the OLD flow is present (the "failing test")**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
F=plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
echo "old-flow markers (expect >0 each): present-in-chat=$(grep -c 'Present the candidate set in chat' $F) edit/delete=$(grep -c 'edit_content\|delete_content' $F) ads-creative=$(grep -c 'ads-creative' $F)"
echo "list_post_content (expect 0): $(grep -c 'list_post_content' $F)"
```
Expected: the old-flow markers are all >0; `list_post_content` is 0. Then `Read` the file once before overwriting.

- [ ] **Step 2: Overwrite `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` with the new content**

Use the Write tool to replace the entire file with EXACTLY this content (it preserves the KB list, Hook Formula Bank, Differentiation & proof block, Authenticity guardrail, and quality loop verbatim from the current file; it changes the flow to state-driven per-section + save-to-server + approved-input chaining, and the `tools:` line):

````markdown
---
name: ssc-ads-writer
description: The TEXT producer of the standalone Cambridge Diet Vietnam ad-production workflow — a STATE-DRIVEN, per-section stepper. Resolves ONE approved ad concept (an ideas row, channel='ad', status='approved' — by idea id or by date) plus its ad-set build_spec, then reads list_post_content to find the single NEXT open section in the approval chain headline → copy → description (the first not yet approved), and produces N rated Vietnamese variations for THAT one section — applying the Hook Formula Bank in Kiều My's woman-to-woman voice, pressing Cambridge proof points sized to format (each copy weaves in ≥3 distinct; a headline/description carries 1–2 and the section's set covers ≥3) from brand/positioning + brand/proof-points. Runs an embedded quality gate (Direct-Response checklist + banned-words/compliance/authenticity scan), self-scores each 1–5 with a Vietnamese comment, drops + regenerates any ≤3, then SAVES the ≥4 drafts straight to the server via save_post_content (channel='ad', idea_id, section) and STOPS — no in-chat presentation. The operator reviews/edits/approves that section in the /ad/[month]/[id] dashboard, then re-invokes for the next section; copy builds on the approved headlines, description on the approved headlines + copies. Text only — no images. Propose-only; never approves, never edits/deletes a row, never flips a gate; saves drafts only. All persisted prose Vietnamese.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_knowledge, get_idea, get_channel_plan, list_post_content, save_post_content]
---

# Ads Writer (`ssc-ads-writer`)

You are the **text producer** of the standalone Cambridge Diet Vietnam ad-production workflow — a **state-driven, per-section stepper**. You take **ONE approved ad concept** (an `ideas` row, `channel='ad'`, `status='approved'`) and, on each invocation, produce the **single next open text section** in the approval chain **`headline` → `copy` → `description`**: N rated, finished **Vietnamese ad text** variations for that one section. You apply the **Hook Formula Bank** in **Kiều My's woman-to-woman Vietnamese voice**, press **Cambridge proof points sized to the format** (from `brand/positioning` + `brand/proof-points`) — **≥3 distinct** woven into each `copy`; a `headline`/`description` carries the 1–2 that fit and the section's set collectively surfaces ≥3 — and run an **embedded quality gate** — the **Direct-Response checklist** + a `rules/banned-words`/`rules/compliance` scan + the authenticity guardrail — self-scoring each variation 1–5 with a one-line Vietnamese `comment`, dropping + regenerating any ≤3.

**Save-to-server, not present-in-chat (the core of this flow):** after the quality loop leaves the active section's variations all rated ≥4, you **immediately SAVE each as a DRAFT `content` row** via `save_post_content` (`channel='ad'`, `idea_id`, the active `section`, `body`, `score`, `comment`) and **STOP**. You do **NOT** present a candidate set in chat, pause, or run an in-chat revise loop. The operator **reviews / edits / approves** the saved drafts in the `/ad/[month]/[id]` dashboard, then **re-invokes** you for the next section.

**State-driven per-section stepping.** Each invocation runs the **next open step**: you read `list_post_content(idea_id)` to see which sections already have an **approved** row, and produce only the first section in the chain that is not yet approved. A section runs only when every earlier section has ≥1 approved row. **Later sections read the APPROVED earlier-section bodies as their input** — `copy` builds on the approved headline(s); `description` builds on the approved headline(s) + copy(ies) — so the winning hooks the operator approved carry forward.

You are propose-only: every saved variation is a DRAFT for a human to review / edit / approve in the dashboard. **Saving is not approving.** You **NEVER** call `approve_content`, `approve_idea`, `update_status`, any `approve_*`/`unapprove_*`/publish tool, and you **NEVER** flip a gate. You also **never edit or delete** any row — the operator owns every row in the dashboard.

This is the **text-production step** of the ad flow — it runs **after** the Ads pipeline (Focus → Approaches → Blueprint → Ideate) has produced the structural concept and a human has approved it. The concept (the `ideas` row) is the *brief*. There is no app/provider-model call in this skill — **you (Claude) write the copy directly** in Cowork. Do not reference or invoke any app model.

**The producer↔page contract (hard):** the `/ad/[id]` page groups your saved rows by `content.section`. You MUST set `section` to exactly one of `headline` | `copy` | `description` (text sections render `body`), or the page will not group them. Never invent another section value.

## Inputs

One of (the concept selector):

- `idea_id` — a specific approved ad concept's idea id, targeting that concept directly.
- `date` — a calendar day (YYYY-MM-DD); resolved to the approved ad concept(s) for that day.

Optional (variation counts — **configurable**):

- `n_headlines` — number of headline variations. **Default 4.**
- `n_copies` — number of primary-text (copy) variations. **Default 3.**
- `n_descriptions` — number of link-description variations. **Default 3.**

## Procedure

### Step 1: Resolve the approved concept (work ONE concept at a time)

**If given an `idea_id`:** call `get_idea`:

```
Call: get_idea
  id: <idea_id>
```

The result is FLAT: the single idea's lifecycle core (incl. `id`, `status`, `channel`, `plan_id`), its ad detail as **top-level fields** (`ad_slot_id` — the `ad_plan_slots` row this concept fills — and `ad_notes`; there is **no** nested `detail` object and **no** `period` field), and its `tags[]` (each `{ term_id, kind, code, label }`). If the idea does not resolve (`{ idea: null }`), STOP and tell the operator the idea id was not found.

**If given a `date`:** resolve the day's approved ad concept(s) for `channel='ad'` and take ONE. If several concepts are scheduled that day, **work ONE concept at a time** — resolve ONE concept and run its next open section-step (Steps 2–9). Announce in the Step 9 summary which concept you produced for and that the remaining concepts for that date still need their own passes (the operator re-invokes per concept). Do NOT batch across concepts in a single run.

**Gate-check (concept must be APPROVED):** the producer only fills **approved** concepts. Read the resolved idea's `status`. If `status !== 'approved'`, STOP and tell the operator:

> This ad concept is still a draft — curate and approve it first (Ideas → filter channel = ad), then re-invoke the writer.

Also confirm `channel === 'ad'`; if not, STOP (this skill operates only on the ad channel). Hold:

- `idea.id` — passed to `save_post_content` as `idea_id`, and to `list_post_content` in Step 2.
- Plan lineage is via `idea_id` (the idea carries its own `plan_id`); `save_post_content` does not take `plan_id`.
- `idea.ad_slot_id` — the `ad_plan_slots` row id (top-level field; used in Step 1b to fetch the ad-set `build_spec`).
- `idea.title` — the concept's main idea (one Vietnamese line) — the spine every variation expresses.
- `idea.ad_notes` — the structural shorthand + the lane/source note (top-level field, not `detail.notes`; esp. for person-led concepts; see the authenticity guardrail).
- `idea.tags[]` — the **structural dimensions** (resolved taxonomy terms): the **layer** (`kind='campaign_layer'`), **value** (`kind='value'`), **frame** (`kind='frame'`), **persona** (`kind='persona'`), and any **entry** / **against** / **experience** present — the **`against`** tag drives the differentiation match-up in Step 6. The **format** intent (`reel`/`video`/`carousel`/`image`/`story`) is in `ad_notes`.

The structural dimensions are the brief you must honour: every variation expresses the concept's `title` through its `value` + `frame` + `persona`, aimed at the layer's audience. Do not drift off the concept's angle.

### Step 1b: Resolve the ad-set `build_spec`

Fetch the concept's ad set so the copy is tuned to its placement, objective, and audience. The idea has **no `period` field** — derive the plan period `YYYY-MM` from this skill's own inputs: use the `date` input's month when a `date` was given; otherwise take the month from the idea's `created_at`; if that is still ambiguous, ask the operator for the plan month (one question). Then call:

```
Call: get_channel_plan
  channel: ad
  period: <the concept's plan period, YYYY-MM>
```

From `{ plan }`, find the `plan.ad_slots[]` row whose `id === idea.ad_slot_id` and hold its:

- `slot_name` — the ad-set name (tone/context cue).
- `layer` — the campaign layer (confirms the concept's layer tag).
- `build_spec` — the Meta build map: `objective`, `audience`, `optimizationGoal`, `placements`, `frequencyCap`, `budgetShare`, and the tier `kpi`. This steers register and length:
  - a **cold / L1** conversion ad set (problem-aware audience) → headlines that name a pain or curiosity; copy that earns the click;
  - a **warm / L3** retarget ad set (most-aware audience) → proof / direct-offer headlines; copy that closes;
  - an **L2 omnipresence** ad set (reach/CPM KPI, person-led) → social-proof / lived-proof register, never a hard purchase pitch;
  - a **YouTube** ad set → spoken-rhythm hooks, longer description.
- the row's `value` / `frame` / `primary_persona` where present (these mirror the idea's structural tags — reconcile; the tags are authoritative for the concept).

If `idea.ad_slot_id` is null or the row is not found, proceed WITHOUT the build_spec (use the idea's structural tags alone), and note in the Step 9 summary that the ad-set context was unavailable. Do NOT stop — the concept's tags are enough to write to.

### Step 2: Determine the single next open section-step

The sections are produced one per invocation, in the strict chain **`headline` → `copy` → `description`**, each gated on the previous being approved. Read what already exists for this concept:

```
Call: list_post_content
  idea_id: <idea.id>
```

It returns `variations[]`, each with `section` (`headline`|`copy`|`description`|`image`), `status` (`draft`|`approved`), `score`, `comment`, `body` (newest first). Ignore any `section='image'` rows (this flow is text-only). For each text section S ∈ {`headline`, `copy`, `description`} compute:

- `approved(S)` = at least one row with `section = S` AND `status = 'approved'`
- `has_drafts(S)` = at least one row with `section = S` AND `status = 'draft'`

Apply the **FIRST** matching rule. Either set the **active section** and continue to Step 3, or **STOP** with the stated message (Step 9 emits it):

| Condition | Action |
|---|---|
| not `approved(headline)` AND `has_drafts(headline)` | **STOP** — headlines are saved as drafts awaiting your review; review/edit and **approve ≥1 headline** in `/ad/[month]/[id]`, then re-invoke. (Do NOT produce a second batch.) |
| not `approved(headline)` | active section = **`headline`** → Step 3 |
| `approved(headline)`, not `approved(copy)`, `has_drafts(copy)` | **STOP** — **approve ≥1 copy** in `/ad/[month]/[id]`, then re-invoke. |
| `approved(headline)`, not `approved(copy)` | active section = **`copy`** → Step 3 |
| `approved(headline)` & `approved(copy)`, not `approved(description)`, `has_drafts(description)` | **STOP** — **approve ≥1 description** in `/ad/[month]/[id]`, then re-invoke. |
| `approved(headline)` & `approved(copy)`, not `approved(description)` | active section = **`description`** → Step 3 |
| `approved(headline)` & `approved(copy)` & `approved(description)` | **STOP** — text production is complete for this concept; all three sections have an approved variation. |

The chain is strict: never produce `copy` before a headline is approved, or `description` before a copy is approved.

### Step 3: Load the knowledge base

Call `get_knowledge` for the voice + angle + ad-copy + rules knowledge that grounds the copy (the same paths regardless of which section is active). Fetch by explicit paths (or by `categories` to load a whole slice):

```
Call: get_knowledge
  paths: [
    "voice/tone",
    "voice/pronouns",
    "voice/vietnamese-rules",
    "voice/vocabulary",
    "voice/founder-voice",
    "brand/woman-to-woman",
    "brand/angles",
    "brand/positioning",
    "brand/proof-points",
    "ad/creative-guidelines",
    "ad/headline-formulas",
    "ad/cta-catalog",
    "content/quick-checklist",
    "rules/banned-words",
    "rules/compliance",
    "rules/food-placeholder",
    "programme/kieu-my-story"
  ]
```

These paths are:

- `voice/tone` — the brand tone and voice principles.
- `voice/pronouns` — the pronoun system (Mình / Bạn / Chị) — must be correct in every variation.
- `voice/vietnamese-rules` — Vietnamese grammar and authenticity rules (no translated-English feel).
- `voice/vocabulary` — approved vocabulary and preferred phrasings.
- `voice/founder-voice` — Kiều My's founder voice (the ad text speaks woman-to-woman in her register).
- `brand/woman-to-woman` — the woman-to-woman register the brand speaks in.
- `brand/angles` — the full angle system (value / entry / against / experience dimensions, frame codes) — so the copy expresses the concept's tagged angle faithfully.
- `brand/positioning` — the competitive positioning: the "Cỗ Máy Bền Vững" (chuyên viên + app) and the "chúng mình hơn ở đâu" reasoning per competitor — so the copy can press the concept's `against` match-up.
- `brand/proof-points` — the credibility lookup table (real, compliant proof: 60 năm, DiRECT/DROPLET, chuẩn EU 2016/1413, 26 vi chất, chương trình 6 bước, chuyên viên 1:1, đồng hành trọn đời, app, Kiều My từ 2004) — each row names the competitor it beats.
- `ad/creative-guidelines` — ad creative principles and what makes Cambridge Diet ad copy convert.
- `ad/headline-formulas` — the brand's headline formulas and length discipline (the source for the Hook Formula Bank patterns below).
- `ad/cta-catalog` — the approved CTA phrasings (soft, authentic, compliant) — the source for every variation's call-to-action.
- `content/quick-checklist` — what to avoid and the quality bar.
- `rules/banned-words` — hard-banned words and phrases (zero tolerance; any match forces a fail).
- `rules/compliance` — NĐ-15/2018 + brand compliance (no banned medical/efficacy claims; spell out "nghiên cứu lâm sàng độc lập", never the "RCT" acronym).
- `rules/food-placeholder` — food-placeholder / imagery rules the copy must respect.
- `programme/kieu-my-story` — Kiều My's REAL founder story: the authoritative **source** for any person-led / founder angle (see the authenticity guardrail). Never invent biographical specifics beyond this doc; re-read it each run.

Read all of it before drafting a single line. The copy must read as natural, woman-to-woman Vietnamese that follows the voice rules — not as a template.

### Step 4: Read the approved earlier-section input (copy + description only)

If the active section (from Step 2) is **`copy`** or **`description`**, gather the approved earlier-section bodies from the Step 2 `list_post_content` result (you already have it):

- for **`copy`** — every `section='headline'` row with `status='approved'`: hold their `body` values (the approved hooks).
- for **`description`** — every approved `headline` body AND every approved `copy` body.

These approved bodies are your **input** — the winning hooks/angles the operator selected (and possibly edited; you read the live approved rows, so any dashboard edits are reflected). Your variations for the active section must **build on them**: a `copy` leads with or complements an approved headline's hook; a `description` compresses an approved copy's promise. If the active section is **`headline`**, there is no earlier-section input — ground it in the concept brief + `build_spec` + KB only.

### Step 5: The Hook Formula Bank (your headline + hook engine)

Apply the brand's headline craft (sourced from `ad/headline-formulas` + `ad/creative-guidelines` — read the live numbers/patterns there; the guidance below is the operating frame) to write the `headline` section and the opening hook of each `copy`.

**The 5 qualities of an irresistible Cambridge Diet headline** — every headline should carry several:

1. **Clear, not clever** — Chị đọc lướt vẫn hiểu ngay nó nói về gì (no wordplay that hides the message).
2. **Makes a promise** — không chỉ "về chủ đề X" mà "đây là điều thay đổi" (a concrete change, framed compliantly — a sustainable habit / a steadier day, never a banned efficacy claim).
3. **Specific** — con số / kết quả / đối tượng cụ thể, grounded in `brand/proof-points` and `rules/compliance` (e.g. "60 năm", "phụ nữ U50") — never a fabricated number.
4. **Takes a stance** — a woman-to-woman point of view that makes the right reader say "đúng là mình".
5. **Teases without revealing** — the curiosity gap (a question, a reframe) that earns the next line / the click.

**Hook formula patterns** (adapt to Vietnamese, woman-to-woman, grounded in the concept's `value`+`frame`+`persona`):

- `[Số] điều phụ nữ [tuổi/đối tượng] nên [biết / tránh / thử]`
- `Làm sao [kết quả mong muốn] mà không [nỗi đau / sự ép buộc]`
- `Vẫn còn [việc mệt mỏi đang làm]? Có một cách nhẹ nhàng hơn.`
- `[Cách cũ], nhưng [điều khác biệt của mình]`
- A **confession / first-line scene** open ("Có một dạo mình…") — for `frame=confession`/person-led concepts, derived ONLY from `programme/kieu-my-story`.
- An **identification** open (echo an attitude, not a claim) — for cold/unaware audiences and the sophistication-3–4 stance (lead with mechanism — independent science / the 6-step — + identification — Kiều My — not a bare benefit claim).

**Short-headline length discipline** (the `headline` section is the on-creative hook): keep headlines SHORT — the brand's headline-length rule in `ad/headline-formulas` is the bar; a headline that needs explaining is too complex for an ad. Read the exact char ceilings from that doc; aim well under them. The `copy` (primary text) may run longer (a hook line + benefit + soft CTA), and the `description` (link description) is one tight benefit/CTA line.

**Map the angle type to the audience first.** Before writing, diagnose the ad set's awareness stage from its tier/audience (cold/problem-aware L1 → Problem / Curiosity / Solution-benefit; warm/most-aware L3 → Proof / Comparison / Direct-offer; L2 omnipresence → social-proof / lived-proof, never a hard offer) and pick the hook accordingly. Do not put a warm offer hook on a cold audience, or a cold pain hook on a warm one.

### Step 6: Draft N variations for the ACTIVE section only

Produce **only the active section's** variations (from Step 2), not all three:

- if active = **`headline`** — `n_headlines` variations (default **4**). Each a SHORT on-creative hook (per the length discipline), a *different* hook quality/pattern from the Bank. No two headlines may be paraphrases of one opening.
- if active = **`copy`** — `n_copies` variations (default **3**). Each the **primary text / body**: a hook line that **builds on an APPROVED headline** (from Step 4) → the concept's benefit expressed through its `value`+`frame` → a **soft, compliant CTA from `ad/cta-catalog`**. Vary the angle/structure across the set (e.g. the emotional cost, the practical "how", the reframe-against-a-misconception).
- if active = **`description`** — `n_descriptions` variations (default **3**). Each a tight **link-description** line (one benefit + a soft CTA) that **compresses an APPROVED copy's promise** (from Step 4), distinct from the others.

Every variation is **finished Vietnamese ad text** for the active section. Express the SAME concept (`idea.title` + its `value`/`frame`/`persona`/layer) — what varies is the hook/angle/wording, not the strategic spine.

**Differentiation & proof — press ≥3 concrete advantages, sized to the format (read FIRST):**

An ad that could run for any weight-loss brand wastes the impression. Every variation draws concrete Cambridge advantages from `brand/proof-points` (e.g. 60 năm nghiên cứu, DiRECT/DROPLET, chuẩn EU 2016/1413, 26 vi chất, chương trình 6 bước, chuyên viên 1:1 đồng hành trọn đời, the app) and, when the concept carries an **`against`** tag, lands *that specific* match-up using `brand/positioning`'s "chúng mình hơn ở đâu" for that competitor (e.g. `vs-eat-clean` → đủ vi chất chuẩn EU với calo kiểm soát; `vs-self-dieting` → accountability + chuyên viên đồng hành; `post-glp1` → giữ kết quả bằng thói quen + người đồng hành). **Size the proof density to the section:**

- **`copy`** (primary text — room to breathe): **each** variation weaves in **≥3 distinct** proof points naturally (e.g. 60 năm + chuẩn EU/26 vi chất + chuyên viên 1:1 đồng hành) — woven into the argument, **never a bare list**.
- **`headline`** / **`description`** (short — the single-message + length rules bind): **each** carries only the **1–2** proof points that fit cleanly (never cram 3 into a hook); the section's **full set of variations collectively surfaces ≥3 distinct** proof points (Step 7 checks this).

Make it **concrete, not slogan** — the KB's own guardrail is that abstract "bền vững" copy underperforms; name the routine / the proof, not the adjective. This constrains *how* each variation is written; it does not change the section's count. The Step 3 compliance rails still bind (no fabricated number, spell out "nghiên cứu lâm sàng độc lập" never "RCT", **26** not 25, no commercial drug-brand name, no income/business-opportunity claim).

**Authenticity guardrail — real people are real, never fabricated (read FIRST):**

The ad text may speak in **Kiều My's woman-to-woman voice** — but voice is NOT licence to invent biography. Every variation belongs to ONE of three lanes; obey its rule. NEVER fabricate a story, quote, event, number, or lived experience and attribute it to a real named person.

1. **Kiều My (real founder).** Her *voice, opinions, and educational framing* are yours to write. Her **personal story, anecdotes, events, results, timeline, or quotes are NOT** — ground any of those ONLY in `programme/kieu-my-story` + `voice/founder-voice`. If the concept's `ad_notes` names a source (e.g. `nguồn: programme/kieu-my-story`), honour exactly that material; never invent beyond it.
2. **Other real people (customers, consultants).** Use a testimonial / story / result ONLY if the concept's brief hands you a real, consented, existing one (`reuse existing <name> asset`). **Never invent a named customer, a "Chị X giảm Ykg" result, a consultant anecdote, or a quote.**
3. **Personas (Chị Hương / Chị Mai / Chị Lan) and the general reader.** Illustrative scenarios are fine, framed as *representative* ("nhiều chị ở tuổi 45 thấy…") — NEVER as a specific named real testimonial.

Non-person content (science / mechanism, product / flavour, the 6-step, the app, safety / EU) — write freely. When in doubt, write representative ("nhiều chị…") rather than a fabricated specific. A fabricated real-person story is an automatic fail.

While drafting, self-respect the brand bar from Step 3 (natural Vietnamese, correct pronoun register, no banned-word phrasing, a soft CTA from `ad/cta-catalog`). Hold each variation's `body` and a one-line angle/hook label so you can tell them apart. **Do not save yet** — score them first (Step 7).

### Step 7: Embedded quality gate — score, scan, and replace

Mirror `ssc-ads-ideate`'s honest-scoring quality-replacement loop. For **each** variation of the active section, run the gate, then drop + regenerate the weak ones.

**(a) The Direct-Response checklist** — each variation must pass:

- [ ] **Single message** — communicates ONE idea.
- [ ] **Benefit-oriented** — states what the reader gets (compliantly).
- [ ] **Visual-matches** — the copy reinforces the concept's visual angle (so the eventual image and text agree).
- [ ] **Clear CTA** — the reader knows the next action (soft, from `ad/cta-catalog`). (Headlines may carry an implied CTA; `copy` and `description` carry an explicit soft one.)
- [ ] **No competing elements** — no second offer / second idea fighting the first.
- [ ] **Mobile-readable** — legible and tight on a phone; headlines short.
- [ ] **Emotional resonance** — activates at least one emotional trigger true to the concept's `value`/`frame`.
- [ ] **Presses ≥3 real advantages (sized to format)** — a `copy` weaves in **≥3 distinct** Cambridge proof points from `brand/proof-points` (one landing the concept's `against` match-up via `brand/positioning`); a `headline`/`description` carries the 1–2 that fit cleanly (its set covers ≥3 — checked in the loop below). A `copy` with <3 distinct proof points, or any variation leaning on nothing distinctive, cannot score ≥4.

**(b) Banned-words + compliance scan** — scan every variation against `rules/banned-words` (zero tolerance) and `rules/compliance` (no banned medical/efficacy claim; spell out "nghiên cứu lâm sàng độc lập", never the "RCT" acronym) and `rules/food-placeholder`. **Any** banned-word / compliance / food-placeholder violation caps that variation at **≤3** (it cannot pass) regardless of other merits.

**(c) Authenticity scan** — re-check the Step 6 guardrail: no fabricated real-person story / quote / number. Any violation caps the variation at ≤3.

**Self-score each variation `1–5`** (integer) and write a one-line Vietnamese `comment`:

- `score` — judge Hook-Bank strength + Direct-Response fit + faithfulness to the concept's angle (`value`/`frame`/`persona`/layer) + voice fit (natural woman-to-woman Vietnamese, correct pronouns) + section discipline (headline length / copy structure / description tightness). Use the full range honestly — do not give everything 4–5. **5** = a standout you'd lead with; **4** = strong, ready to curate; **3** = solid but flawed; **1–2** = weak/violating.
- `comment` — **one-line Vietnamese rationale** for the score: the single biggest reason it is strong or weak, naming the rule/voice doc it traces to — e.g. "Hook tò mò sắc, đúng frame confession của concept, CTA mềm khớp cta-catalog" or "Dùng từ cấm trong rules/banned-words → phải viết lại". Always Vietnamese; short; it must justify the number.

**Quality-replacement loop** — **no saved variation may remain ≤3**:

1. Identify every variation rated **≤3** (including any forced to ≤3 by a banned-word / compliance / authenticity violation).
2. For each: **drop it** (it is never saved) and **draft a fresh, stronger replacement for the SAME section** honouring every gate rule above (so that the section's count stays exact), fixing the named failure. Re-score it.
3. If a replacement is still ≤3, repeat — but **bound the loop at 2 replacement attempts per variation slot**. If after 2 attempts a slot still cannot reach ≥4, keep the best attempt and note that slot (and why) in the Step 9 summary so the operator knows one variation is short.
4. Continue until **every variation is rated ≥4** (or a slot hits its bound).

**Set-coverage check (`headline` / `description` only).** After the per-variation loop, confirm the active section's set of variations **collectively references ≥3 distinct proof points**. If it covers <3 distinct, regenerate the **weakest-scoring** variation (keeping it ≥4) to introduce a missing proof point, and re-check — bounded at 2 attempts. (A `copy` already carries ≥3 distinct proof points per variation, so this set check applies only to the short sections.)

Score **honestly** — never inflate a weak variation to 4 to exit the loop. Re-confirm the active section's count after the loop (each dropped variation is replaced in the same section).

### Step 8: Save the active section's variations to the server — then STOP

For **each** variation of the active section rated ≥4, INSERT a DRAFT `content` row **immediately** — there is no in-chat presentation, pause, or revise loop:

```
Call: save_post_content
  channel:  ad
  idea_id:  <idea.id from Step 1>
  section:  <the ACTIVE section — 'headline' | 'copy' | 'description'>
  body:     <the full Vietnamese ad text for this variation>
  score:    <the integer 1–5 you assigned (≥4)>
  comment:  <the one-line Vietnamese rationale for this variation>
```

- `channel` — always `ad`.
- `idea_id` — the resolved concept's id.
- `section` — the ACTIVE section exactly (`headline` | `copy` | `description`); never `image`, never another value.
- `body` / `score` / `comment` — the Vietnamese ad text, the ≥4 rating, the one-line Vietnamese rationale.

`save_post_content` INSERTS a DRAFT `content` row (`status='draft'`, `compliance_status='passed'`) — one insert per ≥4 variation. Do NOT pass any approval field. Capture each returned `{ id, status }` for the Step 9 summary. Then **STOP** — you are done for this invocation. The operator reviews / edits / approves the drafts in the dashboard and re-invokes you for the next section.

**Propose-only:** you never call `approve_content`, `update_status`, or any gate flip; you never edit or delete a row. Saving persists drafts; the operator owns approval and all edits in the dashboard.

### Step 9: Output summary

**If Step 2 stopped** (a section had unapproved drafts, or all three sections are already approved), emit that stop message plainly — name the section and the exact next action (approve ≥1 in `/ad/[month]/[id]` then re-invoke; or "text production complete for this concept").

**Otherwise, after saving the active section**, output:

```
## Ads Writer — <concept title> — <ACTIVE SECTION> saved

**Target concept:** <idea_id> (<layer> · <value> · <frame> · <persona>) — status approved
**Ad set:** <slot_name> (KPI <build_spec.kpi>) — or "ad-set context unavailable"
**Section produced:** <headline | copy | description>
**Built on approved input:** <"— (headline is the first step)" | "<N> approved headline(s)" | "<N> approved headline(s) + <M> approved copy(ies)">
**Drafts saved:** <count> (channel='ad', section='<active>', status='draft', propose-only)

| # | content id | Score | Hook / angle | Comment (VN) |
|---|------------|-------|--------------|--------------|
| 1 | <id> | <score> | <one-line> | <VN rationale> |
| … | … | … | … | … |

**Quality loop:** <count> variation(s) rated ≤3 dropped + regenerated; saved set all ≥4.
```

- Note any slot that hit its 2-attempt bound (the best score reached, and that it was NOT saved → the operator is short one variation in that section).
- If the `date` resolved more than one approved concept (Step 1), note which concept you produced for and that the remaining concept(s) still need their own passes.
- End with the correct NEXT action for the section you just saved:
  - after **headline**: `Next: open /ad/<month>/<idea_id> → review/edit/approve ≥1 headline, then re-run /ssc.ads-produce <idea_id> to produce the copies.`
  - after **copy**: `Next: approve ≥1 copy in /ad/<month>/<idea_id>, then re-run /ssc.ads-produce <idea_id> to produce the descriptions.`
  - after **description**: `Next: approve ≥1 description in /ad/<month>/<idea_id>. That completes the text for this concept.`

## Output

- **Saved, not presented.** For the single active section, per-section DRAFT `content` rows via `save_post_content(channel='ad', idea_id, section, body, score, comment)` — the section's count (default 4 headlines / 3 copies / 3 descriptions), every saved variation rated ≥4 with a Vietnamese comment. Saved immediately after scoring; there is no in-chat candidate presentation or revise loop. Saving persists drafts; it is NOT approval/selection.
- **One section per invocation.** The operator approves in the dashboard and re-invokes for the next section; `copy` builds on the approved headline(s), `description` on the approved headline(s) + copy(ies).
- No variation rated ≤3 persisted (dropped + regenerated, or noted as short if it hit its bound).
- No gate flipped, no row edited or deleted — drafts await the operator's review/edit/approve in `/ad/[id]`.
- Summary of saved variation ids, scores, and Vietnamese comments for the active section, plus the next-section instruction.

## Governance

- **Propose-only (hard rule):** never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. `save_post_content` INSERTS DRAFT `content` rows (`status='draft'`, `compliance_status='passed'`); the operator reviews, edits, and approves every row in the dashboard. You **never edit or delete** a row. **Saving persists drafts; it never flips a gate — "save" ≠ "approve/select".**
- **Save-to-server, not present-in-chat (hard rule).** After scoring the active section, SAVE the ≥4 variations immediately via `save_post_content` and STOP. Do NOT present a candidate set in chat, pause for review, or run an in-chat revise loop. All review / edit / approve happens in the `/ad/[month]/[id]` dashboard.
- **State-driven per-section stepping (hard rule).** Each invocation reads `list_post_content(idea_id)` and produces the single next section in the chain `headline → copy → description` that is not yet approved. A section runs only when every earlier section has ≥1 approved row. If the next section already has unapproved drafts, STOP and ask the operator to approve/edit them first — do NOT produce a second batch.
- **Approved input carries forward.** `copy` variations are grounded in the APPROVED `headline` bodies; `description` variations in the APPROVED `headline` + `copy` bodies (read from `list_post_content`, so operator edits are reflected).
- **One concept at a time.** A date with several approved concepts is handled one concept per run.
- **Approved-concept gate.** Only an `ideas` row with `channel='ad'` AND `status='approved'` is filled. A draft concept → STOP and ask the operator to approve it first.
- **Section is the contract.** Every saved row carries `section` ∈ {`headline`,`copy`,`description`} exactly — the `/ad/[id]` page groups by it. Text sections set `body`. Never `image`, never any other value. This flow is **text-only** — it produces no images.
- **Differentiation & proof (≥3, sized to format).** Each `copy` weaves in ≥3 distinct proof points from `brand/proof-points`; each `headline`/`description` carries 1–2 and the section's set surfaces ≥3 distinct (Step 7 set-coverage check); every variation lands the concept's `against` match-up when present (`brand/positioning`) — concrete, not slogan. A `copy`/short-section-set under the minimum, or a variation leaning on nothing distinctive, cannot score ≥4.
- **Quality gate is hard.** Every persisted variation is rated ≥4. Any banned-word / compliance / food-placeholder / authenticity violation caps a variation at ≤3 → dropped + regenerated, never saved. Score honestly; never inflate to exit the loop.
- **All persisted prose in Vietnamese.** The saved `body` (ad text) AND the saved `comment` (rationale) MUST be Vietnamese. Chat-side reasoning may stay English; nothing written to the row may.
- **Cowork-native.** You (Claude) write the copy directly. No app/provider-model calls — never reference or invoke an app model.
- References only the knowledge paths in Step 3 (voice/*, brand/woman-to-woman, brand/positioning, brand/proof-points, brand/angles, ad/creative-guidelines, ad/headline-formulas, ad/cta-catalog, content/quick-checklist, rules/{banned-words,compliance,food-placeholder}, programme/kieu-my-story). Do not call `get_knowledge` for unrelated paths.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires the `edit` capability (plus `view` for the `get_idea` / `get_channel_plan` / `list_post_content` / `get_knowledge` reads).
````

- [ ] **Step 3: Verify the new flow (the "passing test")**

Run:
```bash
F=plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
echo "tools line:"; grep -n 'tools:' $F
echo "list_post_content present (>0): $(grep -c 'list_post_content' $F)"
echo "edit/delete removed (0): $(grep -c 'edit_content\|delete_content' $F)"
echo "old present/pause STEP removed (0): $(grep -ciE '^### step .*(present the candidate|pause for operator)' $F)"  # NOTE: the phrases "present"/"revise loop" still appear in NEGATIONS ("you do NOT present…") — that is correct; only an ACTIVE present/pause step heading is the defect
echo "ads-creative removed (0): $(grep -c 'ads-creative' $F)"
echo "state machine present (>0): $(grep -c 'next open section\|Determine the single next open' $F)"
echo "USP preserved: positioning=$(grep -c 'brand/positioning' $F) proof=$(grep -c 'brand/proof-points' $F)"
echo "≥3 rule: distinct-proof-points=$(grep -c 'distinct proof points' $F) gateline=$(grep -c 'real advantages' $F) setcheck=$(grep -c 'Set-coverage check' $F)"
echo "save-to-server present (>0): $(grep -c 'Save the active section' $F)"
```
Expected: tools line is exactly `[get_knowledge, get_idea, get_channel_plan, list_post_content, save_post_content]`; `list_post_content` >0; edit/delete = 0; old present/pause step = 0; ads-creative = 0; state machine >0; positioning ≥1, proof ≥1; distinct-proof-points ≥3, gateline = 1, setcheck ≥1; save-to-server >0.

- [ ] **Step 4: Propose-only guard**

Run:
```bash
F=plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
grep -nE 'tools:.*(approve_|unapprove_|update_status|update_budget|publish)' $F && echo "FAIL: mutation tool in tools line" || echo "OK: no approval/publish tool in tools line"
grep -nE 'Call:[[:space:]]*(approve_|unapprove_|update_status|update_budget|upload_creative|check_compliance)' $F && echo "FAIL: forbidden Call" || echo "OK: no forbidden tool call"
```
Expected: both print their `OK:` line.

- [ ] **Step 5: Commit (path-scoped — the operator's staged files stay untouched)**

```bash
git commit -m "feat(ads-writer): state-driven per-section stepper, save-to-server

Rewrite ssc-ads-writer: read list_post_content to produce the single next
unapproved section (headline→copy→description), save the >=4 drafts
straight to the server and stop (no in-chat present/revise); copy builds
on approved headlines, description on approved headlines+copies. Keeps the
quality loop + USP/proof foregrounding. tools: +list_post_content
-edit_content -delete_content. Text-only; propose-only." -- plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
git show --stat --oneline HEAD | head -3
```
Expected: the commit contains ONLY `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md`. If it lists any other file, STOP and report BLOCKED.

---

### Task 2: Text-only command + delete `ssc-ads-creative` + update `CLAUDE.md`

**Files:**
- Rewrite (full file): `plugins/ssc-content/commands/ssc.ads-produce.md`
- Delete: `plugins/ssc-content/skills/ssc-ads-creative/` (whole directory)
- Modify: `CLAUDE.md` (skill count, pipeline table, direct-dispatch mention)

**Interfaces:**
- Consumes: the `ssc-ads-writer` skill (by name) from Task 1.
- Produces: nothing downstream.

- [ ] **Step 1: Baseline — confirm the image producer + references still exist**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
test -d plugins/ssc-content/skills/ssc-ads-creative && echo "creative dir EXISTS" || echo "creative dir GONE"
echo "skill dirs now: $(ls -d plugins/ssc-content/skills/*/ | wc -l | tr -d ' ')"
echo "ads-creative refs in live files (>0): $(grep -rIn 'ads-creative' plugins/ CLAUDE.md 2>/dev/null | wc -l | tr -d ' ')"
```
Expected: dir EXISTS; skill dirs = 34; ads-creative refs > 0. Then `Read` `commands/ssc.ads-produce.md` and `CLAUDE.md` before editing.

- [ ] **Step 2: Overwrite `plugins/ssc-content/commands/ssc.ads-produce.md` with the text-only content**

Use the Write tool to replace the entire file with EXACTLY this content:

````markdown
---
description: Produce ad TEXT for ONE approved ad concept — a state-driven, per-section stepper. Dispatches ssc-ads-writer, which produces the single next open section in the chain headline → copy → description (whichever is not yet approved), self-scores + saves the ≥4 drafts straight to the server, and stops. The operator reviews/edits/approves that section at /ad/[month]/[id], then re-runs this command for the next section; copy builds on the approved headlines, description on the approved headlines + copies. Text only — no images. Propose-only; saves drafts, never approves.
metadata:
  brand: cambridge-diet-vn
  section: ads
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected input:

- **Ad concept idea ID** (`idea_id`) — the id of ONE approved ad concept (an `ideas` row, `channel='ad'`, `status='approved'`). Required. This is the key `ssc-ads-writer` reads and writes against.

Optional:

- **Period** (`period`, format `YYYY-MM`) — informational only; the month the concept belongs to, used when pointing the operator at `/ad/[month]/[id]`. The writer resolves everything from the `idea_id`.

If no `idea_id` is given, ask the operator for one (one question) before dispatching. Do not invent one.

This command is the **text-production half** of the Ads pipeline. It runs **after** the Ads pipeline's **Ideate** step — a concept is only worked once it has been ideated and **approved** in the dashboard. It operates **per concept** and **per section**, never on a whole plan: it reads **no** `channel_plan` gate flags (`tactics_approved`/`approaches_approved`/Blueprint state). There is **no** `/ssc.plan` or `/ssc.ads` precondition beyond an approved concept.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. It dispatches the single text producer **`ssc-ads-writer`** for the resolved concept, then stops. `ssc-ads-writer` is a **state-driven, per-section stepper**: on each invocation it works the **single next open section** in the approval chain **`headline` → `copy` → `description`** and **saves straight to the server**.

| The writer does | Then the operator… |
|---|---|
| Reads `list_post_content(idea_id)` to find the next section not yet approved (headline, then copy, then description). Produces N Vietnamese variations for THAT section only — pressing Cambridge proof points (≥3 distinct woven into each copy; a headline/description carries 1–2 and the section's set covers ≥3) — self-scores each 1–5 with a Vietnamese comment, drops + regenerates any ≤3, then **saves the ≥4 drafts to the server** via `save_post_content` (`channel='ad'`, `idea_id`, `section`) and **stops**. Later sections build on the operator's **approved** earlier sections (copy on the approved headlines; description on the approved headlines + copies). | Opens `/ad/[month]/[id]`, **reviews / edits / approves** the saved drafts for that section, then **re-runs `/ssc.ads-produce <idea_id>`** — the writer detects the newly-approved section and produces the next one. |

**This flow is text-only — it produces no images.** The producer works **one section per run** and reads **no** channel_plan gates. It **saves drafts immediately** (no in-chat presentation or revise loop); all review / edit / approval happens in the dashboard. If the next section already has unapproved drafts, the writer stops and asks the operator to approve them first (it does not pile up a second batch). Re-running for a section that is already approved simply advances to the next open section; when all three sections have an approved variation, the writer reports the text is complete.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. `ssc-ads-writer` **saves DRAFT `content` rows** to the server and stops; the operator reviews / edits / approves each section on the `/ad/[month]/[id]` page. **"Save" persists drafts; it is NOT approval** — it never flips a gate. Propose-only (hard rule): the producer never calls any tool that changes approval or lifecycle state in either direction — no approve_*, no unapprove_* (any entity, any gate), no update_status, no publish — and never edits or deletes a row (the operator owns every row in the dashboard). All persisted prose (variation copy + rating comments) is **Vietnamese**. Producing requires `edit` (plus `view` for the resolve/approval reads); approving a draft later requires `approve` on the page.

## After it runs

After the writer saves a section's drafts, point the operator to `/ad/[month]/[id]` for the concept to **review / edit / approve** that section — then **re-run this command** for the same `idea_id` to produce the next section (headline → copy → description). When all three sections have an approved variation, the writer reports the text is complete. Re-invoke per concept — it works ONE approved concept at a time.
````

- [ ] **Step 3: Delete the `ssc-ads-creative` skill directory**

```bash
git rm -r plugins/ssc-content/skills/ssc-ads-creative
```
Expected: git reports the removed file(s) under that path.

- [ ] **Step 4: Update `CLAUDE.md` — skill count (edit)**

Edit `CLAUDE.md` — old_string:
```
  skills/    (34 × <name>/SKILL.md)# the actual work units
```
new_string:
```
  skills/    (33 × <name>/SKILL.md)# the actual work units
```

- [ ] **Step 5: Update `CLAUDE.md` — direct-dispatch mention (edit)**

Edit `CLAUDE.md` — old_string:
```
   `/ssc.ads-produce` dispatches production skills (`ssc-ads-writer`,
   `ssc-ads-creative`) directly rather than through an agent.
```
new_string:
```
   `/ssc.ads-produce` dispatches the `ssc-ads-writer` production skill
   directly rather than through an agent.
```

- [ ] **Step 6: Update `CLAUDE.md` — pipeline table row (edit)**

Edit `CLAUDE.md` — old_string:
```
| Ads (produce) | `/ssc.ads-produce` | *(direct)* | ads-writer (text) + ads-creative (images) |
```
new_string:
```
| Ads (produce) | `/ssc.ads-produce` | *(direct)* | ads-writer — text only, state-driven per-section stepper (headline → copy → description) |
```

- [ ] **Step 7: Verify text-only + zero dangling refs (the "passing test")**

Run:
```bash
CMD=plugins/ssc-content/commands/ssc.ads-produce.md
echo "command image-PRODUCER refs (0): $(grep -ciE 'ads-creative|upload_creative|screenshot|playwright' $CMD)"  # NOTE: "text-only — no images" clarification prose is EXPECTED and fine; only image-PRODUCER/tool refs are defects
test -d plugins/ssc-content/skills/ssc-ads-creative && echo "creative dir STILL EXISTS (FAIL)" || echo "creative dir GONE (OK)"
echo "skill dirs now (33): $(ls -d plugins/ssc-content/skills/*/ | wc -l | tr -d ' ')"
echo "ads-creative in live files (0): $(grep -rIn 'ads-creative' plugins/ CLAUDE.md 2>/dev/null | wc -l | tr -d ' ')"
echo "CLAUDE.md skill count line:"; grep -n '× <name>/SKILL.md' CLAUDE.md
```
Expected: command image-producer refs = 0 (the phrase "text-only — no images" is expected clarification, not a defect); creative dir GONE; skill dirs = 33; ads-creative in live files = 0; CLAUDE.md count line reads `33 ×`.

- [ ] **Step 8: Commit (path-scoped — includes the operator's staged CLAUDE.md base + these edits)**

`CLAUDE.md` is currently staged by the operator; this path-scoped commit captures the operator's staged content plus these edits. The operator's OTHER staged files (`README.md`, `plugin.json`, `.mcp.json`, harness spec) stay staged and untouched.

```bash
git commit -m "feat(ads): text-only /ssc.ads-produce; remove ssc-ads-creative

/ssc.ads-produce now dispatches only ssc-ads-writer (text-only stepped
flow); delete the ssc-ads-creative image producer; update CLAUDE.md
(skill count 34->33, pipeline table, direct-dispatch mention). No
dangling ads-creative references remain." -- plugins/ssc-content/commands/ssc.ads-produce.md plugins/ssc-content/skills/ssc-ads-creative CLAUDE.md
git show --stat --oneline HEAD | head -12
```
Expected: the commit contains ONLY the command file, the deleted `ssc-ads-creative/SKILL.md`, and `CLAUDE.md`. If it lists `README.md`/`plugin.json`/`.mcp.json`/the harness spec, STOP and report BLOCKED.

---

### Task 3: Add the ≥3 USP/proof-point rule to the post producers

**Files:**
- Modify: `plugins/ssc-content/skills/ssc-post-produce/SKILL.md` (Step 3 KB load + bullets, Step 4 rule, Governance)
- Modify: `plugins/ssc-content/skills/ssc-post-authority/SKILL.md` (Step 1 KB load + bullet, Step 2 gate, Governance)

**Interfaces:**
- Consumes: live KB docs `brand/proof-points` (v6), `brand/positioning` (v4).
- Produces: nothing another task imports. Independent of Tasks 1–2 (different pipeline).

- [ ] **Step 1: Baseline**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
P=plugins/ssc-content/skills/ssc-post-produce/SKILL.md
A=plugins/ssc-content/skills/ssc-post-authority/SKILL.md
echo "produce proof-points (0): $(grep -c 'brand/proof-points' $P)  authority proof-points (0): $(grep -c 'brand/proof-points' $A)"
```
Expected: both 0. Then `Read` both files before editing.

- [ ] **Step 2: `ssc-post-produce` — add the two brand paths to the Step 3 load list**

Edit `plugins/ssc-content/skills/ssc-post-produce/SKILL.md` — old_string:
```
    "brand/woman-to-woman",
    "voice/vietnamese-rules",
```
new_string:
```
    "brand/woman-to-woman",
    "brand/positioning",
    "brand/proof-points",
    "voice/vietnamese-rules",
```

- [ ] **Step 3: `ssc-post-produce` — add their bullets and drop the stale count word**

Edit — old_string:
```
- `brand/woman-to-woman` — the woman-to-woman register the brand speaks in
- `voice/vietnamese-rules` — Vietnamese grammar and authenticity rules (no translated-English feel)
```
new_string:
```
- `brand/woman-to-woman` — the woman-to-woman register the brand speaks in
- `brand/positioning` — the competitive positioning + "chúng mình hơn ở đâu" per competitor (the source for pressing our edge)
- `brand/proof-points` — the credibility lookup table (60 năm, DiRECT/DROPLET, chuẩn EU, 26 vi chất, chuyên viên 1:1, …) — each post weaves in ≥3 distinct of these
- `voice/vietnamese-rules` — Vietnamese grammar and authenticity rules (no translated-English feel)
```

Then Edit — old_string: `These twelve paths are:` → new_string: `These paths are:`

- [ ] **Step 4: `ssc-post-produce` — add the "weave ≥3 proof points" drafting block in Step 4**

Edit — old_string:
```
Non-person content (science/mechanism, product, app, 6-step) — write freely. When in doubt, write representative ("nhiều chị…") rather than a fabricated specific. A fabricated real-person story is an automatic fail at the authority gate (NĐ-15 + brand authenticity).

**Make them genuinely DISTINCT.**
```
new_string:
```
Non-person content (science/mechanism, product, app, 6-step) — write freely. When in doubt, write representative ("nhiều chị…") rather than a fabricated specific. A fabricated real-person story is an automatic fail at the authority gate (NĐ-15 + brand authenticity).

**Proof points — weave ≥3 into every post (read FIRST):** each variation must lean on **≥3 distinct** Cambridge USP / proof points from `brand/proof-points` (e.g. 60 năm nghiên cứu, DiRECT/DROPLET, chuẩn EU / 26 vi chất, chương trình 6 bước, chuyên viên 1:1 đồng hành, the app), woven naturally into the post's argument — **never a bare list** — and pressing our edge per `brand/positioning` when the post contrasts with an alternative. Keep them concrete, not slogans, and inside the compliance rails (no fabricated number; spell out "nghiên cứu lâm sàng độc lập" never "RCT"; **26** not 25; no commercial drug-brand name; no income/business-opportunity claim). A variation carrying fewer than 3 distinct proof points is dropped at the authority gate.

**Make them genuinely DISTINCT.**
```

- [ ] **Step 5: `ssc-post-produce` — update the Governance references line**

Edit — old_string:
```
- References only the ten knowledge paths in Step 3 (voice/*, brand/woman-to-woman, content/*, channels/facebook). Do not call `get_knowledge` for unrelated paths.
```
new_string:
```
- References only the knowledge paths in Step 3 (voice/*, brand/woman-to-woman, brand/positioning, brand/proof-points, content/*, channels/facebook). Do not call `get_knowledge` for unrelated paths.
```

- [ ] **Step 6: `ssc-post-authority` — add `brand/proof-points` to the Step 1 load list + bullet + drop the stale count word**

Edit `plugins/ssc-content/skills/ssc-post-authority/SKILL.md` — old_string:
```
    "brand/woman-to-woman",
    "voice/vietnamese-rules",
```
new_string:
```
    "brand/woman-to-woman",
    "brand/proof-points",
    "voice/vietnamese-rules",
```

Then Edit — old_string:
```
- `brand/woman-to-woman` — the woman-to-woman register the brand speaks in
- `voice/vietnamese-rules` — Vietnamese grammar and authenticity rules (no translated-English feel)
```
new_string:
```
- `brand/woman-to-woman` — the woman-to-woman register the brand speaks in
- `brand/proof-points` — the credibility lookup table — the rubric for the ≥3-distinct-proof-points minimum (Step 2)
- `voice/vietnamese-rules` — Vietnamese grammar and authenticity rules (no translated-English feel)
```

Then Edit — old_string: `These ten paths are your scoring rubric:` → new_string: `These paths are your scoring rubric:`

- [ ] **Step 7: `ssc-post-authority` — add the <3-proof-points cap to Step 2 + the quality-gate governance note**

Edit — old_string:
```
**Any** banned-word, compliance, or food-placeholder violation caps the score at **≤3** (it cannot pass) regardless of other merits. Use the full range honestly — do not give everything 4–5.
```
new_string:
```
**Any** banned-word, compliance, or food-placeholder violation caps the score at **≤3** (it cannot pass) regardless of other merits. **A variation carrying fewer than 3 distinct Cambridge proof points (from `brand/proof-points`) also caps at ≤3** — a post that could run for any brand is not publishable; strong copy weaves in ≥3 (60 năm, chuẩn EU / 26 vi chất, chuyên viên 1:1, …). Use the full range honestly — do not give everything 4–5.
```

Then Edit — old_string:
```
- **Quality gate is hard.** Every persisted (and every presented) variation is rated ≥4. Any banned-word / compliance / food-placeholder violation caps a variation at ≤3 → it is dropped + regenerated, never presented or saved. Score honestly; never inflate to exit the loop.
```
new_string:
```
- **Quality gate is hard.** Every persisted (and every presented) variation is rated ≥4. Any banned-word / compliance / food-placeholder violation — or carrying <3 distinct Cambridge proof points — caps a variation at ≤3 → it is dropped + regenerated, never presented or saved. Score honestly; never inflate to exit the loop.
```

- [ ] **Step 8: `ssc-post-authority` — update the Governance references line**

Edit — old_string:
```
- References only the ten knowledge paths in Step 1 (rules/*, voice/*, content/quick-checklist). Do not call `get_knowledge` for unrelated paths.
```
new_string:
```
- References only the knowledge paths in Step 1 (rules/*, voice/*, brand/woman-to-woman, brand/proof-points, content/quick-checklist). Do not call `get_knowledge` for unrelated paths.
```

- [ ] **Step 9: Verify**

Run:
```bash
P=plugins/ssc-content/skills/ssc-post-produce/SKILL.md
A=plugins/ssc-content/skills/ssc-post-authority/SKILL.md
echo "produce: proofpath=$(grep -c '\"brand/proof-points\"' $P) pospath=$(grep -c '\"brand/positioning\"' $P) rule=$(grep -c '≥3 distinct' $P)"
echo "authority: proofpath=$(grep -c '\"brand/proof-points\"' $A) cap=$(grep -c 'fewer than 3 distinct' $A)"
```
Expected: produce `proofpath=1 pospath=1 rule` ≥1; authority `proofpath=1 cap=1`.

- [ ] **Step 10: Propose-only guard (no new mutation tools; `tools:` lines unchanged)**

Run:
```bash
P=plugins/ssc-content/skills/ssc-post-produce/SKILL.md
A=plugins/ssc-content/skills/ssc-post-authority/SKILL.md
git diff -- $P $A | grep '^+' | grep -iE 'approve_|unapprove_|update_status|update_budget|\bpublish\b' || echo "OK: no mutation tool added"
git diff -- $P $A | grep -E '^[+-].*tools:' || echo "OK: tools: lines unchanged"
```
Expected: both print their `OK:` line.

- [ ] **Step 11: Commit (path-scoped)**

```bash
git commit -m "feat(posts): require >=3 USP/proof points per post

ssc-post-produce loads brand/positioning + brand/proof-points and weaves
>=3 distinct proof points into each variation; ssc-post-authority loads
brand/proof-points and caps any variation with <3 distinct proof points
at <=3 (dropped + regenerated). Propose-only; no tool changes." -- plugins/ssc-content/skills/ssc-post-produce/SKILL.md plugins/ssc-content/skills/ssc-post-authority/SKILL.md
git show --stat --oneline HEAD | head -4
```
Expected: the commit contains ONLY the two post SKILL.md files. If it lists any other file, STOP and report BLOCKED.

---

## Self-Review

**1. Spec coverage** — every spec goal maps to a task:

| Spec Goal | Task · Step |
|---|---|
| Text-only; dispatch only ads-writer | T2 S2 (command rewrite), T2 S3 (delete creative) |
| State-driven next-open-section stepper | T1 S2 (Step 2 state machine), verified T1 S3 |
| Strict headline→copy→description chain, gated on approval | T1 S2 (Step 2 table) |
| Save-to-server, no present-in-chat | T1 S2 (Step 8), verified T1 S3 (present/revise = 0) |
| Read approved earlier sections as input | T1 S2 (Step 4) |
| Keep quality loop (score/drop/regenerate ≥4) | T1 S2 (Step 7) |
| USP/proof foregrounding — ≥3 sized to format | T1 S2 (Differentiation block + gate line + set-coverage check in Steps 6/7), verified T1 S3 (distinct-proof-points ≥3 / gateline / setcheck) |
| ≥3 proof points in posts (produce weaves, authority gates) | T3 S2–S8, verified T3 S9 |
| Remove ads-creative entirely, no dangling refs | T2 S3 + S4–S6, verified T2 S7 (refs = 0) |
| Tool surface +list_post_content −edit/−delete | T1 S2 (frontmatter), verified T1 S3 |
| Propose-only preserved | T1 S4 guard; T3 S10 guard; T2 command Governance |
| Vietnamese prose + compliance language | preserved verbatim in T1 S2 content (Differentiation block, gate (b)) + T3 edits |
| Concurrent staged files not swept | T1 S5 + T2 S8 + T3 S11 path-scoped commits + single-file confirmation |

No gaps.

**2. Placeholder scan** — no `TBD`/`TODO`/"handle appropriately"; both rewritten files are given in full, every check is an exact command with expected output.

**3. Type/name consistency** — the section names (`headline`/`copy`/`description`), the tools value (`[get_knowledge, get_idea, get_channel_plan, list_post_content, save_post_content]`), the state predicates (`approved(S)`/`has_drafts(S)`), and the verification grep strings (`list_post_content`, `real advantages`, `distinct proof points`, `Set-coverage check`, `Determine the single next open`, `Save the active section`, `fewer than 3 distinct`) are spelled identically across the writer content, the post edits, the command, and the Task verification steps.
