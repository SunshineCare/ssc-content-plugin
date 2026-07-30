---
argument-hint: '<brief_id> [script|storyboard|keyframe|clip] [scene_index] [rewrite | revise: <note>]'
description: >-
  Launch the PROPOSE-ONLY, ZERO-CREDIT Cambridge Diet Vietnam video-production chain (011-video-production-redraw) for ONE approved brief — Script → Storyboard → per-scene (Keyframe → Clip) → Assemble. BRIEF-KEYED: the owning idea AND the channel are resolved from the brief via get_brief, so there is no idea_id and no channel argument (`ad` and `post` are accepted; any other channel stops cleanly). Thin entry point that dispatches ssc-video-agent, which is state-driven — it reads the run, derives the SINGLE next open step, dispatches that step's skill, and stops at its human gate. The scene count is parsed from the approved Storyboard; a scene marked `real` is a filmed shot whose still and footage are uploads, and the agent reports that gate rather than generating. A step may be named positionally with an optional 0-based scene index, and `rewrite` / `revise: <note>` re-author the targeted step at zero cost. Nothing auto-approves; generation is the operator's click in the VideoStudio.
metadata:
  dispatches: [ssc-video-agent]
  brand: cambridge-diet-vn
  section: video
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty).

**Required — `brief_id`**: the id of ONE **approved** brief. For an **ad** concept that is one of the angle briefs produced by `/ssc-ads-brief` and approved in the dashboard; for a **post**, the idea's single brief. If it is missing, ask the operator for it (one question) and do not invent one.

There is **no `idea_id` argument and no channel argument** — `get_brief` returns the brief, its owning idea, and the channel. A brief on any channel other than `ad` or `post` stops cleanly with nothing written.

**Optional — the step**, given positionally: `script` | `storyboard` | `keyframe` | `clip`. A named step wins over the agent's derived next-open step; its upstream preconditions still apply.

**Optional — the scene index**, given positionally after a per-scene step: **0-based**, so `## Cảnh 1` is `0`. **Required** for `keyframe` and `clip` — those addresses do not exist without one. This is the form the VideoStudio's copy button emits:

```
/ssc-video <brief_id> keyframe 3
```

**Optional — the zero-cost re-author forms**:

- `revise: <note>` — re-author the targeted step's saved artifact with that steer.
- a bare trailing `rewrite` — the note-less form: re-author it fresh from the current sources.

Both leave every already-selected candidate untouched and **spend no credits**. Neither generates, deletes, or un-selects anything.

## What to do

This command holds **no** orchestration logic. Dispatch **`ssc-video-agent`**, passing the `brief_id` and any step / scene index / re-author marker **verbatim**.

The agent is a **state-driven stepper**: it resolves the run (`get_video_run`, which get-or-CREATEs), reads which text-spine rows are approved and which addresses hold a selected candidate, derives the **single next open step**, dispatches that step's skill, and **stops**.

| The agent dispatches | Then the operator… |
|---|---|
| **Script** — the Vietnamese spoken spine, saved as a draft `content` row (`section='script'`). | Reviews/edits and **approves** it in the dashboard, then re-runs this command. |
| **Storyboard** — the approved Script broken into an ordered `## Cảnh <n>` scene list, saved as a draft `content` row (`section='storyboard'`). | Reviews and **approves** it. Approving sets the run's **scene count**; an unparseable board is refused. |
| **Keyframe `<n>`** — the still that opens scene *n*, saved as a `creative_prompts` row. | Clicks **Tạo** in the VideoStudio and **selects** a candidate. |
| **Clip `<n>`** — the motion for scene *n* (needs that scene's keyframe selected), saved as a `creative_prompts` row. | Clicks **Tạo** — the render runs in the background and reports when it settles — then selects a candidate. |
| **A `real` scene** — reported, not produced: its still and footage are **uploads**. | Writes the shot-plan and uploads the material in the VideoStudio. |
| **Assemble** — reported once every scene has a selected clip. | Clicks **Ghép video**. The finished cut must be ≤ 90 seconds; over that, the refusal names the computed total. |

Re-run this command after each gate to advance. It works **one step per invocation** and never fans out.

## Governance

Nothing auto-approves, auto-generates, or auto-publishes. The agent's own tools are **read-only**; the skills it dispatches hold exactly two mutations — `save_content` (Script, Storyboard) and `save_creative_prompt` (Keyframe, Clip) — both of which write **drafts** and **spend nothing**.

Neither the agent nor its skills can reach a `generate_*` tool or `assemble`, and that is enforced **server-side**, not promised here: every credit- or compute-spending tool declares itself costly and is withheld from an agent token, and `approve` is hard-denied to agents by name. Generation, candidate selection, and approval are human VideoStudio actions.

A refusal such as `insufficient role` / `forbidden` is a **server-side permission** — it is surfaced in Vietnamese and the run stops; it is never retried with different arguments and never silently skipped.

## After it runs

Point the operator at the brief's **Video** stage in the ad or post workspace to review/approve the artifact or to generate and select a candidate, then re-run `/ssc-video <brief_id>` to advance. The agent's report names the run's shape — how many scenes the board has and how many already have a selected clip — because at 15–20 scenes that is the question worth answering first.
