# Ads Persona-Late — Plugin Skills Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

> **This is a PROSE rewrite** (markdown skills/agents/commands in `ssc-content-plugin`), not code. There are no unit tests; each task's "verification" is (a) governance-invariant self-check, (b) spec-compliance against the design, (c) `node plugins/ssc/hooks/approval-gate.mjs` still denies subagent approvals, and (d) grep checks that removed concepts are gone and new tool fields present. Review each task against the Global Constraints before marking complete.

**Goal:** Rewrite the Cowork ads pipeline skills to the persona-late 3-level model so operators stop getting same-y output — Idea = persona-free subject, Angle/Brief = persona × route (fanned across the personas a subject fits), Copy = execution; the ad set/media-buy leaves the creative pipeline.

**Architecture:** Delete `ssc-ads-blueprint`; the creative pipeline becomes **Focus → Approaches → Ideate → Brief → Writer** (planning agent runs Focus → Approaches → Ideate → Measure; Brief + Writer are the separate production flows). Focus carries the plan-level coverage target; Ideate emits persona-free subjects; Brief chooses persona × route per subject and declares the media home (`target_layer` + `audience_intent` + `awareness_stage`); the server contract for all of this is already **live** (Deferred 0, `master-aa46e24`).

**Tech Stack:** Markdown skills (`plugins/ssc/skills/<name>/SKILL.md`), agent (`agents/`), commands (`commands/`), the BrandOS MCP tool surface (already extended: `save_brief` accepts persona/route/target_layer/audience_intent/awareness_stage + kind-validated; `save_channel_plan` accepts `creative_target`; briefs read back the labels).

## Global Constraints (bind every task)

- **Propose-only (hard rule).** No skill/agent may reference `approve`, publish/schedule, `update_budget`, `create_*`, or use `edit` to demote/unapprove. Never flip a gate. (Preserve exactly as today.)
- **Never hard-code KB content.** Reference the live KB doc + section and read it live (personas, `ad/awareness-framework`, `brand/angles`, routes). No persona names in closed enums, no baked persona hooks/prohibitions, no route lists restated. (See root CLAUDE.md "Never hard-code KB content".)
- **Every referenced MCP tool must exist** on the BrandOS surface. New/changed tool fields this rewrite relies on (all shipped): `save_brief(persona_term_id, route_term_id, target_layer_term_id, audience_intent, awareness_stage)`, `save_channel_plan(creative_target)`, `save_idea` (persona-free ad ideas now allowed — `frame` no longer required for ad). Do NOT reference `save_ad_plan_slots` from any creative skill (media buy left the pipeline).
- **`/ssc.*` cross-refs must resolve to a real command.** Update pipeline tables; don't leave dangling `ssc.ads-plan`/blueprint refs.
- **Persisted prose is Vietnamese** (copy, angle_label, comments); operator-facing chat/system text may be the operator's language.
- **Persona-late invariants:** Idea names no persona/route/layer/framing. Brief chooses persona × route + declares layer/ad-set intent + awareness_stage. One persona-free subject fans into angles across the personas it fits. The ad set/media-buy is a dashboard/ops concern — no creative skill plans or references ad sets/`build_spec`/`ad_plan_slots`.

## File Structure

| File | Change | Task |
|---|---|---|
| `skills/ssc-ads-focus/SKILL.md` | + write `creative_target` (coverage/volume: persona × route × count) via `save_channel_plan` | 1 |
| `skills/ssc-ads-approaches/SKILL.md` | reframe off "per ad set" → per-route/persona differentiation | 2 |
| `skills/ssc-ads-blueprint/SKILL.md` | **DELETE** the directory | 3 |
| `skills/ssc-ads-ideate/SKILL.md` | rewrite → persona-free, tier-free subjects; drop archetype/value/frame/against/slot machinery | 4 |
| `skills/ssc-ads-brief/SKILL.md` | rewrite → persona × route fan-out; declare target_layer/audience_intent/awareness_stage | 5 |
| `skills/ssc-ads-writer/SKILL.md` | light — tune to the angle's persona/route/awareness-stage, drop ad-set `build_spec` reads | 6 |
| `skills/ssc-ads-measure/SKILL.md` | scrub ad-set/Blueprint references; measure by angle (persona × route) | 7 |
| `agents/ssc-ads-agent.md` | drop Blueprint from `orchestrates` + the state machine; pipeline Focus → Approaches → Ideate → Measure | 8 |
| `commands/ssc.ads-plan.md`, `ssc.ads-brief.md`, `ssc.ads-produce.md` | update pipeline text; drop Blueprint step | 8 |
| `plugins/ssc/CLAUDE.md` + root `CLAUDE.md` | pipelines table + three-layer dispatch description | 9 |

