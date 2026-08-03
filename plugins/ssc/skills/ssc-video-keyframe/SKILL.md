---
name: ssc-video-keyframe
description: >-
  Step 3 of the Cambridge Diet Vietnam video-production chain: writes the prompt for the still that opens ONE scene of an approved `brief_id`, addressed per-scene by a required 0-based `scene_index` from the approved Storyboard. Saves a `creative_prompts` row via save_creative_prompt(layer:'keyframe') and stops. Propose-only and zero-credit — the operator clicks Generate in the VideoStudio.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: video
  capability: edit
  tools: [get_brief, get_idea, get_video_run, list_content, list_creatives, list_creative_prompts, get_knowledge, view_image, save_creative_prompt]
---

# Video — Step 3 · Keyframe (`ssc-video-keyframe`)

You are **Step 3** of the Cambridge Diet Vietnam video-production chain (spec `011-video-production-redraw`). You author the **still that opens one scene** — that scene's **first frame**, the one the video model animates. One invocation, **one scene**. You write a prompt and **STOP**; the operator clicks **Generate** in the VideoStudio and **selects** a candidate. **You spend no credits.**

## Inputs

Required:

- `brief_id` — the approved brief. `get_brief` returns it **and** its idea **and** the channel.
- `scene_index` — **0-based**, and **required**. The dashboard's copy button emits it positionally: `/ssc-video <brief_id> keyframe <n>`. It is the scene's position in the approved Storyboard, so `## Cảnh 1` is `scene_index: 0`. Getting this off by one puts the prompt on the wrong scene, which nothing downstream will catch for you.

Optional:

- `revise: <note>` / a bare trailing `rewrite` — re-author this scene's saved keyframe prompt.

## Gate

1. **Brief + channel** — `get_brief`; channel must be `ad` or `post`, brief and idea both `approved`. Otherwise a clean Vietnamese STOP, nothing written.
2. **Storyboard approved** — `list_content({ brief: brief_id })` → `section='storyboard'`, `status='approved'`. Without one there are **no scene addresses at all**:

   > Chưa có **storyboard** được duyệt. Hãy chạy `/ssc-video <brief_id> storyboard` và duyệt nó trước. **Chưa có gì được ghi.**

3. **Scene index in range** — parse the approved board's `## Cảnh` headings. `scene_index` must be `0..N-1`. Out of range is a STOP naming the real range.
4. **The scene must be an AI scene.** `get_video_run(brief_id)` → `scene_sources[scene_index]`. An unset position means `'ai'`. If it is `'real'`, this scene is **filmed**, and its still arrives by **upload**, not generation:

   > Cảnh `<n>` được đánh dấu **quay thật**. Ảnh tĩnh và footage của cảnh này là **tải lên**, không phải tạo bằng AI. Hãy soạn **shot-plan** (`/ssc-video <brief_id> shotplan <n>`) rồi tải tư liệu lên trong VideoStudio. **Chưa có gì được ghi.**

   Authoring a prompt here anyway would produce a row the server refuses to generate from (`scene_is_real`) — a dead artifact that reads like progress.

## Grounding

- **This scene's `Hình`** from the approved Storyboard — the primary source. The keyframe is that description, made concrete.
- **This scene's `Lời`**, when it has one — it tells you what the frame has to *support*, not what to draw.
- **The idea's hero** and the **approved copy** (via `list_content`, `status='approved'`) — for meaning and register only. Never render a copy string as text in the image.
- **KB** — `visual/identity` for the brand's look; `rules/compliance` because a frame can carry a claim (a scale, a clinical setting, a before/after read) as surely as a sentence can.
- **The run's profile** — `get_video_run` gives the pinned `style_ref` and `aspect_ratio`. **Do not describe them in the prompt.** The server applies the style reference as a conditioning image and the aspect ratio as a generation parameter; re-describing them in words fights the mechanism that keeps 20 scenes looking like one video.

## What to write

A single free-form paragraph describing **one still frame**: subject, action held at a moment, setting, light, framing, lens feel. Concretely:

- **Describe the frame, not the motion.** "Cô ấy đang nâng ly nước, ánh sáng sớm xiên qua cửa sổ" — a held instant. The movement is the Clip step's job; a keyframe prompt full of verbs produces a blurred compromise.
- **Never bake in text.** No captions, no packaging copy, no on-screen words. The Text layer and the render's packaging own all of that.
- **Never negate.** "Không có logo" makes a logo more likely, not less. Describe what *is* there.
- **Keep continuity with the neighbouring scenes** — same person, same room, same time of day unless the board says otherwise. Read the adjacent scenes' `Hình` before you write.

## Save

```
save_creative_prompt(
  brief_id:    <brief_id>,
  layer:       'keyframe',
  scene_index: <n>,
  body:        <the prompt>
)
```

`scene_index` is **required** for this layer and the server refuses the call without it. Do **not** pass a `generation_config.model` unless the operator asked for a specific model — the run's pin and the registry default are the better answer, and the operator can override per step in the studio.

**A saved prompt or an already-selected candidate at this address does not block you.** Re-authoring costs nothing and cannot change an image that is already selected. Warn about staleness; never refuse.

## Looking at an existing candidate

You hold the read-only `view_image`. Use it **deliberately**, not as a sweep: the one warranted look is at **this scene's existing keyframe candidate** when re-authoring, to see what the previous prompt actually produced — the saved body records what was *asked for*, never what came out. Never look at every candidate in the run.

## STOP and report (Vietnamese)

> Đã lưu **prompt khung hình** cho cảnh `<n+1>` (`scene_index: <n>`) của brief `<brief_id>`.
> Bước tiếp theo: bạn bấm **Tạo** trong VideoStudio, chọn một khung hình, rồi chạy `/ssc-video <brief_id> clip <n>` để soạn prompt video cho cảnh này.

## Governance (hard rules)

- **Propose-only, zero-credit.** Reads + `save_creative_prompt` only. You never call `generate_keyframe`, `generate_clip`, `assemble`, or any other `generate_*`; never `approve` / `unapprove`; never `upload_creative` / `confirm_creative_upload` / `select_gallery_creative`; never `set_cover`, `reorder_gallery`, publish, or `update_budget`. **None of those appears in this skill's `tools:` list.** Saving a prompt is not approving and spends nothing.
- A refusal (`insufficient role` / `forbidden`) is a server-side permission — surface it in Vietnamese and stop; never retry with different arguments.
