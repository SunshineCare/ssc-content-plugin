## Context

`ssc-ads-brief` is the first step of the brief-first ad flow: it takes ONE approved ad concept and proposes distinct strategic **angles**, each saved as its own DRAFT `brief` row with its own `angle_label`. The operator approves the ones worth producing. Each approved angle then anchors an independent production track — its own copy (`/ssc.ads-produce <idea_id> <brief_id>`) and its own creative chain (`/ssc.image-prompt <brief_id>`).

The skill was written when a brief was, in effect, a **throwaway handoff note**: produced once, read once by the copywriter, of no further consequence. Its Step 2 **produce-once guard** follows from that: `list_briefs` runs before any write, and if the idea already has ≥1 brief the skill STOPs, writes nothing, and routes the operator to the dashboard — *"to regenerate from scratch, discard all briefs in the dashboard first."* The guard's stated purpose is to prevent "brief pile-up", since nothing server-side caps the count.

**That premise is dead.** Verified live on **2026-07-14**: server "Change 2" has shipped. An idea carries N approved angle briefs (idea `BGerzuw4JrrSz3Qd` carries five, all labelled), each anchoring its own `content` rows (`content.brief_id`) and its own `creatives` chain (`creatives.brief_id`). A brief is now the **durable spine** of a production track. Two consequences the skill has not absorbed:

1. **The angle set can only be created, never grown.** There is no path to a sixth angle, and no path to replace angles the operator discarded — except razing every angle the concept has, along with everything produced from them. That is a real, currently-blocked operator need.
2. **The remediation instruction points at the most destructive action on the surface** and calls it a reset.

And the server's `delete(entity='brief')` semantics have not caught up either. Live today (from the tool's own description): a brief with creatives is **refused** (`brief_has_creatives` — "delete those visual layers first"), and the brief's content rows are **unbound**, not removed (`content.brief_id` is `ON DELETE SET NULL`, "the produced pieces survive with no brief"). Both behaviours were reasonable when a brief was a note. Now the first makes the operator hand-delete a chain of images to discard one angle, and the second **manufactures precisely the input that produces wrong-angle grounding**: an ad content row with no angle lineage. `/ssc.image-prompt` already has to defend against exactly that row (its multi-brief-no-lineage STOP), and the sibling change `ads-writer-brief-lineage` exists because a mis-attributed `brief_id` is silent and undetectable downstream.

## Goals / Non-Goals

**Goals:**

- `/ssc.ads-brief` can be re-invoked on an idea that already has briefs, and **appends** genuinely new angles to the set — the blocked operator need, unblocked.
- The distinctiveness rule the skill already enforces *within* a batch is extended *across* the whole existing set: a new angle is distinct from every brief the idea already carries, whatever its status.
- The skill remains structurally incapable of destroying produced work: it never deletes, edits, re-writes, or re-scores an existing brief, and holds no tool that could.
- The deletion story told to the operator is **accurate**: discarding an angle destroys that angle's production, and the prose says so rather than presenting it as a routine regeneration step.
- The server's brief-delete semantics are written down as a **contract** the BrandOS team can implement — approval-gated, cascading, capability-escalating, schedule-refusing, preflightable.

**Non-Goals:**

- **Implementing the server change.** The `delete` cascade lives in the BrandOS MCP server, not in this repo. The delta spec's server requirements are a handoff contract; nothing in `plugins/` can satisfy them.
- **Giving the skill a delete or edit tool.** Not "and gate it carefully" — not at all. See Decisions.
- **Touching `ads-image-prompt-authoring`.** `/ssc.image-prompt`'s copy gate (brief scope normal; single-brief idea-scope fallback, announced; multi-brief-no-lineage STOP) is correct and unchanged. The cascade only makes it *more* reliable, by deleting the orphan case out of existence rather than creating it.
- **De-duplicating or repairing the angle sets that already exist.** Whatever an idea carries today is the taken set; this change grows it going forward.
- **Changing `save_brief`.** It still mints DRAFTs only, one row per angle, and takes no `status`.

## Decisions

**Append is the regeneration story. There is no "regenerate" mode.**
The obvious alternative — keep the guard, add a `--force` / `regenerate` flag that discards and re-produces — was rejected. It preserves the destructive path as the *supported* one and hands a propose-only agent a reason to hold a destructive tool. Append gets the operator what they actually want (more angles, better angles) with **zero** destruction: unwanted angles are simply never approved, and stay as drafts the operator can discard *in the dashboard, deliberately, seeing the blast radius*. "Regeneration" as a distinct operation dissolves.

