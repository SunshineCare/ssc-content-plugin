---
name: ssc-video-storyboard
description: >-
  Produces the STORYBOARD step of the reusable Brand OS video-production workflow (011-video-production) for ONE approved idea + channel (post/ad/youtube), immediately after ssc-video-script. Resolves (or resumes) the production, requires the Script step to be APPROVED first, then breaks the approved Vietnamese narration into an ORDERED list of scenes — each carrying a visual description, its slice of the narration as the scene's VO line, a visual/shot note, and an intended duration — sized to the channel's typical video length. Saves the scene list as the Storyboard step's current value via save_step_value(section='storyboard') as a JSON array matching the workspace's SceneDescriptor shape, and STOPS. Cowork-native — Claude writes the scene breakdown directly; no AI-provider tool call, no image/video generation (that is the separate, backend-gated Scene Assets step). Propose-only: saves a DRAFT slot value only, never calls approve (entity production_step), never uses edit to demote a step, never flips a gate.
metadata:
  type: skill
  stage: video-production
  brand: cambridge-diet-vn
  section: video
  capability: edit
  tools: [get_idea, start_production, get_production, get_knowledge, save_step_value]
---

# Video Storyboard (`ssc-video-storyboard`)

You are the **Storyboard** step producer of the reusable Brand OS video-production workflow (spec `011-video-production`, FR-002/FR-017). You take **ONE approved idea**, resolve its video **production**, and break its **approved Script** into an **ordered list of scenes** — the shot-by-shot plan the Scene Assets step will later fill with images/video, one scene at a time. You save that scene list as the Storyboard step's single current value and **stop**. You do **not** write narration (that's `ssc-video-script`, which must run and be approved first), generate any image/video/audio, assemble, package, or produce voiceover audio.

This is step 3 of the production's step order (**Brief → Script → Storyboard → Scene Assets → Assemble → Package → Voice**). It runs immediately after `ssc-video-script`.

## Inputs

- `idea_id` — the approved idea this production is for. **Required** (unless `production_id` is given directly).
- `production_id` — an existing production's id, to resume without re-resolving the idea. **Optional** — when given, skip Step 1 and call `get_production` directly.
- `channel` — `post` | `ad` | `youtube`. **Optional** — defaults to the idea's own `channel` (FR-006); only pass this to repurpose across channels, and only if a production already exists for that (idea, channel) pair or you intend to start one.

## Procedure

### Step 1: Resolve the idea and production

If `production_id` was given, skip to Step 2 with it. Otherwise:

```
Call: get_idea
  id: <idea_id>
```

**Gate-check:** If `idea` is null, STOP and tell the operator the idea id was not found. If `idea.status` is not `approved`, STOP and tell the operator only approved ideas can enter production.

```
Call: start_production
  idea_id: <idea_id>
  channel: <channel — the input, or idea.channel if omitted>
```

Idempotent — returns the existing `(idea, channel)` production if one already exists (FR-006). Hold `production_id`.

### Step 2: Read the production state

```
Call: get_production
  production_id: <production_id>
```

The result is `{ production: {...} }` — the read model lives under the `production` key; every field below (`steps`, `values`, `channel`) is read off that object.

**Gate-check (Script must be approved first):** Look at `production.steps.script`. If it is not `completed` (i.e. the Script step isn't approved yet — `pending` means no script value exists at all, `active` means a draft exists but isn't approved), STOP and tell the operator: run `ssc-video-script` first and approve it in the video-production workspace before storyboarding. Do not draft a storyboard against an unapproved or missing script — the scene breakdown must be built from the narration the operator has actually signed off on, mirroring how downstream ad sections gate on approved copy.

If `production.steps.script` is `completed`, hold `production.values.script.body` — the approved Vietnamese narration you will break into scenes.

Also check `production.values.storyboard`:

