## 1. Skill change

- [ ] 1.1 In `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md`, add `brief_id` to the `save_post_content` call so every saved ad content row records the angle brief it was written from. The value is the `brief_id` the skill already requires as an input and resolved via `list_briefs` — never inferred. Update the save step's prose, the frontmatter `description`'s mention of the save call, and any other place that enumerates the `save_post_content` arguments, so no statement in the file still describes a save without `brief_id`.
- [ ] 1.2 State in the skill that the server binds `brief_id` automatically **only for `post` content** — for `ad` content the skill MUST pass it explicitly, and an explicit value always wins. This is the reason the argument exists; a future editor who removes it as "redundant" reintroduces the wrong-angle bug.

## 2. Consistency

- [ ] 2.1 Confirm `save_post_content`'s live schema still accepts `brief_id` on any channel with the documented "an explicit value always wins" semantics, and that the argument name is exactly `brief_id`.
- [ ] 2.2 Check the sibling text producer `ssc-post-produce` — post content is already bound server-side, so it needs no change; confirm this rather than assuming it, and note the finding.

## 3. Verification

- [ ] 3.1 Verify against the delta spec: every requirement and scenario in `openspec/changes/ads-writer-brief-lineage/specs/ads-copy-brief-lineage/spec.md` has corresponding prose in the skill.
- [ ] 3.2 Confirm the change preserves `ssc-ads-writer`'s governance invariants: propose-only (saves DRAFT rows, never approves, never edits or deletes a row, never flips a gate), single MCP surface, Vietnamese persisted prose. Adding an argument must not touch any of them.
- [ ] 3.3 Live check (needs an approved concept + approved brief): produce one `copy` variation, then read it back with `list_post_content` and confirm the row's `brief_id` matches the brief it was written from.