**Order:** 1 (Focus/target) → 2 (Approaches) → 3 (delete Blueprint) → 4 (Ideate) → 5 (Brief) → 6 (Writer) → 7 (Measure) → 8 (agent+commands) → 9 (CLAUDE.md). 4→5 are the core; do them carefully.

---

### Task 1: `ssc-ads-focus` — carry the coverage/volume target

**File:** Modify `plugins/ssc/skills/ssc-ads-focus/SKILL.md`

**What changes:**
- Keep Focus as "the month's bets," but add a concrete **coverage/volume target** output: which `subject × persona × route` combinations to cover and how many creatives, written to the channel_plan via `save_channel_plan(channel='ad', period, creative_target=[{ persona, route, count }], tactics=…)`.
- `creative_target` replaces the retired Blueprint's per-ad-set `creative_count` as the single source of "how much to make." Personas come from the live `brand/personas` roster (read live, never enumerated here); routes from `ad/awareness-framework` (problem/solution/comparison/proof/curiosity).
- Update the pipeline line: "step 1 of **Focus → Approaches → Ideate → Measure**" (no Blueprint). Remove the sentence deferring budget-split/creative-counts/ad-set-build-map "to the Blueprint step."
- Preserve: retrospective read, propose-only, ends at the Focus gate, never sets `tactics_approved`.

- [ ] Read the current skill + the design spec's OP1 (coverage target shape).
- [ ] Rewrite: add `creative_target` to the Step-3 output + the `save_channel_plan` call; fix the pipeline references; remove Blueprint deferrals.
- [ ] Self-check: propose-only intact; personas/routes read live (not enumerated); tool `save_channel_plan(creative_target=…)` matches the shipped schema (array of `{persona, route, count}`).
- [ ] `git add` the file + commit `feat(ads-focus): carry the persona×route coverage target (creative_target)`.

---

### Task 2: `ssc-ads-approaches` — reframe off "per ad set"

**File:** Modify `plugins/ssc/skills/ssc-ads-approaches/SKILL.md`

**What changes:**
- The creative "how" is now expressed as **per-route / per-persona** differentiation guidance (which routes to emphasize for which personas, the differentiation moves, experiments) — NOT per-ad-set/per-layer creative steering.
- Remove any language that assigns creative steering to ad sets/slots or that feeds the Blueprint. Approaches now feeds Ideate (subjects) + Brief (persona × route choices).
- Fix pipeline references (Focus → Approaches → Ideate → Measure).
- Preserve: propose-only, ends at the Approaches gate, reads the live KB (awareness framework, angles, personas).

- [ ] Read current skill.
- [ ] Rewrite the "how" framing to per-route/persona; strip ad-set/Blueprint/slot references; fix pipeline.
- [ ] Self-check: no `save_ad_plan_slots`/`build_spec`/slot references; propose-only; KB read live.
- [ ] Commit `refactor(ads-approaches): per-route/persona differentiation, off the ad-set model`.

---

### Task 3: Delete `ssc-ads-blueprint`

**Files:** Delete `plugins/ssc/skills/ssc-ads-blueprint/` (whole directory).

**What changes:** The media buy leaves the creative pipeline entirely (dashboard/ops owns ad sets/budgets/audiences). No skill replaces it.

- [ ] `git rm -r plugins/ssc/skills/ssc-ads-blueprint/`
- [ ] Grep the repo for `ssc-ads-blueprint` and `save_ad_plan_slots` and `ad_plan_slots` and `build_spec`; every hit in a skill/agent/command is a dangling ref to fix in its owning task (note them for Tasks 4–9). (Report the list.)
- [ ] Commit `feat(ads): delete ssc-ads-blueprint — media buy leaves the creative pipeline`.

---

### Task 4: `ssc-ads-ideate` — persona-free subjects

**File:** Modify `plugins/ssc/skills/ssc-ads-ideate/SKILL.md`

**What changes (the core of the model):**
- Ideate now generates a **plan-level pool of persona-free, tier-free subjects** — one concrete tension / insight / myth / proof-territory per planned creative, sized to the Focus `creative_target` (total count). NOT one-per-ad-set.
- **Remove:** the approved-ad-set gate + iterating `ad_plan_slots`; per-slot `creative_count`; `detail.slotId`; the persona/archetype pre-assignment + archetype-balance checks; the value/frame/against/entry/experience tagging + all §5 structural-diversity floors that depend on them; the awareness/frame/persona pre-assignment.
- **Keep/adapt:** `save_idea(channel='ad', plan_id, source='ai', status='draft', title=<persona-free subject>, score, comment)` — with **no persona/value/frame/layer terms** (server now allows a term-free ad idea; `frame` no longer required). The `title` is the subject only. Distinctiveness = **distinct subjects across the whole plan** (a plan-wide dedup, replacing the per-slot "unique angle" rule). Keep the honest-scoring quality loop.
- Gate becomes: run when `approaches_approved` (Focus + Approaches done); read `creative_target` for the count. Fix pipeline references.

