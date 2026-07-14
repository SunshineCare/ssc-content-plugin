## Context

`ssc-ads-writer` is the TEXT producer of the ad pipeline. It requires an approved `brief_id` as input, writes every section from that one angle, and then saves each variation with `save_post_content(channel='ad', idea_id, section, body, score, comment)` — dropping the `brief_id` it already holds.

The server's `save_post_content` accepts an optional `brief_id` and documents: *"for `post` content the idea's single brief is resolved server-side when omitted; an explicit value always wins."* The automatic binding is scoped to `post` content only. Nothing binds it for `ad` content, so ad rows persist with a null `brief_id`.

The gap surfaced during the `ssc-image-brief-copy-rewrite` review: `/ssc.image` specifies a brief-scoped approved-copy gate, discovered it could not enforce one, and now falls back to idea scope with a mandatory announcement. That is a correct stopgap, not a fix — it is only sound while the server persists one brief per idea.

## Goals / Non-Goals

**Goals:**

- Every ad content row written by `ssc-ads-writer` records the `brief_id` it was written from, for all four sections (`copy`, `headline`, `description`, `image_content`).
- `/ssc.image`'s preferred brief-scoped copy filter becomes reachable for newly-written rows.
- The change is small enough to land well ahead of server Change 2.

**Non-Goals:**

- Backfilling the `brief_id` of ad content rows written before this change. The plugin cannot attribute them (it has no record of which angle each row came from); a server-side backfill is possible while one-brief-per-idea still holds, but it is not this change.
- Removing `/ssc.image`'s idea-scope fallback or its announcement. Pre-existing rows still carry a null `brief_id`, so the fallback must remain until they age out or are backfilled.
- Any change to `ssc-post-produce` / post content, which the server already binds correctly.
- Any server change. None is needed.

## Decisions

**Pass the `brief_id` the skill already has, rather than deriving one.**
`ssc-ads-writer` takes `brief_id` as a required input and resolves the brief via `list_briefs`, filtered to that one id — the value is already in hand at save time and is, by construction, the angle the section was written from. *Alternative considered:* let the server infer the brief for ad content the way it does for post content. Rejected: the inference is only unambiguous while an idea has exactly one brief, which is precisely the invariant Change 2 removes. Inferring the very thing that is about to become ambiguous would bake the bug into the server instead of the skill.

**Set `brief_id` on every section, not just `copy`.**
Only `copy` gates `/ssc.image` today, so a minimal fix could set it on `copy` alone. Rejected: `headline`, `description`, and `image_content` are equally angle-specific, and the same wrong-angle ambiguity will hit any future consumer that reads them per-angle. The lineage is free to record; a partially-populated column is worse than either extreme because it invites consumers to assume it is always present.

**Leave `/ssc.image`'s fallback in place.**
Rows written before this change keep a null `brief_id` forever unless backfilled. Removing the fallback would make `/ssc.image` STOP on concepts whose copy predates this change. *Alternative considered:* remove the fallback and require a backfill first. Rejected: it couples a one-argument plugin fix to a server migration, and the fallback is already loud — it announces itself, so it cannot rot silently.

## Risks / Trade-offs

[Pre-existing rows keep a null `brief_id`, so the idea-scope fallback stays live and the wrong-angle risk is only *partially* retired before Change 2] → `/ssc.image` announces every idea-scope match, so the exposure is visible per-run rather than silent; and the residual risk is bounded to concepts whose copy was written before this change. A server-side backfill (unambiguous only while one-brief-per-idea holds) closes it fully and should be done before Change 2.

[A consumer might assume `brief_id` is always populated once this ships, and skip the null case] → The proposal, this design, and `/ssc.image`'s Step 3 all state that historical rows carry null. Any consumer must handle both.

[No automated tests in this repo, so a silently-dropped argument would not be caught] → Verification is a live save followed by a `list_post_content` read confirming the returned row carries the `brief_id`.

## Migration Plan

Edit `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` in place on `main` (no worktrees, per CLAUDE.md). No server change, no data migration, no coordination: the argument is additive and the server already accepts it.

Rollback is a `git revert` of the commit — and unlike the `/ssc.image` rewrite, it is a genuine rollback: dropping the argument returns the skill to today's behaviour with no server incompatibility. Rows written in the interim keep their `brief_id`, which is harmless.

Local iteration follows the plugin cache rules in CLAUDE.md: a same-version content edit is not picked up by `claude plugin update`, so uninstall + reinstall (`claude plugin uninstall ssc-content@ssc-content-plugin && claude plugin install ssc-content@ssc-content-plugin`) and restart Claude Code.

## Open Questions

- **Should the server backfill `brief_id` on existing ad content rows?** It is unambiguous today (one brief per idea) and impossible after Change 2. If it is going to happen, it must happen first. This is a server decision, recorded here because the window closes.
