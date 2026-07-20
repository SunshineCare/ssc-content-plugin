## Context

`ssc-ads-writer` is the TEXT producer of the ad pipeline. It requires an approved `brief_id` as input, writes every section from that one angle, and then saves each variation with `save_post_content(channel='ad', idea_id, section, body, score, comment)` — dropping the `brief_id` it already holds.

The server's `save_post_content` accepts an optional `brief_id` and documents: *"for `post` content the idea's single brief is resolved server-side when omitted; an explicit value always wins."* What the live surface actually does for **`ad`** content is bind a `brief_id` **by inference** — it picks one of the idea's approved briefs. Omitting the argument therefore does not produce a null; it produces a **stamp the writer did not choose**.

Two facts, both verified against live server data on **2026-07-14**, make that a live defect rather than a cosmetic one:

1. **Server "Change 2" has shipped.** An idea carries N briefs, each with a populated `angle_label`. Idea `BGerzuw4JrrSz3Qd` has **five**, all `status='approved'`, all labelled. So the server's inference is a pick out of five, not a foregone conclusion.
2. **The inference already stamped real rows.** All **20** ad content rows on that idea carry `brief_id: "IeZb6HjExf2PtUJD"` — written by a version of `ssc-ads-writer` that never passed one.

The hazard is not a missing value; it is a **silently wrong** one. `/ssc.image-prompt` resolves "the approved copy for *this* angle" by filtering `list_post_content` on `brief_id`. A mis-inferred stamp matches that filter exactly like a correct one: no error, no empty result, no signal of any kind. The visual is grounded in another angle's story and nothing downstream can tell. A null would at least have been detectable.

## Goals / Non-Goals

**Goals:**

- Every ad content row written by `ssc-ads-writer` records the `brief_id` it was **written from** — the operator's chosen angle — for all four sections (`copy`, `headline`, `description`, `image_content`), overriding the server's inference ("an explicit value always wins").
- `/ssc.image-prompt`'s brief-scoped copy filter fires on a stamp that is true by construction, rather than on one the server guessed.
- The skill records *why* the argument is mandatory, so it is not removed later as redundant.

**Non-Goals:**

- Repairing ad content rows that carry a **wrong** server-inferred `brief_id`. The plugin cannot distinguish an inferred stamp from an explicit one — it has no record of which angle each historical row was written from. See Open Questions.
- Changing `/ssc.image-prompt`'s three-way copy-scope rule (brief scope normal; single-brief idea-scope fallback, announced; multi-brief no-lineage → STOP). That rule is already shipped and already correct.
- Any change to `ssc-post-produce` / post content, which the server binds correctly (and which `ssc-post-produce` does not even save — `ssc-post-authority` does).
- **Implementing** the server requirements below. They live in the BrandOS MCP server, not in this repo; nothing in `plugins/` can satisfy them, and the plugin fix does not wait on them — the server already honours an explicit `brief_id` on any channel, so passing it works today.

## Decisions

**Pass the `brief_id` the skill already has, rather than letting the server infer one.**
`ssc-ads-writer` takes `brief_id` as a required input and resolves the brief via `list_briefs`, filtered to that one id — the value is already in hand at save time and is, by construction, the angle the section was written from. *Alternative considered:* let the server keep inferring the brief for ad content. Rejected — this is not a hypothetical alternative, it is **what happens today**, and it is precisely the bug: with N approved briefs per idea (live), the inference picks one of several and can pick wrong, and the result is indistinguishable from a correct stamp. Inference is exactly the wrong tool for a value the caller already knows.

**Set `brief_id` on every section, not just `copy`.**
Only `copy` gates `/ssc.image-prompt` today, so a minimal fix could set it on `copy` alone. Rejected: `headline`, `description`, and `image_content` are equally angle-specific, and the same silent wrong-angle stamp will hit any future consumer that reads them per-angle. The lineage is free to record; a partially-explicit column is worse than either extreme, because the sections left to inference would carry a stamp that *looks* exactly as authoritative as the ones the writer chose.

