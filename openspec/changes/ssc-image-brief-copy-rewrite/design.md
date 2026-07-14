## Context

`ssc-image` is the visual work-unit skill of the `ssc-content` plugin — the visual
sibling of `ssc-ads-writer`. It walks one approved ad concept's creative chain
(`background → model → product → composite`) one layer per invocation, saving DRAFT
creatives to BrandOS and stopping at each human approval gate. `/ssc.image` dispatches
it directly (no agent), per the exception noted in `CLAUDE.md`.

Two premises the shipped skill is built on are now false, and both are load-bearing —
which is why this is a rewrite rather than an edit.

1. **The anchor is wrong.** The shipped skill hangs the whole chain off an approved
   `image_content` content row (the "variant"), resolves its `image_content_id` from
   the brief, and keys every generate / compose / read call on it. But `image_content`
   is the **on-image overlay text** — the dashboard applies it *over the finished
   visual* at a later stage. It is neither the source of the visual's meaning nor a
   legitimate gate on producing it. The visual's meaning comes from the **angle brief**
   (which angle this ad takes) and the **approved copy** (the story the ad actually
   tells).

2. **The prompt contract is wrong.** The shipped skill passes `prompt_hints` —
   fragments that the *server* merged into a prompt it assembled itself (folding in the
   variant text and the idea's creative brief). The BrandOS surface no longer does this.
   It now takes a **full scene prompt, verbatim**, persists it as the layer's prompt row,
   and generates from that saved body. `prompt_hints` and server-side assembly are gone.
   The prompt is now the skill's work product, and it must be authored in full.

The server has additionally re-keyed the entire visual chain on `brief_id`;
`image_content_id` no longer appears anywhere on the creative surface. So the anchor,
the preconditions, the grounding, the prompt contract, the tool signatures, and the
per-layer loop all change together.

The approved brainstorm design is
`docs/superpowers/specs/2026-07-14-ssc-image-brief-copy-rewrite-design.md`; it
supersedes the three earlier `ssc-image` design specs (2026-07-13, 2026-07-05,
2026-07-03). This document extracts the decisions that gate the spec deltas and tasks.

## Goals / Non-Goals

**Goals:**

- Re-anchor the creative chain on the approved **angle brief** (`brief_id`) — the key
  for every tool call — and remove `image_content` from the command entirely.
- Make an **approved `copy` row for that brief** a hard precondition, so every visual
  is grounded in the story the ad actually tells.
- Move prompt authorship into the skill: it writes the **complete scene prompt** that
  reaches the image engine unmodified, under a hard prompt contract (never name the ad
  copy; never negate; reserve space geometrically, in the positive).
- Realign the skill to the live tool signatures: no `n` parameter, no `prompt_hints`,
  no `uploaded_media_id`; `compose_ad_visual` names both approved input creatives.
- Add a **prompt-level revise path** (`revise: <note>`) so operator corrections change
  the text that reaches the engine instead of triggering a blind re-roll.
- Preserve every governance invariant unchanged: propose-only, single MCP surface,
  save-to-server (never present-in-chat), no baked-in text, product upload-only, ad
  channel only, Vietnamese operator prose.

**Non-Goals:**

- `/ssc.ads-brief` and `/ssc.ads-produce` — untouched. The `image_content` text section
  keeps being produced by `/ssc.ads-produce <idea_id> <brief_id> image_content` and
  overlaid by the dashboard; it simply has nothing to do with `/ssc.image` any more.
- The two open **server** requirements (N briefs per idea with `angle_label` persisted;
  an `edit`-holding operator actually being able to generate) — those live in the
  BrandOS repo, not here. This change is written to be correct against both the current
  and the post-fix server.
- Post / YouTube visual flows. Phase 1 stays **ad channel only**; a non-ad idea stops
  cleanly.
- Introducing an agent. The command dispatches the skill directly, as today.
- An automated test harness (a design for one exists at
  `docs/superpowers/specs/2026-07-03-plugin-test-lint-harness-design.md`; it is not part
  of this change).

## Decisions

- **The anchor is `brief_id`, not `image_content_id`.** Every tool call —
  `generate_background`, `generate_model`, `compose_ad_visual`, `list_creatives`,
  `list_creative_prompts` — keys on the approved angle brief. This is forced by the
  server (the creative surface no longer accepts or exposes `image_content_id`) and it
  is also the correct model: an angle is what a creative chain belongs to, and once the
  server persists N briefs per idea, each approved angle gets its own independent chain.
  *Alternatives rejected:* (a) keep the `image_content` anchor — impossible, the key no
  longer exists server-side, and it encodes the wrong ownership; (b) have the operator
  pass `image_content_id` directly instead of `brief_id` — this just relocates the same
  wrong anchor into the operator's hands and would still need a brief lookup for the
  angle grounding.

- **`image_content` is dropped from the command entirely.** It is not an anchor, not a
  precondition, not a grounding source, and is never read. The skill does not call
  `list_post_content` looking for it, does not gate on it, and does not size anything
  from it. Rationale: `image_content` is the overlay text the dashboard applies *after*
  the visual is finished. Gating visual production on it inverts the pipeline (you would
  have to know the final caption before you could shoot the photograph), and reading its
  body into the prompt is precisely how copy strings leak into an image prompt — the
  failure mode Rule 1 below exists to prevent. *Alternative rejected:* keep reading it
  as a soft, non-gating layout constraint — rejected because the only thing it was
  really supplying (how much room to leave for text) is better expressed as a standing
  composition rule (see below), and keeping the read keeps the leak risk for no benefit.

- **An approved `copy` row for the brief is a HARD precondition.** No approved copy →
  STOP and route the operator to `/ssc.ads-produce <idea_id> <brief_id> copy`, approve
  one, then re-run. Rationale: the copy is what tells you *which moment* the ad is
  about — the brief gives the strategic angle, the copy gives the concrete scene the
  angle resolves into. Producing a visual from the brief alone yields a generic,
  angle-shaped image that the copy then has to be bent around; and because the visual is
  the expensive half of the pipeline (each generate call spends fal credits), a
  best-effort grounding that silently degrades is worse than a stop. Making copy the gate
  also gives the chain a well-defined, cheap-to-satisfy entry condition that the operator
  already knows how to meet. *Alternative rejected:* brief alone is enough, copy enriches
  best-effort (the shipped skill's posture toward copy) — rejected because "best-effort"
  means the failure is invisible: the operator cannot tell, from the saved draft, whether
  the visual was grounded in the copy or not.

- **The skill authors the FULL scene prompt; it reaches the engine verbatim.** Each
  generate tool takes a complete `prompt` describing setting, staging, subject placement,
  mood, light, palette, and lens/composition; the server persists it as the layer's
  prompt row and generates from that saved body without modification. *Alternative
  rejected:* keep the `prompt_hints` + server-assembly model — it has been **removed
  server-side**, so this is not a live option; and on the merits, hint-merging made the
  effective prompt unauditable (nobody could see the string the engine actually got)
  and it meant the skill could not honour the prompt rules below, because the server
  might append text the skill never saw. Verbatim prompts put authorship, provenance,
  and responsibility in one place.

- **Prompt rules are a hard contract, stated in the skill.** An image model draws every
  concrete noun you name — *including inside a negation*. There is no longer any
  server-side assembly to sanitise a sloppy prompt, so the rules are the only thing
  standing between a bad prompt and a spent generation:
  - *Rule 1 — never name the ad copy.* Not quoted, not paraphrased, not negated. Naming
    a string is how it ends up rendered into the image.
  - *Rule 2 — never negate.* "No text", "no people", "without a logo" all push the model
    toward exactly those things. Describe what **is** there.
  - *Rule 3 — reserve space geometrically, in the positive.* Both the later text overlay
    and the not-yet-generated subject need room; you buy that room by describing the
    area as what it positively **is** ("the upper third is a smooth, evenly-lit cream
    plaster wall"; "the left third is an open, sunlit stretch of clean countertop"),
    never by asking for an absence.
  - *Rule 4 — one image per call*, and *Rule 5 — no baked-in text, ever*, achieved
    through rules 1–3 rather than by asking for text's absence.
  Prompt language is free-form (English usually generates best); image prompts are the
  one exemption from the repo's Vietnamese-prose rule, which governs operator-facing
  chat and persisted content. *Alternative rejected:* a negative-prompt / exclusion list
  — the engines behind these tools do not take one through this surface, and stating
  exclusions in the positive prompt is actively harmful.

- **The reserved-space convention is a standing composition rule from the visual KB.**
  It comes from `brand/visual-identity`, `ad/visual-direction-ref`, and
  `ad/creative-guidelines` (read via `get_knowledge`), **not** from the `image_content`
  body. The skill does not know — and does not need to know — how many lines of text will
  later be overlaid; it simply always leaves a clean, evenly-toned zone per the standing
  rule. *Alternative rejected:* size the reserved zone to the approved `image_content`
  body (what the shipped skill does) — this is the last remaining reason to read
  `image_content`, and it is a bad one: it re-couples the visual to text that does not
  exist yet at background time, and the marginal precision it buys is not worth
  re-introducing the coupling this change exists to remove.

- **Rewrite in place as ONE stepper skill.** `ssc-image` stays a single state-driven,
  per-layer stepper: read `list_creatives(brief_id)`, compute `approved(L)` and
  `has_drafts(L)` per layer, work the first layer without an approved creative, then
  STOP. *Alternatives rejected:* (a) split prompt-authoring and generation into two
  commands (`/ssc.image-prompt` then `/ssc.image`) — this doubles the operator's step
  count for every layer of every angle and introduces a prompt-drift window where the
  authored prompt and the generated candidate can diverge; the prompt is already
  persisted and inspectable server-side via `list_creative_prompts`, so a separate
  authoring command buys nothing; (b) add an in-chat prompt review gate before each
  generate call — this **breaks the plugin's save-to-server, never-present-in-chat
  invariant**, which exists so that every artifact an operator reviews lives in the
  dashboard with provenance, not in a transient chat transcript. The `revise: <note>`
  path (below) gives the operator prompt-level control *without* a chat gate.

- **3 calls for `background`, 1 each for `model` and `composite`; there is no `n`
  parameter.** Backgrounds are the cheap, exploratory layer where three genuine readings
  of the same angle (different setting / time-of-day / staging) are worth the credits —
  so, three separate `generate_background` calls with three **distinct** prompts, not
  three re-rolls of one. Model and composite are conditioned on an approved upstream
  creative and are expensive to review, so exactly one candidate is produced and the
  state machine blocks a second while one is pending (one in flight). *Accepted wart:*
  because each call versions the `(brief_id, background)` prompt row forward, the
  **active** prompt row ends up being the third one. This is accepted rather than worked
  around: per-candidate provenance survives on each creative's own `prompt_id` +
  `generation_prompt`, so no information is lost — only the "active row" pointer is less
  meaningful for a multi-call layer. *Alternative rejected:* one call with `n: 3` (what
  the shipped skill does) — the parameter does not exist on the current surface, and
  three prompts is the better artistic model anyway.

- **The `revise: <note>` path is prompt-level, not a re-roll.** A layer with pending,
  unapproved drafts normally STOPs. When the operator re-invokes with
  `revise: <note>` ("warmer light, kitchen not living room"), the skill instead reads
  the layer's active prompt via `list_creative_prompts(brief_id)` plus the pending
  drafts' `generation_prompt`, **rewrites** the prompt applying the note (still obeying
  the prompt rules), and issues **one** generate call for that same layer with the new
  prompt. The generate tool persists the revised prompt row itself, so the skill never
  calls `save_creative_prompt`. Rationale: the operator's correction is carried in the
  text that actually reaches the engine, which is the only place it can have effect —
  re-invoking the same prompt and hoping for a different sample is not iteration.
  *Alternative rejected:* re-generate with the same prompt (a blind re-roll) — it burns
  credits without incorporating the correction.

- **Model selection: omit `model` unless the operator supplies one.** The server defaults
  are `fal-ai/flux/schnell` for text-to-image and `fal-ai/nano-banana/edit` for
  image-edit; letting the server default govern means model policy lives in one place and
  can change without a plugin release. A supplied model id is passed through unchanged.
  Known families are `fal-ai/flux*`, `fal-ai/nano-banana*`, `fal-ai/imagen4*`; a model
  outside them is refused by the server as `invalid_input` **before any provider call**,
  so no credits are spent — the skill surfaces that plainly rather than guessing a
  substitute. *Alternative rejected:* the skill picks a model per layer — it would
  duplicate (and drift from) server policy for no operator benefit.

- **Product stays upload-only; the skill neither generates it nor brokers the upload.**
  The product must be the **real** packaging photograph. When `product` is the active
  layer, the skill STOPs and asks the operator (in Vietnamese) to upload the real photo
  and approve it in `/ad/[month]/[id]`, then re-run. `upload_product_creative` is
  deliberately **not** in the skill's `tools:` list: uploading is a dashboard action with
  a human choosing the asset, and a tool the skill cannot call is a stronger guarantee
  than a rule it is asked to follow. *Alternative rejected:* let the skill broker the
  upload — it would need the file from the operator through chat, which conflicts with
  save-to-server, and it puts an asset-provenance decision inside an agent.

- **Skill frontmatter `tools:` = `[get_idea, list_briefs, list_post_content,
  get_knowledge, list_creatives, list_creative_prompts, generate_background,
  generate_model, compose_ad_visual]`.** Reads resolve the concept (`get_idea`), the
  angle (`list_briefs` — there is no `get_brief`), the approved copy
  (`list_post_content`, filtered to `section='copy'`, `status='approved'`, and the
  brief), the visual KB and persona doc (`get_knowledge`), the chain state
  (`list_creatives`) and the active prompt for the revise path
  (`list_creative_prompts`). Writes are the three generate tools and nothing else. The
  absences are deliberate and each is load-bearing:
  - `save_creative_prompt` — the generate tools persist the prompt row themselves,
    including on the revise path, so the skill never needs to write one; including it
    would create a second, divergent way for a prompt to exist.
  - `upload_product_creative` — the product upload is a dashboard action (above).
  - `approve` — the only gated promotion; the `hooks/approval-gate.mjs` PreToolUse hook
    denies it to subagents outright. Saving is not approving.
  - `edit` — would let the skill demote, unapprove, or **discard** a creative;
    discarding is the operator's call, not the skill's.
  - `set_cover`, `reorder_gallery`, publish tools, `update_budget` — consequential,
    hard-to-reverse actions that are dashboard-only and never agent-callable.

## Risks / Trade-offs

- **[Server "Change 2" has not shipped — N briefs per idea with `angle_label` persisted
  is not live, so today an idea has exactly one brief and the multi-angle payoff is
  inert.]** → Mitigation: the skill takes an **explicit `brief_id`** and works
  identically once N briefs exist — the *creative chain* is forward-compatible by
  construction, with no second edit needed when the server catches up. Until then the
  change still buys the correct anchor, the copy gate, and verbatim prompts; only the
  *per-angle chain multiplicity* is deferred. The constraint is stated plainly in the
  skill body (the same pattern the video skills use for unshipped `generate_*` tools) so
  the operator is never surprised.

- **[The approved-copy gate is NOT brief-scoped in practice — ad `copy` rows carry no
  `brief_id`, so it degrades to idea scope.]** `save_post_content` accepts `brief_id`,
  but it is **optional**, and the server binds it automatically **only for `post`
  content** ("for `post` content the idea's single brief is resolved server-side when
  omitted"). Nothing binds it for `ad` content — and `ssc-ads-writer`, the skill that
  writes every ad copy row, calls
  `save_post_content(channel='ad', idea_id, section, body, score, comment)` and **never
  passes `brief_id`**. So every ad `copy` row's `brief_id` is null, the brief-scoped
  filter never fires, and "the approved copy for *this* angle" cannot be resolved from
  the data. (An earlier draft of this document asserted the opposite — that content rows
  already carrying `brief_id` made the per-angle resolution unambiguous. That was
  **wrong**; see the Drift Log.) → Mitigation: the gate falls back to **idea scope**
  (any approved `copy` for the idea) and the skill **announces the fallback** on its
  output summary's `Copy matched:` line — a silent degradation is forbidden, because a
  silent one is exactly what the copy gate exists to prevent. The fallback is harmless
  today (one brief per idea ⇒ idea scope *is* brief scope), and it is bounded: it stops
  being safe the moment Change 2 lands, at which point copy approved for angle A would
  satisfy the gate for angle B and the visual would be grounded in the wrong angle's
  story, at fal-credit cost. The real fix is one argument in a different skill and is
  tracked as a prerequisite for Change 2 (Drift Log, follow-up).

- **[The `insufficient role` refusal on the three generate tools observed live on
  2026-07-13 — a token that held `edit` (every save and `list_creatives` succeeded) was
  refused with `{"error":"internal_error","message":"insufficient role"}`.]** →
  Mitigation: the skill STOPs and reports plainly in Vietnamese that the operator's
  BrandOS account cannot generate and that an admin must grant the role; nothing was
  written. It **never** retries the call with different arguments (the refusal is a
  permission, not a bad argument or an unmet precondition), **never** falls back to a
  third-party image API (provider keys stay server-side — single MCP surface), and never
  silently skips a layer. The corresponding server-side fix — make `edit` sufficient, or
  document and grant the extra role, and surface the refusal as a typed `forbidden`
  rather than an `internal_error` — is tracked as a BrandOS requirement, not worked
  around here.

- **[Every generate call spends fal credits, and the background layer makes three calls
  per invocation.]** → Mitigation: exactly **one layer per invocation**, so the operator
  chooses when to spend by choosing when to invoke; the state machine refuses a second
  batch or a second in-flight candidate while drafts are pending; and the `revise` path
  changes the prompt rather than re-rolling the same one, so a second spend at least buys
  a different question. Unknown model ids are refused as `invalid_input` before any
  provider call, so a typo costs nothing.

- **[A prompt that names copy text or uses negation will render text or unwanted objects
  into the image — and the prompt now reaches the engine **unmodified**, with no
  server-side assembly left to correct it.]** → Mitigation: the prompt rules are stated
  in the skill as a **hard contract** (never name the copy; never negate; reserve space
  geometrically in the positive), with concrete positive-phrasing examples for both the
  text zone and the subject zone, and a stock of positive phrasings for emptiness (*an
  unoccupied room*, *bare surfaces*, *a blank plaster wall*, *an uncluttered
  countertop*). Dropping the `image_content` read removes the single most likely vector
  for copy strings to enter a prompt in the first place. Verification includes reviewing
  every prompt example in the rewritten skill against these rules.

- **[There is no automated test suite in this repo — the plugin is markdown skills plus
  one Node hook, and a lint/test harness is only a design.]** → Mitigation: verification
  is by **review against the invariants** (every MCP tool named exists on the BrandOS
  surface with the argument names used; no forbidden tool appears in `tools:` or the
  procedure; `image_content` appears nowhere as an anchor, precondition, or grounding
  source; every `/ssc.*` cross-reference resolves to a live command; every prompt example
  obeys the prompt rules) **plus a live end-to-end run** on one approved concept + brief:
  background (3 drafts) → approve → model (1 draft) → approve → product STOP → composite
  (1 draft).

## Migration Plan

Markdown-only plugin change — no runtime code, no data migration, no schema change. The
BrandOS server has already shipped the brief-keyed chain, the three generate tools,
verbatim prompts, and service-side prompt persistence, so no server deploy is coupled to
this one.

**Deploy steps**

1. Both files are rewritten **in place on `main`** — `plugins/ssc-content/skills/ssc-image/SKILL.md`
   and `plugins/ssc-content/commands/ssc.image.md`. No worktrees (per `CLAUDE.md`); commit
   selectively (stage the specific files, not `git add -A`).
2. Sanity-check the rewrite against the verification invariants listed under Risks above,
   including that `plugin.json` / `.mcp.json` are untouched (this change adds no MCP tool
   the plugin was not already configured for) and that the governance hook
   (`hooks/approval-gate.mjs`) is untouched.
3. Push, then operators pick the change up through the normal plugin update path:
   `claude plugin marketplace update ssc-content-plugin` followed by
   `claude plugin update ssc-content@ssc-content-plugin`, then restart Claude Code.
4. Run the live end-to-end check on one approved concept + approved angle brief with
   approved copy: background (3 drafts) → approve one → model (1 draft) → approve →
   product STOP-and-ask → composite (1 draft).

**Local iteration mechanics (from `CLAUDE.md` — easy to get wrong)**

The plugin is copied into a versioned cache at
`~/.claude/plugins/cache/ssc-content-plugin/ssc-content/<version>/` on install, and
`claude plugin update` is a **no-op when the version is unchanged** ("already at the
latest version"). A same-version content edit is therefore **not** picked up by an update.
While iterating on this rewrite locally, force a fresh copy of the working tree with:

```bash
claude plugin uninstall ssc-content@ssc-content-plugin
claude plugin install  ssc-content@ssc-content-plugin
# then restart Claude Code to load the new copy
```

(Both `update` and `uninstall` require the qualified `plugin@marketplace` id — plain
`ssc-content` reports "not found".)

**Rollback**

`git revert` of the rewrite commit restores the previous `SKILL.md` and `ssc.image.md`,
then the same marketplace-update / plugin-update (or uninstall + reinstall) cycle puts the
old skill back in operators' hands. The revert is safe in the sense that it touches only
markdown — but note it is **not** a return to a working state: the reverted skill calls
`generate_background` / `generate_model` / `compose_ad_visual` with `image_content_id`,
`n`, and `prompt_hints`, none of which the current server accepts. Rollback is therefore a
way to unblock a *bad rewrite*, not a way to keep producing visuals; the practical fix for
a defective rewrite is a forward fix. Approved creatives already saved on the server are
unaffected either way — this change writes no data and deletes nothing.

## Open Questions

- **Does the operator ever want more or fewer than three background readings?** Three is
  a judgement call (cheap layer, enough spread to choose from). Since there is no `n`
  parameter, the count is purely how many calls the skill makes, so it is trivially
  tunable later. Not blocking — ship at three and let live use say otherwise.
- **Should the `revise: <note>` path be available on a layer that is already approved
  (i.e. re-open an approved layer with a new prompt)?** Today it is only defined for a
  layer with pending, unapproved drafts; re-opening an approved layer would mean the
  operator first discards the approval in the dashboard, which keeps the decision with
  the human. Deferred — the current shape is the conservative one and matches
  propose-only.
- **Once server Change 2 lands and an idea carries several approved angles, is there a
  useful "produce the next layer for every approved angle" batch affordance?** Deferred:
  one concept + one angle per invocation is the invariant today, and a batch mode would
  multiply credit spend per invocation, which cuts directly against the
  operator-chooses-when-to-spend mitigation above.

## Drift Log

### The approved-copy gate is idea-scoped, not brief-scoped

**Original decision.** "An approved `copy` row **for the brief** is a HARD
precondition" (see Decisions). The Risks section justified it with the claim that
"content rows already accept `brief_id` on `save_post_content`, so 'the approved copy
for *this* angle' resolves unambiguously the moment an idea carries several briefs."

**What the implementation does instead.** `plugins/ssc-content/skills/ssc-image/SKILL.md`
Step 3 applies the `brief_id === <brief_id>` filter **only to `copy` rows that actually
carry a `brief_id`**, and **falls back to idea scope** — any approved `copy` for the
idea — when they do not. The fallback is **loudly announced**: Step 3 requires the
matched scope to be held, and Step 11's output summary prints it on a `Copy matched:`
line, which names the idea-scope match as a fallback and states that it is only safe
while the server keeps one brief per idea. The spec delta
(`specs/ads-image-visual/spec.md`, "Concept, angle brief, and approved-copy gate") has
been amended to require exactly this two-scope behaviour plus the mandatory
announcement.

**Why.** The original mitigation was **factually wrong**. On the live BrandOS surface
`save_post_content`'s `brief_id` is **optional**, and the server binds it automatically
**only for `post` content** — nothing binds it for `ad` content. And
`plugins/ssc-content/skills/ssc-ads-writer/SKILL.md`, the skill that writes every ad
copy row, calls `save_post_content(channel='ad', idea_id, section, body, score, comment)`
and **never passes `brief_id`**. Every ad `copy` row therefore carries a null `brief_id`,
the brief-scoped filter can never fire, and a strictly brief-scoped gate would have been
either unenforceable or (worse) a gate that always fails. Making the spec assert
brief-scoping while the data cannot support it would have shipped a lie; announcing the
degradation ships the truth.

**Blast radius today: none.** The server persists exactly one brief per idea ("Change 2"
has not shipped), so idea scope and brief scope are the same set. The defect is latent,
not live.

**Recommended follow-up — a prerequisite for server Change 2.** The real fix is **one
argument**: have `ssc-ads-writer` pass `brief_id` to `save_post_content` (it already
holds the chosen `brief_id` — it is a required input to that skill). The live schema
already supports this on any channel — "an explicit value always wins" — so no server
change is needed to establish the lineage. That is a **separate change** (it edits
`ssc-ads-writer`, which this change explicitly does not touch), and it **MUST land
before or together with server Change 2**: the moment an idea can carry N approved
briefs while ad copy rows still carry no `brief_id`, copy approved for angle A satisfies
the gate for angle B and the visual is grounded in the wrong angle's story, at
fal-credit cost, with no stop. Once ad copy rows carry `brief_id`, `ssc-image`'s
brief-scoped clause fires on its own and the fallback (and its announcement) retires
itself with **no edit to `ssc-image`**.