- If it already holds a value, hold its `id` and `version` (you'll need `version` as `expected_version` to override it — this run is a **revision** of an existing storyboard, e.g. because the script changed after re-approval). If its `status` is `approved`, this run will **re-open it to draft and re-run compliance** (FR-011) — say so plainly in the Step 6 summary, don't silently overwrite without mentioning it.
- If it's absent, omit `expected_version` entirely — this is the first save.

Note `production.channel` — it shapes scene count/pacing (Step 3).

### Step 3: Load light channel pacing guidance

```
Call: get_knowledge
  paths: [<channel-specific path below>]
```

- **`post`**: `content/reels` (Reels pacing/shot-change cadence for short vertical video)
- **`ad`**: `ad/formats` (typical ad-format spot length and shot-count conventions)
- **`youtube`**: `channels/youtube` (long-form pacing; more scenes, longer per-scene duration than a Reel)

This is a light read to calibrate scene **count** and **duration**, not a rewrite of the narration — you are not re-drafting voice/brand copy here (that's `ssc-video-script`'s job and already approved).

### Step 4: Break the narration into an ordered scene list (do not save yet)

Read `production.values.script.body` as continuous spoken narration. Split it into **consecutive, non-overlapping slices** — every word of the approved narration must land in exactly one scene's `voLine`, in order; you are dividing the script, not paraphrasing or rewriting it. For each slice, produce one scene:

- **`description`** (Vietnamese) — what's on screen: the subject, action, and setting for that beat (e.g. "Kiều My ngồi trong bếp, cầm cốc nước, nhìn thẳng vào camera").
- **`voLine`** (Vietnamese) — the **exact** slice of the approved narration spoken during this scene (verbatim substring of `production.values.script.body`, in order — do not invent or alter words).
- **`visualNote`** (Vietnamese) — the shot/framing note: camera angle or movement, cut type, on-screen text if any, mood (e.g. "Cận cảnh, ánh sáng tự nhiên, chữ overlay: 'Ngày 1 của hành trình'").
- **`durationSec`** — an estimated seconds for the scene, guided by the channel's typical pacing (Step 3): a `post`/reel scene usually runs a few seconds each (many quick cuts); a `youtube` long-form scene can run longer (fewer, longer cuts); an `ad` scene sits between the two, matching its format's spot length. The sum of all `durationSec` should land in the channel's typical total-length ballpark — do not pad with filler scenes just to hit a number.

**Scene count** — let the narration's natural beats decide it (a hook usually earns its own scene; a body may span several; a close is usually one), not a fixed target; a short Reel narration might yield 3–6 scenes, a long-form YouTube narration more.

### Step 5: Self-check before saving

1. **Full coverage, no gaps/overlaps** — concatenating every scene's `voLine` in order reproduces `production.values.script.body` exactly (same words, same order); no scene invents dialogue not in the script.
2. **Ordered and sequential** — scenes are in narration order (hook → body → close), not shuffled.
3. **Visual descriptions are concrete**, not generic ("cảnh quay đẹp") — each names a subject/action/setting.
4. **No banned words / no fabricated real-person specifics** introduced in `description`/`visualNote` (the narration itself was already checked by `ssc-video-script`; don't introduce new claims here).
5. **Duration total is plausible** for the channel (Step 3), not wildly over/under.
6. **All persisted text is Vietnamese** (FR-028).

If a check fails, revise the scene list in place before saving.

### Step 6: Save the scene list

Serialize the scene list as a JSON array — **exactly** this shape (matches the workspace's `SceneDescriptor`):

```json
[
  { "description": "...", "voLine": "...", "visualNote": "...", "durationSec": 6 },
  { "description": "...", "voLine": "...", "visualNote": "...", "durationSec": 10 }
]
```

```
Call: save_step_value
  production_id: <production_id>
  section: storyboard
  body: <the JSON-serialized scene array above, as a string>
  source_model: claude-sonnet-5
  generation_prompt: <one line: "broke the approved script into N scenes, paced per <channel>'s pacing conventions">
  expected_version: <the storyboard step's current version — ONLY if Step 2 found an existing storyboard value; omit entirely on first save>
```

This call returns `{ content_id, version, status: 'draft' }`. The value is a **draft** regardless of whether it overrode an approved one (FR-011/FR-012) — nothing here approves it.

### Step 7: Output summary

```
## Video Storyboard — <idea title>

**Production:** <production_id> (idea <idea_id> · channel <channel>)
**Storyboard saved:** content <content_id>, version <version>, status draft
**Scenes:** <N> · total ~<sum of durationSec>s

| # | Description | VO line | Visual note | Sec |
|---|---|---|---|---|
| 1 | ... | ... | ... | 6 |
| 2 | ... | ... | ... | 10 |
...

### Self-check
| Check | Result |
|---|---|
| Full narration coverage, no gaps/overlaps | PASS |
| Scenes in narration order | PASS |
| Concrete visual descriptions | PASS |
| No new claims/banned words introduced | PASS |
| Duration plausible for <channel> | PASS |

---
<Note if this reopened a previously-approved storyboard to draft.>
Next: review/edit/reorder the scenes in the video-production workspace (/video/<production_id>), then approve the Storyboard (requires `approve`; compliance runs automatically first). Approving Storyboard unblocks Scene Assets — **note: Scene Assets (per-scene image/video generation) isn't producible by Cowork yet; the backend AI-generation tools it needs haven't shipped. Fill scene assets by hand (upload) in the workspace for now.**
```

## Output

- The production's **`storyboard`** step holds exactly one current value: the JSON scene list, saved via `save_step_value(production_id, section='storyboard', body, source_model, generation_prompt, expected_version?)` — status `draft`.
- No gate flipped. No `approve(entity='production_step', …)` call, and no `edit` used to demote a step. No compliance override.

## Governance

- Propose-only (hard rule): never call `approve` (the ONLY gated promotion — any entity, incl. `production_step`; the approval hook denies it to agents, and you do NOT hold the `approve` capability), never use `edit` to demote/unapprove/discard/reject a step (demotion is an `edit` now, not a separate `unapprove_step` tool — so the ban lives here; the server gates any patch touching a step's approval field on the `approve` capability, so the MCP server refuses such a patch on the capability check and writes nothing), and never call any other tool that changes approval/lifecycle state. Never call `set_consistency_profile`, `save_step_value(section='scene_image'|'scene_video'|...)`, or any generation/asset tool — Storyboard is text-only and Cowork-native, and scene assets are a separate, later step this skill never touches.
- **Cowork-native.** You (Claude) write the scene breakdown directly. There is no AI-provider/generation tool call — `save_step_value` is a direct write. `source_model` records that Claude authored it directly.
- **Gated on approved Script.** Never draft a storyboard while `production.steps.script` is not `completed` — stop and hand off per Step 2.
- **Single track.** There is exactly one current storyboard value per production (a single JSON array), not per-scene rows. Re-invoking this skill overrides it (FR-007/FR-009); the prior value's history is retained server-side for audit, not by this skill.
- **Divide, never invent.** Every `voLine` must be a verbatim, in-order slice of the approved script. Do not add narration the script doesn't contain.
- **All persisted prose in Vietnamese** (FR-028). Chat-side reasoning may stay English.
- One idea/production at a time — never batch across ideas in a single run.
- Requires the `edit` capability (plus `view` for the `get_idea`/`get_production`/`get_knowledge` reads). Approving the saved draft later requires `approve`, in the video-production workspace.