**Say in the skill why the argument exists.**
A `brief_id` the caller passes and a `brief_id` the server infers are indistinguishable in the stored row, so an editor who removes the argument sees **no change in the data shape** — the field stays populated. Nothing about the row would reveal the regression. The skill therefore states the hazard in prose ("omitting it does NOT null the field — the server infers an angle and can stamp the wrong one silently"), so the argument reads as load-bearing rather than redundant.

**Leave `/ssc.image-prompt`'s narrowed fallback alone.**
`/ssc.image-prompt` now applies brief scope as the normal path, falls back to idea scope **only** when no approved copy row carries a `brief_id` at all **and** the idea has exactly one brief (checked at runtime via `list_briefs`, and announced), and **STOPs** when lineage-less rows meet a multi-brief idea. That rule is correct and self-limiting: it needs no edit when this change lands, and it degrades to a STOP rather than a guess in the one case it cannot resolve. *Alternative considered:* have this change also tighten `/ssc.image-prompt`. Rejected — it is already tight, and this change explicitly does not touch that skill.

## Server Requirements

Two server-side requirements are **decided** (owner, 2026-07-14). They live in the BrandOS MCP server, are a handoff contract rather than work this change performs, and can ship in any order relative to the plugin fix — which does not depend on them.

**A. For `ad` content, `save_post_content` MUST REJECT an omitted `brief_id` — never infer one.**
A call that omits `brief_id` on `ad` content is refused (`invalid_input` class) and writes nothing. The distinction is not stylistic: inference is *defensible* for `post` content, where the idea's single brief resolves unambiguously and the server's guess is the only possible answer; it is *indefensible* for `ad` content, where the idea carries N approved angles and the guess is a pick out of several. The caller always knows the angle it wrote from — `ssc-ads-writer` takes `brief_id` as a required input — so a server guess adds no information and can only ever be wrong. A wrong guess is silent: the stamped angle is indistinguishable from a chosen one and undetectable downstream. Refusing is strictly better than guessing, because it converts an invisible wrong answer into a visible error at the only moment a caller can still fix it.

**B. Existing `content` rows with `brief_id IS NULL` MUST be DELETED.**
A content row with no angle cannot be attributed to any brief. It can never be safely consumed — it is exactly the row that makes `/ssc.image-prompt` STOP rather than risk grounding a visual in the wrong angle's story — and it cannot be repaired by the plugin, which has no record of which angle each historical row was written from. These rows are unusable, not merely untidy; the owner's decision is to purge them.

**The two interact — after both, a NULL `brief_id` on ad content is an impossible state.** Requirement A closes the *write* path: an ad content row can no longer be created without a `brief_id`. The sibling change `ads-angle-set-curation` closes the *other* path: it replaces `content.brief_id ON DELETE SET NULL` with a cascade that hard-deletes an angle's copy along with the angle, so deleting a brief no longer strands its rows with a null. With both landed, nothing produces a NULL `brief_id` on ad content from any direction — which is precisely what makes requirement B a **one-time cleanup** rather than a recurring chore. Ordering note: run the purge *after* A and the cascade land, or it will simply have to be run again.

## Risks / Trade-offs

[Existing ad content rows carry a server-inferred `brief_id` that may name the wrong angle, and no consumer — including `/ssc.image-prompt` — can detect it] → This change stops the bleeding for new rows but cannot heal old ones, and requirement B does not reach them either: the purge takes only the **null** rows, while a wrong stamp is a *populated* field that looks exactly like a correct one. The shipped `ssc-image-prompt-*` skills therefore keep their standing caution: a `brief_id` on an older row may have been inferred rather than supplied, the lineage is good enough to gate on (strictly better than guessing) but is not infallible, and **if a visual comes back telling the wrong angle's story, the row's `brief_id` lineage is the first thing to check**. A server-side audit is the only real remedy — and one cheap signal for it now exists (see Open Questions).