**The taken set includes DRAFT briefs, not just approved ones.**
`list_briefs(idea)` returns every brief regardless of status, and the skill treats them all as taken. *Alternative considered:* only treat **approved** briefs as taken, so a rejected/ignored draft angle can be re-proposed. Rejected: an angle sitting as an un-approved draft is an angle the operator has already been shown and has not chosen — re-proposing it is noise, and worse, it is noise that *looks* like new work. If the operator wants that angle gone from the set, they discard it (a brief with no dependents deletes cheaply — see the capability-escalation decision); until then it is taken.

**Writing nothing is a legitimate, non-exceptional outcome.**
Today an empty result only happens in a degenerate case (no angle reached ≥4). Under append it becomes **routine**: an idea that has already yielded five angles will often support no sixth. The skill must report "no further distinct angle" as a clean, ordinary result — not an error, not a near-miss, and above all not a reason to relax distinctiveness. *Alternative considered:* always produce at least one angle per invocation. Rejected outright: it guarantees near-duplicates over time, and a duplicate angle is not a harmless extra row — it is a **wasted production track** (its own copy run, its own image chain, its own fal credits) and a curation trap, since two near-identical `angle_label`s are exactly what the operator cannot tell apart at a glance.

**The skill never holds `delete` or `edit`.**
Not "holds them and is told not to use them". The tools do not appear in its `tools:` frontmatter, so the failure mode is a missing tool rather than a disobeyed instruction. This is what makes the propose-only invariant structural: the skill can only ever *add* to the angle set. It is also why the append design is the safe one — it needs no destructive capability to do its whole job.

**Deletion prose is replaced, not softened.**
The "discard ALL briefs to regenerate" line is **deleted**, because the operation it describes is no longer the way to get new angles. What replaces it is not a gentler version of the same instruction but a different statement: what deleting an angle *costs* — the brief is HARD-deleted (the `briefs` table has no tombstone; the angle is gone for good), and the cascade takes its copy and its creatives with it. The skill's job here is to make sure an operator who *does* want to discard an angle knows what they are destroying; it is not to recommend it.

**Server: cascade, rather than refuse-with-instructions.**
Today's `brief_has_creatives` refusal tells the operator to hand-delete each visual layer first — which means performing the irreversible media purges **one at a time, without a single confirmation covering the whole act**, and with a half-deleted chain as the failure mode. A cascade is *safer*, not more dangerous, because it is one atomic, individually-audited, preflightable transaction: the operator sees the full blast radius once, and either all of it happens or none of it does. *Alternative considered:* keep the refusal. Rejected — it does not prevent the destruction, it only makes it manual, unatomic, and unmeasured.

**Server: cascade the content rows too — do not unbind them.**
Today `content.brief_id` is `ON DELETE SET NULL`: the copy survives, orphaned, attributable to no angle. That looks conservative ("we didn't delete the operator's work") and is in fact the most dangerous option available, because an unattributable ad content row is **exactly** the input that produces wrong-angle grounding downstream — the hazard `/ssc.image-prompt`'s STOP branch and the sibling change `ads-writer-brief-lineage` both exist to contain. Copy written *from* an angle is not independent of that angle; it is that angle's output. If the angle is destroyed on purpose, its output goes with it. Stranding it preserves bytes and destroys meaning.

**Server: capability escalates with blast radius.**
A brief with no dependents is a cheap, near-reversible discard (re-run `/ssc.ads-brief` and get another angle) — `edit` is proportionate. A brief with dependents destroys copy and purges images across a service boundary — that requires **`approve`**. This is the server's own established principle, already stated in its `delete` tool description: *"destroying is a stronger move than demoting, so it must not be reachable at a weaker capability."* The load-bearing consequence: agents hold `edit` and never `approve`, so **no agent can ever reach a cascading delete**, whatever a future skill's prose says. The propose-only invariant stops depending on prose and starts being enforced by the server.

**Server: refuse when the work is live.**
If any of the brief's content rows is referenced by a live schedule entry, the whole delete is refused, atomically, writing nothing. Deleting an angle must never be able to silently unschedule a running ad. This mirrors the existing `content` delete guard (already refused while a live schedule row references it) — the cascade must not become a way to route around it.

**Server: preflight before an irreversible act.**
The delete must be able to report what it *would* destroy — counts of creatives, images, and content rows — so the dashboard can show the operator the blast radius before they commit. Whether that is a `dry_run` flag on `delete` or a separate preflight read is the server's call; the requirement is that the number exists and is available *before* the destruction, not in the audit log after it.

## Risks / Trade-offs

[Angle drift: with no cap, an idea accumulates angles indefinitely, and the "distinct from all N" judgement degrades as N grows] → The distinctiveness bar is the cap, and it tightens automatically: each existing angle removes a persona trigger/objection/myth from the available pool, so the honest supply of new angles is self-limiting. The skill's never-pad rule is what enforces it, and the design promotes "wrote nothing" from a degenerate case to an ordinary, expected outcome precisely so the skill has an un-embarrassing way to stop.

