## Why

`ssc-ads-writer` takes a **required** `brief_id` — every section it produces is written from that one chosen angle — but it saves the row **without** it: `save_post_content(channel='ad', idea_id, section, body, score, comment)`. The lineage is known at write time and dropped at the last step.

Omitting it does **not** leave the field empty. Verified against live server data on **2026-07-14**: the server binds a `brief_id` for `ad` content too — **by INFERENCE**, picking one of the idea's approved briefs. Idea `BGerzuw4JrrSz3Qd` carries **five** approved angle briefs, each with its own `angle_label`, and **all 20** of its ad content rows came back stamped with a single `brief_id` (`IeZb6HjExf2PtUJD`) — written by a version of `ssc-ads-writer` that never passed one. The writer's chosen angle was discarded and replaced by the server's guess.

**A silently-inferred stamp is worse than a null.** A null is visible: a consumer can see the lineage is missing and refuse to guess. A wrong `brief_id` is indistinguishable from a right one — nothing errors, nothing looks empty. `/ssc.image` resolves *"the approved copy for **this** angle"* by filtering `list_post_content` rows on `brief_id`; a mis-inferred stamp still matches that filter, so the visual gets grounded in copy written for a **different** angle and tells the wrong story, at fal-credit cost, with **nothing downstream able to detect it**.

This is live, not latent. Server **"Change 2"** (N briefs per idea, `angle_label` persisted) **has shipped** — an idea routinely carries several approved angles, so the brief the server infers is a pick out of five, not a foregone conclusion. `save_post_content` documents that **an explicit value always wins**, so passing `brief_id` is the one thing that overrides the inference.

## What Changes

- `ssc-ads-writer` passes `brief_id` to `save_post_content` on every save, for every section (`copy`, `headline`, `description`, `image_content`). The value is the `brief_id` the skill already required as an input and already wrote the section from — nothing new is derived or guessed.
- `save_post_content` already accepts `brief_id` on any channel and documents that "an explicit value always wins", so the plugin fix needs **no server change and waits on none**: the explicit value **overrides the server's inference** today. (Two server requirements are nonetheless now decided — see Impact A and B — and are handed off separately.)
- The skill states **why** the argument exists — omitting it stamps an inferred, possibly wrong angle — so a future editor cannot remove it as "redundant" and silently reintroduce wrong-angle grounding.
- `/ssc.image`'s approved-copy gate takes **brief scope as its normal path** (ad rows carry a `brief_id`). Its idea-scope fallback narrows to rows carrying **no** `brief_id` at all, and only when the idea has exactly **one** brief; a lineage-less row on a multi-brief idea makes `/ssc.image` **STOP**.

## Capabilities

### New Capabilities

- `ads-copy-brief-lineage`: every ad content row records the angle brief it was **written from** — the operator's chosen brief, not one the server inferred — so downstream consumers (notably `/ssc.image`'s copy gate) can resolve "the approved copy for *this* angle" from a trustworthy stamp.

### Modified Capabilities

None. `ads-image-visual`'s copy gate already specifies brief scope as the normal path; this change is what makes the `brief_id` it filters on the angle the copy was actually written from, rather than a server guess. No requirement of it changes.

## Impact

- **Modified:** `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` — the `save_post_content` call, the frontmatter description, and the prose explaining why the argument is mandatory.
- **Fixes:** the trustworthiness of `/ssc.image`'s brief-scoped copy gate. The gate fires either way — it filters on `brief_id`, and the server supplies one — so before this change it fires on a **stamp nobody chose**.
- **Urgency:** server **Change 2** has already shipped (N briefs per idea, verified live). The wrong-angle hazard is therefore **live today**, not a future risk, and it is silent.
- **Server requirement A — REJECT, never infer (DECIDED, server-side):** for `ad` content, `save_post_content` MUST **reject** a call that omits `brief_id` — an `invalid_input`-class refusal that writes nothing — and MUST NOT infer a brief. Today it silently binds one by inference, picking one of the idea's N approved briefs: a stamped angle the caller never chose, indistinguishable from a chosen one, and undetectable downstream. Inference is defensible for `post` content (the idea's single brief resolves unambiguously) and indefensible for `ad` content (N approved angles). The caller always knows the angle it wrote from; a server guess can only ever be wrong.
- **Server requirement B — PURGE the lineage-less rows (DECIDED, server-side):** existing `content` rows whose `brief_id` **IS NULL** MUST be **deleted**. A content row with no angle cannot be attributed to any brief, can never be safely consumed (it is exactly what makes `/ssc.image` STOP rather than risk grounding a visual in the wrong angle's story), and cannot be repaired by the plugin, which has no record of which angle each historical row was written from. They are unusable, not merely untidy.
- **The two interact — NULL `brief_id` on ad content becomes an impossible state:** once requirement A lands, an ad content row can no longer be *written* without a `brief_id`. And the sibling change `ads-angle-set-curation` replaces `content.brief_id ON DELETE SET NULL` with a cascade that hard-deletes an angle's copy along with the angle — so a NULL `brief_id` stops being produced from that direction too. After both, NULL `brief_id` on ad content is unreachable, which is what makes requirement B a **one-time cleanup** rather than a recurring chore.
- **Still open — the wrong-stamp audit:** rows carrying a **wrong** (server-inferred) `brief_id` — not null, but not chosen either — are untouched by the purge and look exactly like correct rows. One cheap audit signal exists (found live): each content row's `comment` is a Vietnamese rationale that usually **names** the brief it was written from, so attribution is often recoverable by comparing the comment against the stamped brief's `angle_label`. Whether to run that audit is the owner's call — the one remaining unknown (see design.md).
- **No automated tests** exist in this repo; verification is by review plus a live `list_post_content` read confirming rows carry the `brief_id` the writer passed (that read has been performed — see tasks.md 3.3).