[An explicit `brief_id` and an inferred one are indistinguishable in the stored row, so the regression from dropping the argument would be invisible] → The reason is stated in the skill itself, in the save step, in the frontmatter description, and in the Governance section — three places a future editor would have to override on purpose. There is no data-shape check that could catch it, so prose is the whole defence, and it is written to be unambiguous.

[No automated tests in this repo, so a silently-dropped argument would not be caught by CI] → Verification is a live save followed by a `list_post_content` read confirming the returned row carries the `brief_id` the writer passed — not merely *a* `brief_id` (the server supplies one either way), but **the chosen one**.

## Migration Plan

Edit `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` in place on `main` (no worktrees, per CLAUDE.md). No server change, no data migration, no coordination: the argument is additive and the server already accepts it, with an explicit value taking precedence over its inference.

Rollback is a `git revert` of the commit — but note what a revert restores: not "no lineage", but **server-inferred lineage**, i.e. the wrong-angle hazard. Rows written in the interim keep their explicit `brief_id`, which is harmless and strictly better than what surrounds them.

Local iteration follows the plugin cache rules in CLAUDE.md: a same-version content edit is not picked up by `claude plugin update`, so uninstall + reinstall (`claude plugin uninstall ssc-content@ssc-content-plugin && claude plugin install ssc-content@ssc-content-plugin`) and restart Claude Code.

## Open Questions

One question remains open. (The two that stood here before — whether the server should stop inferring, and what to do about lineage-less rows — are **resolved**: see Server Requirements A and B.)

- **Do the rows carrying a WRONG (server-inferred) `brief_id` get audited?** Requirement B's purge does not touch them: they are not null, they are simply not *chosen*, and they look exactly like correct rows. Live data shows all 20 ad content rows on the five-brief idea `BGerzuw4JrrSz3Qd` stamped with the *same* `brief_id` (`IeZb6HjExf2PtUJD`), and nothing documents the rule that produced it (first approved? most recent? lowest id?) or says it is the angle any of those rows was actually written from. **One cheap audit signal was found live:** each content row's `comment` is a Vietnamese rationale that usually **names the brief it was written from** — e.g. *"Hiện thực đúng hook_direction của brief (tủ đồ mùa hè…)"* — so attribution is often recoverable by comparing the row's `comment` against the stamped brief's `angle_label`, far cheaper than re-deriving the angle from the body. Whether to run that audit is the owner's call. The plugin cannot make it: it has no record of which angle each historical row came from.

## Drift Log

### The premise was "the row persists with a null `brief_id`" — it does not

**Original premise.** This change was written on the belief that the server binds `brief_id` automatically **only for `post` content**, so every ad content row saved without one persists with a **null** `brief_id`. The Why, the Context, the risks, and the delta spec were all argued from that null. The proposed fix (pass `brief_id`) was correct; the reason given for it was not.

**What live data showed (2026-07-14).** Ad rows do **not** get a null. The server binds a `brief_id` for `ad` content **by inference**, choosing one of the idea's approved briefs: all 20 rows on idea `BGerzuw4JrrSz3Qd` — which carries **five** approved, labelled briefs — came back stamped `IeZb6HjExf2PtUJD`, written by a writer that never passed one. Server "Change 2" (N briefs per idea) had already shipped, so the inference was a pick out of five.

**Why it matters that the premise was wrong.** It makes the change **more** urgent, not less. A null is a detectable absence — a consumer can see it and refuse to guess. An inferred stamp is a silent, possibly-wrong presence: `/ssc.image-prompt`'s brief-scoped filter matches it exactly like a correct one, so a visual can be grounded in another angle's story with no error, no empty result, and no downstream check capable of catching it. The artifacts have been rewritten to the inference premise; the fix itself is unchanged.