[The skill judges distinctiveness against existing briefs by reading their prose — a soft, model-side check, not a constraint the server enforces] → True, and unavoidable: distinctiveness is a semantic property, and nothing in the schema can enforce it. It is mitigated by giving the skill the *full* narrative fields of every existing brief (not just `angle_label`) as the comparison basis, and by keeping the ≥4 self-score gate — a near-duplicate caps low on the distinctiveness criterion and is dropped by the existing quality loop, which now scores against the whole set rather than the batch.

[The plugin change ships before the server cascade, so the skill's new "what deletion costs" prose could describe semantics the server does not yet have] → The prose must describe the **current** server behaviour honestly at the time it ships (today: an approved brief is refused; a brief with creatives is refused and the layers must be deleted first; content is unbound, not deleted). The delta spec's server requirements are the *target*; the skill's prose follows the server, never leads it. The two are decoupled on purpose — the append change is valuable and safe on its own, with or without the cascade.

[The cascade is irreversible and crosses a service boundary (media purge on the Go asset service), so a bug there destroys operator work with no undo] → This is why the design insists on all four properties together and not just the cascade: approval gate (an approved brief cannot be reached at all), capability escalation (no agent can reach it), schedule refusal (live work is untouchable), and preflight (the operator sees the count before committing). Any three of the four without the fourth is a materially worse design; the cascade alone would be reckless.

## Migration Plan

**Plugin (this repo):** edit `plugins/ssc-content/skills/ssc-ads-brief/SKILL.md` and `plugins/ssc-content/commands/ssc.ads-brief.md` in place on `main` (no worktrees, per CLAUDE.md). No data migration; no coordination with the server; the append behaviour uses only tools the skill already holds (`list_briefs`, `save_brief`). Rollback is a `git revert` — it restores the produce-once guard, which is inert on ideas with no briefs and blocking on ideas that have them. Briefs appended in the interim are ordinary brief rows and survive a revert untouched.

Local iteration follows the plugin cache rules in CLAUDE.md: a same-version content edit is **not** picked up by `claude plugin update`, so uninstall + reinstall (`claude plugin uninstall ssc-content@ssc-content-plugin && claude plugin install ssc-content@ssc-content-plugin`) and restart Claude Code.

**Server (BrandOS, separate repo, separate team):** the `delete(entity='brief')` requirements in the delta spec are a handoff contract, not work this change performs. They can ship independently and in any order relative to the plugin change. When they land, `ssc-ads-brief`'s "what deletion costs" prose is updated to describe the cascade (a one-paragraph follow-up, tracked in tasks.md).

## Open Questions

- **The `save_post_content` inference rule** (tracked on the sibling change `ads-writer-brief-lineage`). For `ad` content the server binds a `brief_id` **by INFERENCE** when the caller omits one, picking one of the idea's N briefs. Now that `ON DELETE SET NULL` is being replaced by a cascade, a NULL `brief_id` becomes **rare** — which makes the inference even more indefensible: it is guessing a value that is almost never legitimately absent, and a wrong guess is silent and undetectable. **Recommendation: the server should REJECT an omitted `brief_id` on ad content** rather than guess one. Not resolved here; a server decision.
- **N parallel visual chains per brief — does `/ssc.image-prompt` have the wrong state machine?** The live `delete` / `edit` tool descriptions say a creative belongs to *"one of a brief's N **PARALLEL** visual chains"* and that a layer *"may legitimately carry SEVERAL approved creatives at once (one per chain)"*, with `set_cover` choosing the hero composite. `/ssc.image-prompt` assumes **ONE linear chain per brief** — a layer is done once it has *any* approved creative. Live data can neither confirm nor refute this (no brief yet has an approved creative), and **the server's tool docs have already proven wrong once today** (`list_briefs` still describes "exactly one row per idea this change" although Change 2 has shipped). **This must be settled before it bites:** if chains really are parallel, `/ssc.image-prompt`'s state machine advances on the wrong chain — it would treat one chain's approved background as satisfying every chain's background layer. Not resolved here; needs a server answer, not a guess.
- **Do existing orphaned / mis-stamped ad content rows need a server audit?** (tracked on `ads-writer-brief-lineage`.) Rows written before the lineage fix carry a server-inferred `brief_id` that may name the wrong angle; rows whose brief was deleted under today's `SET NULL` carry none at all. The cascade prevents new ones; it heals nothing existing. Whether the server audits or re-stamps them is a server decision the plugin cannot make — it has no record of which angle each historical row was written from.