- [ ] Read current skill + design "before/after: ssc-ads-ideate".
- [ ] Rewrite to persona-free subject generation; delete the slot/archetype/framing machinery; add plan-wide subject-distinctiveness; read `creative_target` for volume.
- [ ] Self-check: `save_idea` carries NO persona/value/frame/layer terms; no `slotId`/`ad_plan_slots`/`creative_count`/archetype refs; propose-only; KB read live; Vietnamese titles.
- [ ] Commit `feat(ads-ideate): persona-free, tier-free subjects at plan level`.

---

### Task 5: `ssc-ads-brief` — persona × route fan-out

**File:** Modify `plugins/ssc/skills/ssc-ads-brief/SKILL.md`

**What changes (the L1=Lan lock-breaker):**
- For ONE persona-free subject (an approved ad idea), the Brief now **chooses the personas the subject fits** (from the live `brand/personas` roster) and, per persona, a **route** (problem/solution/comparison/proof/curiosity from `ad/awareness-framework`) — fanning into DISTINCT briefs across `persona × route`. One subject → many persona-angles (Lan AND Hương AND Thảo).
- Each brief now sets, via `save_brief`: `persona_term_id`, `route_term_id`, plus the five narrative fields + `angle_label` + score/comment, AND declares the media home — `target_layer_term_id` (derived from the route's awareness-stage → tier) + `audience_intent` (a short Vietnamese phrase for who this angle speaks to) + `awareness_stage`. Resolve persona/route/layer codes → term ids via `list_taxonomies` (kinds `persona`, `route`, `campaign_layer`); the server kind-validates them.
- The idea no longer carries a persona tag, so the Brief READS no persona off the idea — it CHOOSES persona(s). Anchor each angle on the chosen persona's detail doc (`brand/persona-<slug>`, read live) + the awareness framework, exactly as today, but persona is now a Brief choice, not an inherited idea tag.
- Distinctiveness widens: the "taken set" compares across ALL of the idea's briefs (all persona × route), and — per the design — ideally across the plan's angles. Preserve the never-pad rule, the `Tránh` per-persona gate, the quality loop, and propose-only (`save_brief` mints drafts only).
- Fix pipeline/cross-refs.

- [ ] Read current skill + design "before/after: ssc-ads-brief" + the shipped `save_brief` field list.
- [ ] Rewrite: persona-selection (from live roster) × route fan-out; set the new `save_brief` fields incl. target_layer/audience_intent/awareness_stage; resolve ids via `list_taxonomies`; widen the taken-set to persona × route.
- [ ] Self-check: no persona read off the idea (it's chosen); `save_brief` carries the five new fields; ids resolved (never a code); `Tránh` gate + never-pad + propose-only intact; personas/routes read live.
- [ ] Commit `feat(ads-brief): choose persona × route, fan across the personas a subject fits`.

---

### Task 6: `ssc-ads-writer` — tune to the angle

**File:** Modify `plugins/ssc/skills/ssc-ads-writer/SKILL.md`

**What changes (light):**
- The writer already anchors to ONE approved brief. Change: it tunes register/length/route realization to the **brief's** `persona`/`route`/`awareness_stage` (read from the resolved brief), NOT to an ad-set `build_spec`. Remove the Step-1b `get_channel_plan` → `ad_plan_slots[]` → `build_spec` resolution and the tier/build-spec register steering; replace with the brief's declared persona/route/awareness_stage.
- The awareness-stage/angle-type is read from the brief's `awareness_stage`/`route` fields (+ `why_now`), not re-derived from the ad set.
- Preserve: Hook Formula Bank, proof points, DR checklist, compliance/banned-words + footer gate, `Tránh` gate, per-section stepper, propose-only save.

- [ ] Read current skill (esp. Step 1b build_spec resolution).
- [ ] Replace ad-set/build_spec steering with the brief's persona/route/awareness_stage; keep everything else.
- [ ] Self-check: no `get_channel_plan`/`ad_plan_slots`/`build_spec` reads; register/length driven by the brief's persona/route/awareness_stage; propose-only + footer/compliance gates intact.
- [ ] Commit `refactor(ads-writer): tune to the angle's persona/route/awareness-stage, not an ad-set build_spec`.

---

### Task 7: `ssc-ads-measure` — measure by angle

**File:** Modify `plugins/ssc/skills/ssc-ads-measure/SKILL.md`

**What changes:** Scrub ad-set/Blueprint/slot references. Performance/retrospective is organized by **angle (persona × route)** and tier (from the brief's declared layer), not by `ad_plan_slots`. Keep propose-only + the retrospective write it feeds to next month's Focus.

- [ ] Read current skill; grep for slot/ad_plan/Blueprint refs.
- [ ] Reframe measurement around persona × route + declared layer; remove ad-set/slot coupling.
- [ ] Self-check: no dangling Blueprint/slot refs; propose-only.
- [ ] Commit `refactor(ads-measure): measure by angle (persona×route), off the ad-set model`.

---

### Task 8: `ssc-ads-agent` + commands — pipeline reshape

**Files:** Modify `agents/ssc-ads-agent.md`, `commands/ssc.ads-plan.md`, `commands/ssc.ads-brief.md`, `commands/ssc.ads-produce.md`

**What changes:**
- Agent `orchestrates:` drops `ssc-ads-blueprint` → `[ssc-ads-focus, ssc-ads-approaches, ssc-ads-ideate, ssc-ads-measure]`. Rewrite the state machine: **Focus (gate: tactics_approved) → Approaches (gate: approaches_approved) → Ideate (gate: ideas approved) → Measure**. Remove the per-ad-set Blueprint gate + all `ad_plan_slots` state detection.
- `ssc.ads-plan` command: pipeline text `Focus → Approaches → Ideate → Measure`; drop the Blueprint step.
- `ssc.ads-brief` / `ssc.ads-produce`: mostly unchanged (they're the production flow), but scrub any Blueprint/ad-set language in their descriptions; note the Brief now chooses persona × route.

- [ ] Rewrite the agent state machine (drop Blueprint step + slot gates); update `orchestrates`.
- [ ] Update the three commands' pipeline descriptions.
- [ ] Self-check: no `ssc-ads-blueprint` / `ad_plan_slots` refs remain; every `/ssc.*` ref resolves; propose-only.
- [ ] Commit `feat(ads-agent): pipeline Focus→Approaches→Ideate→Measure (Blueprint removed)`.

---

### Task 9: CLAUDE.md — pipelines table + dispatch description

**Files:** Modify `plugins/ssc/CLAUDE.md` and root `/Users/thang/dev/ssc/CLAUDE.md` (if it carries the ads pipeline table).

**What changes:** Update the Pipelines table (Ads plan row → Focus → Approaches → Ideate → Measure; remove Blueprint). Update the ads-brief/ads-produce rows to the persona-late model (Brief chooses persona × route; ad set is dashboard/ops). Update the three-layer dispatch description if it names Blueprint. Add the persona-late model note (Idea=subject / Angle=persona×route / Copy=execution; media buy left the pipeline).

- [ ] Update `plugins/ssc/CLAUDE.md` pipelines table + descriptions.
- [ ] Update root `CLAUDE.md` if it references the ads pipeline/Blueprint.
- [ ] Self-check: no stale Blueprint refs; tables accurate; `/ssc.*` refs resolve.
- [ ] Commit `docs(claude.md): persona-late ads pipeline (Blueprint removed, persona×route brief)`.

## Self-Review (run after all tasks)

1. **Grep sweep:** `grep -rn 'ssc-ads-blueprint\|ad_plan_slots\|save_ad_plan_slots\|build_spec\|slotId\|creative_count' plugins/ssc` → every remaining hit must be an intentional negation (e.g. "no ad-set dependency"), not a live reference.
2. **Governance:** `echo '{"tool_name":"mcp__ssc__approve_idea","agent_id":"ssc-ads-agent"}' | node plugins/ssc/hooks/approval-gate.mjs` → still `deny`. No skill references `approve`/`create_*`/publish/`update_budget`.
3. **KB not hard-coded:** no persona names in enums, no route lists restated, no baked persona hooks/prohibitions — all read live.
4. **Tool fields:** `save_brief` calls carry persona/route/target_layer/audience_intent/awareness_stage; `save_channel_plan` carries `creative_target`; no creative skill calls `save_ad_plan_slots`.
5. **Cross-refs:** every `/ssc.*` and pipeline table resolves; no dangling Blueprint step.

## Deployment / rollout note

These are markdown skills installed via the Cowork marketplace — no server deploy. But: **the KB revision proposal** (`2026-07-21-ads-persona-late-kb-revision-proposal.md`) should be applied through the propose-approve flow **together with** this rewrite reaching operators, and only **after** both land + operators are on the new skills does the server **Contract phase** (Deferred 5 — drop `ad_slot_id` / steering cols / `'ad'` from `applies_to`) become safe.
