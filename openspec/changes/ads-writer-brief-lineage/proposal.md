## Why

`ssc-ads-writer` takes a **required** `brief_id` — every section it produces is written from that one chosen angle — but it saves the row **without** it: `save_post_content(channel='ad', idea_id, section, body, score, comment)`. The server binds `brief_id` automatically **only for `post` content**, so every **ad** content row ends up with a null `brief_id`. The lineage is known at write time and thrown away at the last step.

That already has a live consequence. `/ssc.image`'s approved-copy gate is specified as brief-scoped ("≥1 approved `copy` **for that brief**") but cannot enforce it — it degrades to idea scope and must announce the fallback (see the Drift Log in `openspec/changes/ssc-image-brief-copy-rewrite/design.md`). Today that is safe only because the server persists exactly one brief per idea. When server **Change 2** lands (N briefs per idea), copy approved for angle A will silently satisfy the gate for angle B, and the visual will be grounded in the wrong angle's story — at fal-credit cost, with no stop. This change must land **before or with** Change 2.

## What Changes

- `ssc-ads-writer` passes `brief_id` to `save_post_content` on every save, for every section (`copy`, `headline`, `description`, `image_content`). The value is the `brief_id` the skill already required as an input and already wrote the section from — nothing new is derived or guessed.
- `save_post_content` already accepts `brief_id` on any channel and documents that "an explicit value always wins", so no server change is needed.
- `/ssc.image`'s approved-copy gate stops degrading: once ad rows carry a `brief_id`, its preferred brief-scoped filter fires and the idea-scope fallback (and its announcement) becomes dead code for new rows. **Rows written before this change keep a null `brief_id`** and continue to match at idea scope — the fallback must stay until they age out or are backfilled.

## Capabilities

### New Capabilities

- `ads-copy-brief-lineage`: every ad content row records the angle brief it was written from, so downstream consumers (notably `/ssc.image`'s copy gate) can resolve "the approved copy for *this* angle" unambiguously.

### Modified Capabilities

None. `ads-image-visual`'s two-scope gate already specifies the brief-scoped path as preferred; this change simply makes that path reachable. No requirement of it changes.

## Impact

- **Modified:** `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` — the `save_post_content` call and the prose describing it.
- **Unblocks:** the brief-scoped arm of `/ssc.image`'s approved-copy gate.
- **Prerequisite for:** server **Change 2** (N briefs per idea). Landing Change 2 without this reintroduces wrong-angle grounding.
- **Backfill (out of scope, worth knowing):** existing ad content rows have a null `brief_id` and cannot be attributed retroactively by the plugin. Since each idea currently has exactly one brief, a server-side backfill could bind them unambiguously — but only while that one-brief-per-idea invariant still holds, i.e. **before** Change 2.
- **No automated tests** exist in this repo; verification is by review plus a live save + `list_post_content` read confirming the row carries the `brief_id`.
