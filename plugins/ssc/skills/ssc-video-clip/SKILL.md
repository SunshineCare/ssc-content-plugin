---
name: ssc-video-clip
description: >-
  Step 4 of the PROPOSE-ONLY, ZERO-CREDIT Cambridge Diet Vietnam video-production chain (011-video-production-redraw) — the per-scene CLIP prompt author, the step that describes MOTION. Addressed by an approved `brief_id` PLUS a 0-based `scene_index`, so its address is `(brief, 'clip', scene_index)` and a scene index is REQUIRED. Resolves the brief via get_brief → { brief, idea } (channel ∈ {ad, post}, read from the brief) and gates on an APPROVED Storyboard plus — the precondition that matters — a SELECTED Keyframe at the SAME scene: the still is the video model's first frame, and the server refuses `generate_clip` with `keyframe_not_selected` without one. The selected keyframe is read at SUBMISSION time by the server, not here, and re-selecting one later never touches an already-produced clip (there is no freshness relation). A `real` scene STOPs — its footage is an upload. Duration is NOT this skill's to set: the scene's `Thời lượng` from the storyboard, then the run's target, then the registry default, clamped to 2–5s, all resolved server-side at submission. It writes ONLY a `creative_prompts` row via save_creative_prompt(layer:'clip', scene_index); the operator clicks Generate in the VideoStudio. Operator-facing prose is Vietnamese; the prompt body is free-form.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: video
  capability: edit
  tools: [get_brief, get_idea, get_video_run, list_content, list_creatives, list_creative_prompts, get_knowledge, view_image, save_creative_prompt]
---

# Video — Step 4 · Clip (`ssc-video-clip`)

You author the **motion** of one scene — how its selected keyframe comes alive. One invocation, **one scene**. You write a prompt and **STOP**; the operator clicks **Generate**, which submits a background job. **You spend no credits.**

## Inputs

Required:

- `brief_id` — the approved brief.
- `scene_index` — **0-based**, **required**. Positional form: `/ssc-video <brief_id> clip <n>`.

Optional:

- `revise: <note>` / a bare trailing `rewrite` — re-author this scene's saved clip prompt.

## Gate

1. **Brief + channel** — `ad` or `post`, brief and idea `approved`. Otherwise a clean Vietnamese STOP.
2. **Storyboard approved**, and `scene_index` within `0..N-1` of its parsed scenes.
3. **The scene must be an AI scene** — `get_video_run(brief_id)` → `scene_sources[scene_index]`; `'real'` STOPs (its footage is an upload, gated on a shot-plan).
4. **This scene's Keyframe must be SELECTED.** `list_creatives({ brief_id, layer: 'keyframe', scene_index })` → one with `status='approved'`. Without it:

   > Cảnh `<n+1>` chưa có **khung hình được chọn**. Khung hình chính là frame đầu tiên của video, nên hãy tạo và chọn một khung hình trước (`/ssc-video <brief_id> keyframe <n>`). **Chưa có gì được ghi.**

   Authoring anyway would leave a prompt the server refuses to generate from (`keyframe_not_selected`).

   **What this is not:** the server reads the selected keyframe **at submission time** and freezes it onto the prompt row. Re-selecting a different keyframe afterwards does **not** invalidate, flag, or block a clip that already exists — there is no freshness relation between steps. Never tell the operator their clip is "stale" because they re-picked a still.

## Grounding

- **This scene's `Hình` and `Lời`** from the approved Storyboard — what the scene shows, and what it has to say while showing it.
- **The SELECTED keyframe itself.** This is the one place a look is genuinely warranted: use `view_image` on the selected keyframe candidate so the motion you describe starts from the frame that actually exists, not from the frame the prompt asked for. One look, not a sweep.
- **The adjacent scenes** — motion has to hand off. A scene that ends on a push-in next to one that opens on a push-in reads as a stutter.
- **KB** — `brand/visual-identity` for pace and register; `rules/compliance`, because motion can imply a claim (a shrinking body, a scale's needle moving) that still text would not.

## What to write

A short free-form description of **movement over a few seconds**, starting from the selected still. Concretely:

- **Describe what CHANGES.** The still is already established — the prompt's job is the delta: a slow push-in, a hand lifting the glass, steam rising, a smile arriving. "Cô ấy đứng trong bếp" describes the keyframe, not the clip.
- **One movement per clip.** These are 2–5 second shots. A camera move *and* a subject action *and* a lighting change is three shots' worth of instruction compressed into one, and the model will average them.
- **Keep the subject identity stable.** The first frame carries the face; the motion must not ask for a turn or an expression change so large that the model re-invents it.
- **No text, no captions, no negation** — same rules as the keyframe. Captions and the headline are the render's packaging, added at Assemble.

**Do not set a duration.** The clip's length resolves server-side at submission: this scene's `Thời lượng` from the storyboard → the run's `target_scene_duration_sec` → the registry default, clamped into **2–5s**. If a scene genuinely needs a different length, that belongs in the **storyboard's** `Thời lượng`, where it is visible and reviewable — not buried in a prompt.

## Save

```
save_creative_prompt(
  brief_id:    <brief_id>,
  layer:       'clip',
  scene_index: <n>,
  body:        <the motion prompt>
)
```

`scene_index` is required for this layer. Leave `generation_config` alone unless the operator named a model — the run's pin and the registry default are the better answer.

**An existing prompt or an existing clip at this address does not block you.** Re-author freely; warn about staleness, never refuse.

## STOP and report (Vietnamese)

> Đã lưu **prompt video** cho cảnh `<n+1>` (`scene_index: <n>`) của brief `<brief_id>`.
> Bước tiếp theo: bạn bấm **Tạo** trong VideoStudio — việc tạo video chạy nền, bạn có thể rời trang và sẽ được báo khi xong. Sau khi chọn một bản, chạy lại `/ssc-video <brief_id>` để sang cảnh tiếp theo.

## Governance (hard rules)

- **Propose-only, zero-credit.** Reads + `save_creative_prompt` only. Never `generate_clip` / `generate_keyframe` / `assemble` / any `generate_*`; never `approve` / `unapprove`; never upload, select, set a cover, publish, or `update_budget`. **None of those appears in this skill's `tools:` list.**
- A refusal (`insufficient role` / `forbidden`) is a server-side permission — surface it in Vietnamese and stop.
