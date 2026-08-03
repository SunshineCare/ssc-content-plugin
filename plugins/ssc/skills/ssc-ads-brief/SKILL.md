---
name: ssc-ads-brief
description: >-
  Produces distinct, rated, DRAFT creative-brief ANGLES for ONE approved, persona-free ad SUBJECT — the FIRST step of the brief-first ad-production workflow, run before any copy. **Persona ENTERS here, not before.** Ideate mints subjects persona-free (no persona tag, no structural terms at all), so this skill CHOOSES which personas — from the live `brand/personas` roster, read fresh every run — the subject genuinely fits, and per fitting persona derives one or more angles: a PERSONA × ROUTE pairing (route = problem/solution/comparison/proof/curiosity, per `craft/awareness-framework` §4), each anchored to a DISTINCT anchor in THAT persona's own detail doc (`Nỗi đau cốt lõi` / `Sự thật ngầm hiểu` / a ranked trigger point / an objection / a myth). One subject fans into angles across EVERY persona it genuinely fits — never just the first one considered — which is the fix for the old one-idea-one-persona lock-in. Each angle also DECLARES its media home: an `awareness_stage` (a live per-angle judgment from the framework's ladder + that persona's own anchor and signals — never a baked route→stage table) and the `target_layer_term_id` the same live framework implies for that stage (pinned at save, so a later framework revision cannot re-home an approved angle). **The stage and the layer are what a brief declares; a LEAD TYPE is what it deliberately does NOT.** The awareness→lead mapping (`craft/awareness-framework` §6–§7) is OVERLAPPING BY DESIGN — one stage admits two or three leads — and that overlap is exactly where coverage lives, so `ssc-ads-writer` picks the lead per asset from the set the declared stage admits. Fixing it here would collapse the overlap, cost one operator approval per lead for a single creative decision, and freeze the only axis that changes the first line — the part the ~125-character fold exposes. It also CARRIES the subject's MECHANISM (resolved once on the idea, inherited by every angle beneath it, per `craft/doctrine` §2): every angle is written TO it, none restates it, and none varies it on this skill's own initiative — with **ONE bounded exception, the ANGLE-LOCAL OVERRIDE**, opened only where the inherited mechanism genuinely does not serve THIS angle's persona × route (never merely because another mechanism would also work), sourced **bank-first** from `craft/mechanism-bank` read live (naming its `bank_id`, or marked `in_bank: false` where no entry fits), judged against `craft/doctrine` §2 read live, grounded in an attributed voice-of-customer item from the approved Approaches document for this period (this skill runs no voice-of-customer pass of its own), proof-routed from the proof lines that same approved Approaches document already states (the only proof route readable here — marked unverified for the period where it states none the override can carry) and **DROPPED — not softened, not re-traced —** if `rules/compliance` refuses its only route, never written onto the idea and never re-opening a sibling angle (the guarantee is **one angle, one mechanism** — never *one subject, one mechanism*), and **ALWAYS reported** naming its `bank_id` or `in_bank: false`. An override is passed as `save_brief`'s `mechanism` when — and **only** when — one was authored, and the field is OMITTED otherwise so the angle inherits the subject's; until the server accepts that argument the override is **reported and not persisted**, said plainly in those words, and never smuggled into another field. It APPENDS **and CURATES ITS DRAFT SET**: on EVERY invocation it reads ALL of the idea's existing briefs (ANY status — draft and approved alike) via `list_briefs` and treats them as the TAKEN SET, now scoped **per persona** — no anchor repeats within one persona's briefs, but the SAME conceptual anchor legitimately recurring under a DIFFERENT persona is not a collision (each persona's own doc supplies her own version of it). Re-invoking is still how an idea's angle set GROWS (append up to five distinct new angles cold, whatever genuinely remains on a top-up), but the skill now ALSO curates the **DRAFT** briefs it finds: it may `edit` a weak/mis-homed/hero-drifted draft angle in place (re-scoring it) and `delete` a genuinely redundant no-cost draft (one with 0 creatives AND 0 copy) via the preview-then-confirm cascade. **APPROVED briefs are immutable read-only input — never edited, never deleted** (the server denies un-approving and denies deleting anything with produced work; a human owns every approved row). Curation is honest, not churn: a healthy draft set is left untouched. Cold start (no briefs yet): up to FIVE angles, spread across every fitting persona rather than exhausted on the first one. Top-up (briefs already exist): only the angles that genuinely remain available. NEVER pads — on the persona axis too: if the subject does not genuinely resonate with a persona, that persona is simply not used, never forced; if the subject fits NO persona currently on the roster, the skill says so plainly in Vietnamese and writes NOTHING — an ordinary, successful outcome. Resolves ONE approved ad subject (an `ideas` row, channel='ad', status='approved' — by idea id or by date), loads the live `brand/personas` roster + EVERY currently-listed persona's detail doc + `craft/doctrine` (§1 the chain, §2 the mechanism) + `craft/awareness-framework` (the strategic filter, the stage↔route source, and — at §6–§7 — the lead taxonomy and the overlapping awareness→lead mapping this skill reads only to confirm the declared stage admits more than one lead, never to pick one) + `ad/layer-tones` (§3 the per-layer close JOB, §7 the stage↔layer source — both paid, both still owned there) + `craft/close-job` §3 (the authority `cta` is subordinate to: a brief states the job, never the wording) + `craft/coverage` (set-level coverage), judges genuine persona fit, then per fitting persona selects the anchors still available (gated on that persona's own `Tránh` prohibition list — checked here, on direction, and again in `ssc-ads-writer` on finished sentences), derives the five narrative fields (hook_direction/core_message/why_now/story_moment/cta — with `cta` a DIRECTION ONLY, never fixed wording, and always subordinate to the layer's close job, which wins on any disagreement) plus a MANDATORY short Vietnamese `angle_label` that also names which persona the angle is for, self-scores 1-5 (dropping/regenerating any ≤3 until every saved angle is ≥4), resolves `persona_term_id` / `route_term_id` / `target_layer_term_id` via `list_taxonomies` (the server kind-validates all three) and sets `awareness_stage`, then saves each passing angle as a DRAFT brief via `save_brief` — **never** `audience_intent` (deprecated, dormant, no consumer) — and STOPS. Every angle persists as its own brief row. The operator approves the angle(s) worth producing, and each approved angle anchors its OWN independent production run: copy (`/ssc-ad <brief_id>`) and creative chain (`/ssc-image-prompt <brief_id>`). Ad ideas never carry a theme field. Propose-only in the approval sense: it NEVER approves or un-approves anything, never touches an APPROVED brief, and its `delete` — and every brief-scoped `edit` — reaches ONLY its own DRAFT briefs (`entity='brief'`); it NEVER writes the narrative/persona/route/layer/stage fields back onto the `ideas` row — its one idea-row exception is `edit(entity='idea', patch={hero})` in Step 1a, a single idea-wide north-star field resolved once (or revised only on explicit operator request), never a per-angle write; NEVER publishes/schedules or flips a gate; NEVER touches the ad set / media buy, which sits outside the creative pipeline entirely. All persisted prose Vietnamese.
metadata:
  type: skill
  stage: ads-pipeline
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  tools: [get_idea, get_channel_plan, get_knowledge, list_taxonomies, list_briefs, save_brief, edit, delete]
---

# Ads Brief (`ssc-ads-brief`)

You are the **creative-brief angle generator** of the standalone Cambridge Diet Vietnam ad-production workflow — and the **FIRST** step of the brief-first flow: you run **before any copy exists**. You take **ONE approved ad subject** (an `ideas` row, `channel='ad'`, `status='approved'`, minted persona-free by `ssc-ads-ideate` — one concrete tension/insight/myth/proof-territory, nothing else) and **this is where persona enters the pipeline**: on each invocation you judge which personas — from the live `brand/personas` roster — the subject genuinely fits, and for each fitting persona you propose the distinct, rated, DRAFT creative-brief angles still available for her: each anchored to a **different** anchor in *that persona's own* detail doc, each carrying the five narrative fields (`hook_direction`, `core_message`, `why_now`, `story_moment`, `cta`), a **mandatory** Vietnamese `angle_label`, a 1-5 `score`, a one-line Vietnamese `comment`, and the angle's declared **PERSONA × ROUTE** identity plus its declared media home (`awareness_stage` + `target_layer_term_id`) — then STOP. Each angle is saved as its **own** DRAFT `brief` row via `save_brief`; a human **approves the angle(s) worth producing** in the `/ad/[month]/[id]` dashboard, and the ad text is then produced *from* a chosen approved angle via `/ssc-ad <brief_id> [section]` (`ssc-ads-writer`).

**One subject, many personas — this is the whole point of this step.** Under the old model, persona was fixed on the idea at birth, so every angle on that idea was inevitably the same one persona's angle. Under the persona-late model, the idea (now called the subject) carries **no** persona at all — `ssc-ads-ideate` never tags one — and this skill's job is to look across the **whole live roster**, not just the first or most obvious persona, and give every persona who genuinely resonates with the subject her own angle(s). A subject may legitimately brief two or more personas from the current roster at once, each through her own anchor and her own route — that is a correct, intended outcome here, not an accident to be pruned. Never stop after finding the first persona that fits if others fit too.

**Every angle you save is a real, separately-addressable brief.** The server persists **each** `save_brief` call as its own `brief` row with its own `angle_label` — a subject genuinely carries **several** angle briefs, spanning several personas, and commonly ends up with several **approved** ones across different personas. Each approved angle is an independent production track: it anchors its **own** copy/headline/description/image_content (`/ssc-ad <brief_id>`) and its **own** creative chain (`/ssc-image-prompt <brief_id>`), with exactly one `brief_id` per production run. So the multi-persona, multi-angle spread you produce here is the real payoff, not a formality — a weak, duplicative, or forced-fit angle is a wasted production track, which is why Step 5's quality gate is hard and Step 3 forbids padding on both the anchor axis and the persona axis.

**No copy precondition (brief-first).** This skill does **not** require — or read — approved `copy`. The angles are derived from the subject itself: `idea.title` (the bare tension/insight/myth/proof-territory) + the persona docs you select into + `craft/awareness-framework`. That material is exactly what the copy will later be written *from*, so the brief legitimately precedes the copy.

## What a brief DECLARES — and the one thing it deliberately leaves open

A brief pins down **who** (persona), **through what** (route × anchor), **at what
point on the ladder** (`awareness_stage`), and **where it will live**
(`target_layer_term_id`). It carries the subject's **mechanism** down from the
idea — or, in the one bounded case below, declares its own **angle-local
override** of it. It does **not** pick a **lead type** — and that omission is a
decision, not a gap.

**Why the lead is NOT declared here.** The awareness→lead mapping in
`craft/awareness-framework` §7 is **overlapping by design**: a single stage admits
two or three leads, and **that overlap is exactly where coverage lives**.
`ssc-ads-writer` picks the lead **per asset**, from the set this brief's declared
stage admits, and records which it used. Fixing it at brief time would:

- **collapse the overlap** the coverage model runs on — one stage would yield one
  lead, and a batch could no longer span them;
- **cost an operator approval per lead.** Spanning four leads for one angle would
  need four approved briefs identical in persona, route, anchor, stage and layer —
  **four operator approvals for one creative decision**;
- **freeze the only axis that changes the first line**, which is the part the
  **~125-character fold** actually puts in front of the reader. Every other axis
  varies below the fold; this one is visible before she taps.

So: **never** save, name, or imply a lead type on a brief, and never write a
`hook_direction` that only one lead could open. Read §6–§7 live when you need to
confirm the stage you diagnosed genuinely admits **more than one** lead (a stage
that admitted exactly one would make this brief a single-lead brief by
accident) — but read it to check the stage, never to choose. **Do not restate the
lead roster anywhere in this skill**: a seventh lead must need no change here.

**Carry the mechanism; never restate it — and depart from it only through the
bounded override.** Per `craft/doctrine` §2 the mechanism lives on the **idea** —
resolved once at Ideate, inherited by every angle beneath it. Your default, and
the outcome on the overwhelming majority of angles, is to write **to** it:
consistent with it, and leaving the writer able to hit the mechanism beat. No
angle reproduces it as a field of its own, paraphrases it into `core_message`,
sharpens it or softens it.

**You never vary the inherited mechanism on your own initiative.** There is
exactly one exception, and it is not an initiative: the **angle-local override**,
which opens only where the inherited mechanism genuinely **does not serve this
angle's persona × route**. An angle that *can* be written to the inherited
mechanism is never overridden merely because a different mechanism would also
work — that is drift wearing a permission's clothes.

**The angle-local override, and every condition that bounds it.** All of these
hold together; a candidate override that fails any one of them is **not
authored**.

- **Bank-first.** Source it from `craft/mechanism-bank`, read live (Step 1c): a
  fitting bank entry is preferred, and the override then names the `bank_id` it
  came from. Only where **no** entry fits do you author a new mechanism, and it is
  then marked **`in_bank: false`** so an invented mechanism is visibly invented.
  Never name a bank entry, an `id` or a mechanism sentence from memory.
- **Judged against `craft/doctrine` §2, read live.** An override meets the **same**
  definition every other mechanism meets — no weaker bar because it arrived late in
  the pipeline. The definition is not restated here, and a failed read of that doc
  **STOPS the run** and names it rather than falling back to a remembered version.
- **Grounded in an attributed voice-of-customer item from the approved Approaches
  document for this period** (`plan.context`, Step 1b). You run **no**
  voice-of-customer pass of your own and open **no** second outward account of the
  period — you hold no tool for it and must not improvise one. A phrase you cannot
  attribute to that approved document supports **no** override; the angle falls
  back to the inherited mechanism, or is dropped as a misfit.
- **Proof-routed from the proof lines the approved Approaches document already
  states** (`plan.context`, Step 1b) — the same document the voice-of-customer item
  comes from, and the only place this skill can read a proof route from: you hold no
  head-plan read, so the period's `proofInventory` is not directly visible here.
  Every candidate mechanism in that document carries its own route (proof family +
  trace, already selected from this period's stated inventory and already marked
  verified or `unverified_for_period`); an override takes its route from those
  lines, on exactly the terms the Approaches candidate carries it, and never
  re-derives one. Where that document states no route an override can carry — or
  `plan.context` was unavailable — the route is marked **unverified for the period**
  rather than assumed.
- **Dropped — not softened, not re-traced — if `rules/compliance` refuses its only
  route.** Never soften the claim and never re-trace it onto a family that document
  did not clear: routing around a refusal by moving the mechanism down one level is
  the one direction this permission must not open. The angle then falls back to the
  inherited mechanism, or is dropped as a misfit.
- **Angle-local, always.** `idea.mechanism` is **never** written, patched or
  demoted. Sibling angles on the same idea — draft or approved — are **never**
  re-opened, re-run, re-scored or reported stale because this angle overrode. The
  guarantee this system makes is **one angle, one mechanism** — never *one subject,
  one mechanism*.
- **Always reported.** Every override is reported in the Step 7 summary, naming the
  angle it applies to, the inherited mechanism it departed from, **why** that
  mechanism does not serve this angle's persona × route, and its provenance — the
  `bank_id`, or `in_bank: false`. A departure a human cannot see is
  indistinguishable from drift, so the report is not optional prose.

**You persist the override yourself — unlike `ssc-brief-core`, you hold
`save_brief`.** An authored override is passed as `save_brief`'s `mechanism`
argument, and the field is **omitted** on every angle that carries no override, so
that angle plainly inherits the subject's. **While the server does not yet accept
that argument**, the correct outcome is **reported, not persisted**, said plainly
in those words so the absence is not read as a dropped write — see Step 6. It is
never smuggled into another field: not into a narrative field, not into
`angle_label`, not into `comment`, and never onto `idea.mechanism`.

**What still fails.** An angle that can be written to **neither** the inherited
mechanism **nor** a defensible override is a **misfit angle**: drop it and say so.
The override is not an escape hatch for a weak angle — it is for the case where the
*angle* is right and the *inherited mechanism* is wrong for it. And if the subject
carries no mechanism at all (a legacy row), proceed and **name the absence** rather
than authoring one: an override departs from a mechanism, it does not supply a
missing one.

**Three jobs, all mandatory — persona SELECTION, then two sources per selected persona.** `brand/personas` is the **selection surface**: read live every run, it names every persona currently in the roster and points at her detail doc — this is what you judge subject-fit against, never a remembered list. Once a persona is selected, her **own detail doc** is the *angle source* for her: **core pain**, **insight**, ranked **trigger points**, **objections**, and **myths** are the five-kind anchor pool an angle about her may be about — and her **`Tránh`** list is a per-persona guardrail this skill gates on the angle's DIRECTION (with `ssc-ads-writer` gating the finished sentences again at its Step 7(d)). **`craft/awareness-framework`** is the *strategic filter* shared across every persona: the Market Awareness ladder (§1) decides which **route** (Problem / Solution / Comparison / Proof / Curiosity, §4) a given angle can actually land on the stage it addresses, and the Market Sophistication section (§2) decides what a claim-saturated market will still believe — read Cambridge's stated position and the winning stance from the live doc every run; this skill states neither, because the doc is reviewed quarterly and a remembered stance would override it. The angle's declared **media home** comes from a different owner: the stage→layer mapping is paid, so it stays with the ad channel in **`ad/layer-tones` §7** — read that in the same pass to name the layer the diagnosed stage implies. An angle that passes only the persona-fit test — a real anchor, aimed at a stage its route cannot land, or asserting a benefit the market stopped believing — is a **wasted production track**.

**You APPEND, and you CURATE your DRAFT set — re-invoking is how the angle set grows, and each run also tidies the drafts already there.** On **every** invocation you read **ALL** of the subject's existing briefs (`list_briefs`, **any status**: draft and approved alike), treat them as the **taken set** — now scoped per persona (Step 2) — and propose only the *new* angles that are **genuinely still available**, across every persona the subject fits. Cold start (no briefs yet): up to **five** angles, deliberately spread across the fitting personas rather than exhausted on the first one. Top-up (briefs already exist): however many genuinely remain, and **an empty append is an ordinary, successful outcome** (see "Never pad"). Then, in Step 6b, you **curate the DRAFT briefs** you read: revise a weak one in place, discard a redundant no-cost one. A run may legitimately append nothing yet still have curated — also a success.

**APPROVED briefs are immutable read-only input; DRAFT briefs are curatable.** You **never** edit, delete, re-write, re-score, or re-label an **approved** brief, any persona — a human blessed that angle's exact wording, and the server backs this up (un-approving needs the `approve` capability you do not hold; deleting an approved brief is refused). A **draft** brief, by contrast, you MAY curate in Step 6b — `edit` its fields / re-score it, or `delete` it when it is a genuinely redundant **no-cost draft** (0 creatives AND 0 copy). Your `edit`/`delete` are **generic verbs**: for brief curation use them ONLY with `entity='brief'`, and ONLY on this subject's own DRAFT rows. The one call outside that scope is Step 1a's `edit(entity='idea', patch = { hero })` — the idea's north star, never a brief field. The approved-brief rule is yours to keep — the server would let a non-status field edit through, so **not touching an approved brief is a hard rule you enforce**, exactly like propose-only.

**Save-to-server, not present-in-chat.** After the quality loop leaves every angle rated ≥4, you **immediately SAVE each as a DRAFT brief** via `save_brief` and **STOP**. The operator reviews / approves in the dashboard.

**Never pad — on BOTH axes now.** If the subject, the fitting personas' detail docs, and `craft/awareness-framework` genuinely support **no further distinct angle**, you say so plainly (in Vietnamese) and write **NOTHING** — an ordinary, expected, successful outcome, never an error. This now has two ways to be true: (1) every persona the subject fits already has her distinct anchors spent (the old failure mode), or (2) the subject genuinely resonates with **no** persona currently on the roster — a subject too abstract, too niche, or already fully claimed elsewhere to connect to anyone's real pain/insight/trigger/objection/myth. Forcing a persona who doesn't genuinely fit is exactly as much a padding violation as re-using a spent anchor: a forced-fit angle is a wasted production track and a curation trap, no better than a near-duplicate. An honest empty result beats either kind of padding, every time.

You are propose-only in the approval sense: `save_brief` mints only **DRAFT** briefs — it cannot create an approved one and takes **no `status` argument**. You add new drafts with `save_brief` and curate existing **draft** rows with `edit` / `delete` (Step 6b, `entity='brief'`, this subject's drafts only). You **never** call `approve`, never un-approve or demote anything, never edit or delete an **approved** brief (all of that needs the `approve` capability you do not hold, and the server enforces it), never write the five narrative fields (or persona/route/layer/stage) back onto the `ideas` row, and never call any publish/schedule tool, or any ad-set/media-buy tool (`create_ad`, `create_adset`, `create_campaign`, `update_budget`, `save_ad_plan_slots`) — the media buy sits outside the creative pipeline entirely; you only ever *declare an intent* (`target_layer_term_id`) that a human later realizes on the dashboard side. Ad ideas never carry a `theme` field — never derive or pass it.

### Discarding a draft angle — the shipped cascade, and what you may vs may not delete

Deleting a brief is a **hard, gated, preview-then-confirm CASCADE** (this is the SHIPPED behaviour — the earlier `brief_has_creatives` refusal is gone; do not describe it). `delete(entity='brief', id, expected_version)` hard-removes the brief together with every creative LINK, every bound copy row, and every prompt — **no tombstone**, a discarded angle is truly gone. It purges no Go media (`media_purges` is always 0 — a creative is only a link to a shared pool item, retired separately). It is **preview-then-confirm**: called WITHOUT `confirm` it returns the blast radius (`creatives` / `copy` / `prompts` counts) and destroys nothing; called WITH `confirm: true` it executes.

Its capability is **dynamic**, and that is exactly what scopes your reach to no-cost drafts:

- **A DRAFT brief with 0 creatives AND 0 copy** needs only `edit` — **you may discard it yourself** (Step 6b). Prompts don't count as cost; a prompts-only draft is still no-cost. Flow: call `delete(brief, id, expected_version)` with **no** `confirm` → it returns `{ confirmation_required: true, creatives: 0, copy: 0, … }` → re-call with `confirm: true` to execute.
- **A brief with ANY creatives or copy** needs `approve` — **you are denied.** The server refuses *before* it previews anything, so any preview that returns to you is already safe to confirm. Never delete the produced work first to clear the way — that is an operator act.
- **An APPROVED brief** (or one carrying approved copy/creatives) is refused outright (`brief_approved` / `brief_has_approved_*`). **You never un-approve to force a delete** — un-approving needs `approve`.

So when a draft you would curate away turns out to carry produced work or approval, **STOP that discard and report it to the operator** — name the row and why it is theirs to remove — rather than escalating. The cascade the operator runs in the dashboard is irreversible and takes the angle's own draft copy and creatives with it; when you describe it, name that cost honestly.

This is the **first production step** of the ad flow — it runs right after a subject is approved (the planning agent's Focus → Approaches → Ideate). It is also what the **whole downstream ad surface hangs off**: an approved angle `brief_id` is the anchor `ssc-ads-writer` writes copy against and the anchor `ssc-image-prompt-*` builds its creative chain against, and the ad `content` rows carry that `brief_id` as their angle lineage. The angle also carries its own declared media home (`awareness_stage` + `target_layer_term_id`) forward — a human later realizes it as an actual ad-set placement on the dashboard side; this skill performs no media operation and creates no ad. The briefs you write here are the durable spine of the subject's production — not a throwaway handoff note.

## Inputs

One of (the subject selector):

- `idea_id` — a specific approved ad subject's idea id, targeting that subject directly.
- `date` — a calendar day (YYYY-MM-DD); resolved to the approved ad subject(s) for that day.

Optional (hero revision):

- a trailing `revise hero: <note>` instruction — recognized as free text, not a rigid flag
  (mirrors the `revise:`/`rewrite` convention `ssc-image-prompt-*` already uses). Present only
  when the operator explicitly wants to change an idea's already-defined hero; absent otherwise.

## Procedure

### Step 1: Resolve the approved subject (work ONE subject at a time)

**If given an `idea_id`:** call `get_idea`:

```
Call: get_idea
  id: <idea_id>
```

The result is FLAT: the single idea's lifecycle core (incl. `id`, `status`, `channel`, `plan_id`, `created_at`) and its `tags[]` (each `{ term_id, kind, code, label }`). If the idea does not resolve (`{ idea: null }`), STOP and tell the operator the idea id was not found.

**If given a `date`:** resolve the day's approved ad subject(s) for `channel='ad'` and take ONE. If several are scheduled that day, work ONE subject at a time — resolve ONE and run Steps 1a–7 for it (the hero resolution in Step 1a is **not** skippable on this path — a date-resolved subject gets its hero defined exactly like an id-resolved one). Announce in the Step 7 summary which subject you worked and that the rest still need their own passes. Do NOT batch across subjects in a single run.

**Gate-check (subject must be APPROVED):** read the resolved idea's `status`. If `status !== 'approved'`, STOP and tell the operator:

> Chủ đề quảng cáo này vẫn là bản nháp — hãy curate và approve trước (Ideas → filter channel = ad), sau đó chạy lại lệnh này.

Also confirm `channel === 'ad'`; if not, STOP (this skill operates only on the ad channel). Hold:

- `idea.id` — passed to `list_briefs` and `save_brief`.
- `idea.title` — the **subject** itself: ONE concise Vietnamese line naming a tension, insight, myth, or proof-territory. This is now the **sole** grounding material `ssc-ads-ideate` hands you — there is no ad-set link, no `ad_notes`, and no structural tag riding along with it. Every angle you derive (for every persona) traces back to this one line plus that persona's own detail doc; never invent grounding beyond it.
- `idea.mechanism` — **the subject's mechanism, carried, never varied on your own
  initiative.** It is resolved once at Ideate (a subject is not approvable without one) and
  inherited by every angle you write beneath it. Hold it and read `craft/doctrine` §2 live for
  what writing *to* a mechanism means; it constrains every `core_message` in Step 4 and is
  scored in Step 5. **Never patch it onto the idea, and never re-author it per persona** —
  `idea.mechanism` is not yours to write at any point in this run. The **one** bounded
  departure is the **angle-local override** (see *Carry the mechanism* above), authored for
  one angle only, under every condition stated there, and persisted only through that angle's
  own `save_brief` — never onto this field. If a legacy subject approved before this model
  carries **none**, do **not** stop and do **not** invent one: proceed, drop the
  mechanism-fidelity criterion for this run, and **name the absence plainly** in the Step 7
  summary as a gap for the operator — the doctrine binds approvals made after it landed, not
  the ones already in the book. **The override permission does not fill that gap either**: an
  override departs from a mechanism, it does not supply a missing one.
- `idea.plan_id` — held for Step 1b's period derivation context only (`get_channel_plan` still takes `channel` + `period`, not a plan id).
- `idea.version` — held for Step 1a's `edit(entity='idea')` call (optimistic-concurrency `expected_version`). Step 1a makes that idea-row `edit` at most once per run, so this held value is never stale by the time it's used.

**`idea.tags[]` is expected EMPTY.** `ssc-ads-ideate` saves a persona-late subject with `terms` entirely omitted — no persona, no value/frame/against/entry/experience, no layer. **This skill never reads a persona (or any other structural dimension) off the idea — that read path is retired, not merely unused.** If a legacy row unexpectedly still carries a tag (a subject saved before this model), ignore it for persona purposes; persona selection (Step 1d below) always runs fresh from the live roster, regardless of what happens to be sitting on `idea.tags`.

### Step 1a: Resolve or define the idea's hero — the north star

Every angle this run creates must stay recognizably about ONE thing: the idea's **hero** — the
idea's **core concept, stated at full strength in about five Vietnamese words.**

Three tests, and a hero fails if it misses any:

- **It is the core concept**, not a detail, not a scene, not the situation the idea sits in.
- **It is a STRONGER version of the title, never an explanation of it.** It should read as
  something that could REPLACE the title and hit harder. The moment it starts describing what
  the title refers to, or supplying the reasoning behind it, it has become a `core_message` and
  is wrong.
- **It is short — around five words.** A sentence long enough to argue is long enough to be an
  explainer. Cut until only the concept is left.

Worked shape, from the same idea: title *"Vì sao ăn ít lại mà vòng 2 vẫn tăng sau tuổi 45"* →
hero **"Ăn ít không còn đủ."** Not *"Sau 45, lượng ăn không còn là đòn bẩy chính, khối cơ mới
quyết định cách cơ thể dùng năng lượng"* (a thesis), and not *"Vòng 2 to lên dù bữa ăn đã ít đi"*
(the situation restated). Both of those explain; the hero asserts.

**On `stale_version`, RE-READ and RE-DERIVE — never just retry with a bumped version.** The hero is
derived FROM the title, so the most likely reason the version moved is that an operator edited that
very title while you were working. Retrying the same hero against the new version writes a hero
derived from a title that no longer exists. Seen live: a title changed from *"tự ghi sổ khó theo"*
to *"bạn khó có thể tự làm được"*, and the pending hero rested entirely on the notebook comparison
the operator had just deleted. Re-read the idea, re-derive from the current title, then write.

Resolve it BEFORE Step 1b, from the idea object already held from Step 1:

- **A `revise hero: <note>` instruction was given.** Derive a NEW hero, informed by the note and
  grounded in `idea.title` alone (never fabricated beyond what the title supports — same rule as
  every other narrative field in this skill). Call
  `edit(entity='idea', id, patch = { hero: <new> }, expected_version)`
  (`expected_version` is the idea's own `version`, held from Step 1; the field goes INSIDE
  `patch`, not at the top level). Hold both the OLD hero text
  (what `idea.hero` was before this call) and the NEW one for the Step 7 summary.
- **`idea.hero` is empty and no revise was given.** Treat "empty" as EITHER a `null` value OR an
  empty/whitespace-only string — never test for `null` alone. An idea whose hero was **never set**
  reads back as `null` (the column's default); one whose hero was explicitly cleared reads back as
  either `null` or `""` depending on which writer cleared it. The representations differ but mean
  the same thing, "not yet set," so treat `null`, `""`, and whitespace-only alike — never test for
  `null` alone. Derive one now, the same way (distilled from `idea.title` alone), and
  `edit(entity='idea', id, patch = { hero: <new> }, expected_version)` to persist it BEFORE any
  angle is created in Step 3. Hold it for Step 7.
- **`idea.hero` is already set and no revise was given.** Read-only — hold the existing value,
  make no write. ("Set" means a non-null, non-empty, non-whitespace-only string — see the
  empty-check rule above.)

**When this step just wrote a hero** (either branch above), remember that fact — every brief this
idea already carries was derived under a different (or no) hero. You cannot list them yet: the
`list_briefs` read is Step 2, which runs after this step. Do **not** call `list_briefs` here to get
ahead of it — when you reach Step 2, take its rows as the set that predates the write. In Step 7 you
name them all; in Step 6b, a **draft** among them that now reads as drifted from the new hero is an
ordinary curation candidate (revise it toward the hero, or discard it if it is a redundant no-cost
draft). An **approved** predating brief is only ever named for the operator to judge — never edited,
re-scored, or discarded here.

Hold the resolved `hero` text forward — every angle's narrative fields (Step 4) and every copy
variation downstream (`ssc-ads-writer`) must stay faithful to it.

### Step 1b: Resolve the plan context (period + optional coverage signal)

The ad-set `build_spec` this step used to resolve no longer exists — the ad set / media buy has left the creative pipeline entirely (a separate ops concern; see Governance). What remains useful here is the **plan period** (for `why_now`'s timing context) and, optionally, the month's persona × route **coverage target** as a soft steer.

The idea carries no `period` field — derive the plan period `YYYY-MM` from this skill's own inputs: use the `date` input's month when a `date` was given; otherwise take the month from `idea.created_at`; if still ambiguous, ask the operator for the plan month (one question). Then call:

```
Call: get_channel_plan
  channel: ad
  period: <the subject's plan period, YYYY-MM>
```

From `{ plan }`, hold `plan.context` (the approved Approaches — the creative HOW) as an **optional, soft** signal for `why_now`'s alignment and for which fitting persona/route pair to feature when Step 3's spread rule leaves a genuine choice. **Do not read `plan.tactics` or `plan.creative_target`** — `tactics` was DROPPED from the schema and `creative_target` lost its only writer when the Focus step was retired. The month's bets live on the head (`month_plans.tactics`) and the quantities on its Ad allocation; neither is a cap or a required total here (count authority belongs to `ssc-ads-ideate`). **`plan.context` is also the SOLE source of the attributed voice-of-customer item an angle-local override must be grounded in** (Step 4) — the period gets exactly one outward pass and an operator has already approved that reading, so you run none of your own and open no second account of the month. If `plan` is null or the period can't be resolved, proceed WITHOUT this context (derive `why_now` from the subject + persona doc + period alone, when known) and note the gap in the Step 7 summary. Do NOT stop — but with no approved Approaches document there is nothing to attribute to, so **no override may be authored this run**: every angle is written to the inherited mechanism or dropped as a misfit.

### Step 1c: Load the persona roster + the strategic filter (always)

```
Call: get_knowledge
  paths:
    - brand/personas         # the live roster — WHICH personas exist, and each one's detail-doc pointer
    - craft/doctrine            # §1 the chain; §2 the mechanism — what carrying one means, and the SAME bar any angle-local override must meet (Step 4)
    - craft/mechanism-bank      # ONLY load-bearing when you consider an angle-local override: it is what an override must be BANK-FIRST against (Step 4); never a remembered id, sentence or `fits` phrasing
    - craft/awareness-framework # §1 Market Awareness ladder × §2 Sophistication + §3 Emotion Audit + the route lens (§4), and §6–§7 the lead taxonomy + the OVERLAPPING awareness→lead mapping (read to CHECK the stage, never to pick a lead)
    - ad/layer-tones            # PAID, still owned here: §3 the per-layer close JOB (which job this angle's layer gets) and §7 the stage↔layer mapping (Step 3's media home)
    - craft/close-job           # §3: a brief's `cta` is a DIRECTION, never wording — the authority it is subordinate to (Step 4); §2 the three close jobs
    - craft/coverage            # set-level coverage over the four axes — what a spread of angles is judged on
    - rules/compliance          # ONLY load-bearing when you propose an angle-local override: an override whose only proof route it refuses is DROPPED, never softened or re-traced
```

**Verify the load before going further.** `get_knowledge` returns `found` **and** `missing` — read `missing` and act on it; never assume a requested doc arrived.

**A failed KB read STOPS the run.** These docs *are* the rules this skill applies; it holds no copy of any of them. Retry a missing path **once**, and if it still does not resolve, **STOP and name the doc** — do **not** proceed from a remembered version, and do **not** substitute a softer fallback rule so the run can finish. Two sources of truth for a doctrinal rule is the drift this repo has already been burned by, and a run that stopped is recoverable in a way a run that silently used stale doctrine is not. Concretely:

- **`brand/personas` in `missing`** — no roster, no honest persona selection: STOP. Guessing a persona back into existence is exactly the padding this skill exists to prevent.
- **`craft/doctrine` in `missing`** — no live definition of the chain, of what writing to a mechanism means, or of the bar an angle-local override must clear: STOP.
- **`craft/mechanism-bank` in `missing`** — retry once; if it still does not resolve, no standing supply means an override could not be **bank-first** and would be invented blind against a library you cannot see. **`craft/mechanism-bank` is scoped to override consideration, not to every run**: read it live whenever an angle-local override is being considered, and a failed read of it authorises **no** override this run — every angle falls back to the inherited mechanism or is dropped as a misfit, and the gap is named plainly rather than left silent — never a run halted, never a remembered bank, and never an override authored without a successful live read. Name the gap in the Step 7 summary, and never treat "I recall no fitting entry" as evidence that none exists. A run that authors no override is otherwise unaffected by this doc.
- **`rules/compliance` in `missing`** — retry once; if it still does not resolve, **no angle-local override may be authored this run.** Every angle falls back to the inherited mechanism (or is dropped as a misfit), and the gap is named in the Step 7 summary. Never author an override you could not compliance-check, and never soften or re-trace a route to get around the gap. A run that authors no override is otherwise unaffected by this doc.
- **`craft/awareness-framework` in `missing`** — no ladder, no route lens, no sophistication position, no way to confirm the declared stage admits more than one lead: STOP. Never guess a `route_term_id` or an `awareness_stage`, and never substitute a remembered version of the framework.
- **`ad/layer-tones` in `missing`** — no live per-layer close job (§3) and no stage↔layer mapping (§7), so no `target_layer_term_id` can be derived: STOP. Never guess a layer.
- **`craft/close-job` in `missing`** — no live rule that a brief's `cta` is a direction rather than wording: STOP.
- **`craft/coverage` in `missing`** — no live set-level coverage rule: STOP.

The single exception is a **persona detail doc** (Step 1d): a persona listed in the roster whose own doc is absent is excluded from this run and named as a KB gap. That is not a fallback — nothing is remembered in her place, and the run continues only for the personas whose docs actually loaded.

### Step 1d: Load every currently-listed persona's detail doc, then select the personas THIS SUBJECT genuinely fits

From `brand/personas` (Step 1c), the roster is **open** — never assume a fixed count or a fixed name list; re-read it every run. For **every** persona currently listed, mechanically derive her detail-doc path (`brand/persona-<slug>`, where `<slug>` is her taxonomy `code` with the leading `chi-` prefix removed, e.g. `chi-huong` → `brand/persona-huong`) — this is a mechanical rule, not a lookup table, and holds for any persona added later. Load **all** of them in one batch call (this is a batch skill — a subject may fit several personas, so load everyone's doc upfront rather than one-at-a-time):

```
Call: get_knowledge
  paths:
    - brand/persona-<slug1>
    - brand/persona-<slug2>
    - ...   # every persona currently listed in brand/personas
```

If a doc is in `missing`: retry once via the roster's own detail-doc pointer (the mechanical `<slug>` rule can mis-derive); if it still doesn't resolve, that persona is **tagged in the roster but has no detail doc** — a KB gap distinct from "doesn't fit." Exclude her from this run's candidate pool, report the gap by name in Step 7 (so the operator can commission the doc), and continue evaluating every persona whose doc **did** load — a gap on one persona is never a reason to stop the whole run.

**Now judge genuine fit, for every persona whose doc loaded — not just the first one.** For each, read her full anchor pool — **core pain** (`Nỗi đau cốt lõi`), **insight** (`Sự thật ngầm hiểu`), ranked **trigger points** (`Điểm kích hoạt`), **objections** (`Rào cản lớn nhất & cách tháo gỡ`), and **myths** (`Niềm tin sai cần tháo gỡ`) — and ask: does `idea.title` (the subject) genuinely connect to at least one of them? A connection is genuine when the subject *is*, in substance, one of her stated pains/insights/triggers/objections/myths, or a direct instance of one — not a connection you have to strain to argue for. Hold, per fitting persona, **which anchor(s)** resonate and a one-line note of why.

- **A persona who doesn't genuinely fit is simply not used.** Never force a connection to pad out the persona spread — that is a padding violation exactly as serious as re-using a spent anchor (see "Never pad" above and Step 3).
- **Never stop at the first fit.** Evaluate every persona whose doc loaded, independently. The entire point of this rewrite is that a subject fitting three personas yields angles for all three, not just whichever one you considered first or whichever the idea "felt like" — there is no idea-level persona anymore to bias you toward one.
- **If NO persona genuinely fits** — the subject connects to no one's real anchor pool on the current roster — this is a legitimate (if unusual) empty result. Skip straight to Step 7's empty-result summary (subject-fits-nobody variant) and save nothing. Do not force a weak fit merely to have something to brief.

Hold the resulting **fitting-persona set** — each with her held anchors, her `Tránh` list, and her taxonomy `code` — forward into Step 2 onward. Also hold `craft/doctrine`, `ad/layer-tones` (§3 the layer→job assignment, §7 the stage↔layer mapping), `craft/close-job` §3 (Step 4's `cta`-is-a-direction authority) and `craft/coverage` (all loaded in 1c) and, only when a founder/story-led angle is in play for some persona (`programme/kieu-my-story` — load it now if any fitting persona's connecting anchor looks story/confession-shaped; it is the sole source for any Kiều My personal scene, never invented).

### Step 1e: Diagnose the market-wide strategic filter (once)

Run this **once per subject**, before Step 3 selects anything — it constrains every angle, for every persona, uniformly.

1. **Sophistication stance.** Read Cambridge's stated position and the winning stance that follows it from `craft/awareness-framework` §2's sophistication section (market-wide, not persona-specific). This constrains **what any angle is allowed to lead with**: in a claim-saturated market a bare benefit claim is strategically dead no matter how well it traces to a real anchor. Apply the stance the live doc states — do not assume it.
2. **Emotion audit, per fitting persona.** For **each** persona selected in Step 1d, write **one** Vietnamese line in the framework's template shape — *nobody buys this for the functional reason, they buy it to feel [the emotion cluster]* — using the framework's cluster for **that persona** if the doc differentiates one, or the market-wide cluster if it does not (read live which the doc actually provides; never invent). Every angle for that persona (Step 4) must serve her cluster, not merely the functional outcome.

**Awareness stage itself is diagnosed per-angle in Step 3, not here** — it depends on which specific anchor an angle addresses, and the same anchor-kind can sit at a different stage for a different persona (a persona already actively comparing diet programmes reads a given anchor later on the ladder than one who hasn't started looking). There is no single stage for the whole run; do not diagnose one here and reuse it across every persona.

Hold sophistication stance + the per-persona emotion lines forward. They are **constraints on the angle pool, not extra angles** — they never manufacture an angle a persona's doc does not support.

### Step 2: Read the TAKEN SET — every existing brief, any status, now scoped per persona

**This runs BEFORE any `save_brief`, on EVERY invocation.** It does not gate you — it **informs** you.

First, resolve the taxonomy ids you will need throughout (for reading the taken set back, and for saving new angles):

```
Call: list_taxonomies
```

(No `kind` filter — one call returns every kind.) Build three `code → id` maps from the rows where `kind === 'persona'`, `kind === 'route'`, and `kind === 'campaign_layer'`. **Never invent an id and never pass a code where an id is required** — every `*_term_id` you eventually pass to `save_brief` comes from one of these maps.

Then read the subject's briefs:

```
Call: list_briefs
  idea: <idea.id>
```

It returns **ALL** of the subject's briefs — one row per angle, each with its `id`, `status` (`draft` | `approved`), `angle_label`, the five narrative fields, `score`, `comment`, and (on any brief saved under this model) `persona_term_id`, `route_term_id`, `target_layer_term_id`, `awareness_stage`. On an older brief predating this fan-out model, those four fields may be null — for those, infer the persona/anchor the same way this skill always has, by reading the narrative fields' content, and note the inference in the Step 7 summary rather than treating the row as unclassifiable.

**If Step 1a wrote a hero this run**, every row this call returns predates that write — hold their `angle_label`s for the Step 7 `**Hero:**` line, and (for the **draft** ones) as curation candidates for Step 6b. Step 2 itself only READS; it edits nothing.

**Group the taken set by persona, then by anchor within her — AND split it by status:**

- **Any status counts for the APPEND taken set** — a **draft** brief is just as "taken" as an **approved** one when you decide which *new* angles genuinely remain (Step 3): don't append a near-duplicate of either.
- **But status decides what you may TOUCH.** Hold the two apart: **APPROVED** briefs are locked read-only input — their anchors are permanently spent and never edited/deleted. **DRAFT** briefs are provisionally taken but **curatable** in Step 6b — a weak or redundant draft anchor can be revised or (no-cost) discarded, so it is not spent forever.
- **Within one persona, no anchor repeats.** Match each taken brief's `persona_term_id` back to a persona (via the map above) and hold, per persona, which anchor(s) — core pain / insight / trigger / objection / myth — her existing briefs already spend, read off her five narrative fields (not just her label).
- **The SAME anchor recurring under a DIFFERENT persona is NOT a taken-set collision.** Two personas can both hold "phải nhịn ăn mới giảm được" as a myth in their own docs, and briefing both of them on it is the intended fan-out this rewrite exists to enable — as long as each angle is genuinely grounded in *that* persona's own doc section (her own vocabulary, her own framing), not copy-pasted from another persona's. A literal copy-paste (same wording lifted across personas) is still a defect, but a genuinely independent expression of a shared myth/pain is not.

> **A gap, honestly disclosed, not papered over.** The design for this model aspires to widen the taken set further still — comparing against the *whole plan's* angles, not just this one subject's, so the same persona × route pair isn't re-spent identically across different subjects. No shipped tool supports that today: `list_briefs` takes only one `idea`, with no plan-scoped listing. Until one exists, the taken set enforceable here is this subject's own briefs (now correctly scoped per persona, per anchor) — say so in the Step 7 summary rather than fabricate a cross-subject check you cannot actually perform.

Then **always proceed to Step 3** — there is no stop here. Cold start (no briefs at all): the taken set is empty for every persona; propose up to **five** angles, spread across the fitting personas. Top-up (≥1 brief exists, for any persona): propose only the angles that genuinely remain — possibly none.

**Step 2 is a pure READ** — it changes nothing. Appending happens in Step 6, curating the DRAFT rows in Step 6b. Approved briefs are never touched at any step.

### Step 3: Select the persona × anchor × route angles that are still available

For **each** fitting persona (Step 1d), her remaining candidate anchors are her five-kind pool **minus** whatever her taken set (Step 2) already spends. For each remaining candidate:

- **Diagnose ITS awareness stage — a per-angle judgment, never a baked table.** Read the 5-stage ladder from `craft/awareness-framework` §1. Judge which stage *this specific (persona, anchor) pair* addresses, informed by: (a) the anchor's own nature — a felt-but-unnamed pain/insight typically reads earlier on the ladder than a stated objection to a *named* solution, which typically reads later than a general myth about solutions-in-general; and (b) this persona's own signals in her doc (her channel/trust behaviour, her buying behaviour) — a persona already actively comparing diet options sits later on the ladder than one who hasn't started looking, even on the *same* anchor kind. Two different personas can land the same anchor-kind at two different stages; the same persona's different anchors typically span different stages too. This is a judgment call each time, not a lookup.
- **From that stage, pick a route.** Read `craft/awareness-framework` §4's lens (live) for which routes (Problem / Solution / Comparison / Proof / Curiosity) a stage at that point on the ladder can actually receive, and choose the one this anchor's own nature supports — a pain/insight anchor often reads naturally as Problem or Curiosity; an objection often reads as Comparison or Solution; a myth often reads as Solution or Proof — but this is anchor-driven judgment against the live doc, never a fixed table. **Don't force a route you have no raw material for** (no real proof point → no Proof route; no clear alternative to name → no Comparison route).
- **From that stage, name the layer it implies.** The stage→layer mapping is **paid** and does **not** live in the framework — read it live from **`ad/layer-tones` §7**, which names which layer(s) (L1 cold / L2 awareness-omnipresence / L3 warm-retarget / YouTube) a given stage implies, and says plainly that it is a typical-audience tendency rather than a definition (layer and stage stay two axes; the admitted lead set is always looked up by STAGE, never by layer). Read it in the same pass as the ladder. If it admits more than one layer for a stage, pick the one this angle's specific route/anchor best matches and say why in the `comment`.
- **Confirm the stage admits MORE THAN ONE lead — then stop there.** Check the diagnosed stage against the awareness→lead mapping (`craft/awareness-framework` §6–§7, live). You are checking the **stage**, not choosing a lead: the mapping is overlapping by design, and a stage that admits two or three leads is exactly what leaves the writer room to span them. If your diagnosis lands on a stage the live mapping admits only one lead for, treat that as a signal to **re-read the ladder and re-check the diagnosis**, not as licence to name the lead. **Whatever you find, no lead is recorded, named, or implied on this brief** — see *What a brief DECLARES*. Never write the roster of leads into your notes, the `comment`, or any narrative field.
- **Confirm the angle can be written to the subject's mechanism** (`idea.mechanism`, Step 1) — that is the default and the expected outcome. A candidate whose argument only works by supplying a *different* mechanism is **not automatically a misfit any more**: it is the one case the **angle-local override** exists for, and it goes to Step 4 as an override candidate — but **only** where the inherited mechanism genuinely does not serve *this angle's* persona × route, never merely because another mechanism would also read well. If the angle can be written to the inherited mechanism, it is, and no override is considered. If it can be written to **neither** the inherited mechanism nor an override that clears every bound in *Carry the mechanism* above, it is a **misfit angle** — drop it, and never re-mechanise the subject to save it. (Skip this check only when the subject is a legacy row carrying none; then say so in Step 7, and author no override in its place.)
- **Clears the sophistication bar** (Step 1e, global) — never a bare benefit claim at Cambridge's stated position.
- **Never violates THIS persona's own `Tránh` list.** Check against the `Tránh` list held for *her* in Step 1d — never another persona's. A prohibition usually rules out a *framing*, not the anchor itself; re-frame through her doc's own suggested replacement rather than dropping the anchor.
- **Distinct from her own taken set AND from every other candidate for her in this batch** — the anchor rule, unchanged in kind from before, just correctly scoped to one persona at a time.

**Spread across personas — this is the anti-lock-in rule this rewrite exists to enforce.** When more than one persona fits and the pool must be capped (Step 3's "how many" below), never let one persona's candidates consume the whole batch just because she was evaluated first or has the deepest doc. Prefer a candidate for a persona currently **under-represented** in this batch (and in the taken set) over another candidate for a persona already well covered — the same diversity discipline the old skill applied to angle *type*, now applied to *persona* as well. Where the approved Approaches (Step 1b) emphasises a persona × route pairing, prefer it when the subject genuinely supports it — but never let that override genuine fit or force a pair the subject doesn't support.

- **How many.** Cold start (every persona's taken set is empty): select **up to FIVE** total, spread across the fitting personas rather than spent on one. Top-up: **however many genuinely remain available** across every fitting persona — never a fixed count, never padded to match a previous batch size. One strong new angle, for one persona, is a good run; zero is a legitimate run.
- **Diverse in ROUTE, too, where the pool allows it** — a lineup that is all one route (even if spread across personas) is a flag to disclose, never a defect to fix by inventing an off-stage route.
- **NEVER pad — anchor, persona, or route.** The count is capped by how many distinct (persona, anchor) pairs the subject and the fitting personas' docs genuinely support, minus what's already taken. A fabricated angle — a near-duplicate, a forced persona-fit, or an off-stage route argued harder — is worse than an empty result.

If, after this selection, the fitting-persona set from Step 1d yields **zero** available (persona, anchor) pairs across all of them — every one's distinct anchors are already taken — that is the "taken set exhausted" empty-result case (Step 7), distinct from Step 1d's "fits nobody" case.

### Step 4: Per angle, derive the brief fields — and resolve its ids

For **each** selected angle, derive the five narrative fields plus its label, grounded in `idea.title` (the subject), this angle's own **persona**'s detail doc (her real vocabulary, `Từ vựng thật`, with `Né / thay thế` swapped out, and her tone, `Giọng điệu phù hợp`), and the diagnosis from Step 3. Never fabricate detail beyond what these sources support, and **check every field against THIS persona's `Tránh` list before you write it down**.

**Every field below must strictly follow — never contradict — the decisions already made for this angle: its persona (Step 1d), its diagnosed route / `awareness_stage` / layer (Step 3), its own `angle_label`, and the idea's own `hero` (Step 1a).** Derive the fields and the label together as one coherent angle, not as independent drafts that happen to share a persona: `hook_direction` and `core_message` must read as the SAME route and the SAME stage Step 3 diagnosed (a Comparison-route, late-stage angle cannot carry a Curiosity-route, early-stage hook), `why_now` must name that same stage without drifting from it (unchanged rule, restated here for the same reason), and `angle_label` must name the same anchor the five fields actually express — never a label that promises one anchor while the fields deliver another. When a drafted field would read as a different route, stage, or anchor than what Step 3 already decided, **rewrite the field to match the decision — the decision never bends to fit a nicer-sounding field.** `hero` binds every angle derived from this idea alike — it is idea-wide, not re-decided per angle — so a `core_message` that centers a different product/feature/pain-point than the idea's hero names is exactly the same class of defect as one that centers the wrong route or stage. **`mechanism` binds the same way, with one bounded difference.** The angle's **resolved** mechanism — the subject's inherited one, or the **angle-local override** this angle declared under every condition in *Carry the mechanism* — is what every field must be consistent with. A field that quietly supplies a *competing* mechanism this angle never declared as an override is that same class of defect again; a declared, bounded, reported override is not that defect at all, and the fields are then written to **it**.

**Two things no field may do, at any point in this step.** (a) **Name or imply a lead type** — the fields declare stage and layer and leave the lead to `ssc-ads-writer`; a `hook_direction` only one admitted lead could open is a violation even though it names none. (b) **Restate the angle's resolved mechanism** — write to it, never reproduce it, whether it is the inherited one or this angle's declared override. Both cap at 2 in Step 5, and both are rewritten rather than argued for. **Varying the inherited mechanism *without* a declared, bounded, reported override** is a third defect of the same weight — that is drift, not an override, and it caps at 2 too.

**The five narrative fields (angled to THIS angle's persona + anchor):**

- **`hook_direction`** — name this angle's **route** and state which of **this persona's** anchors its hook works from. If her doc names the strongest emotional hook for this anchor outright (common in the core-pain section), that named hook **is** the hook direction — take it from the live doc rather than inventing a parallel one. **It stops at route + anchor: it never names a lead type, and it must stay open to every lead the declared stage admits.** A hook direction only one lead could open has written the writer's decision into the brief — rewrite it broader. (Sanity check: could a writer take this direction down two different admitted leads and get two genuinely different first lines? If not, it is too narrow.)
- **`core_message`** — one clear Vietnamese sentence: the subject sharpened to this persona's anchor. Must serve **her** emotion-audit cluster (Step 1e) and, at Cambridge's sophistication position, carry mechanism and/or identification rather than a bare benefit claim. **It is written TO this angle's resolved mechanism, never as a restatement of it** — consistent with `idea.mechanism`, or with this angle's declared **angle-local override** where it carries one, leaving the writer able to hit the mechanism beat, and never paraphrasing, sharpening or softening it. **It never silently replaces the inherited mechanism with this persona's own**: a different mechanism reaches a `core_message` only as an override that was declared, bounded and reported — otherwise the angle is written to the inherited one or dropped as a misfit. Read `craft/doctrine` §2 live for what that distinction is; do not restate the mechanism as a sixth field.
- **`why_now`** — the timing/audience-stage rationale for THIS angle: name the diagnosed **awareness stage** (Step 3) in plain Vietnamese and the plan period (`YYYY-MM`, Step 1b) when it resolved. Unlike before, this field is no longer the sole channel carrying the stage/route downstream — `awareness_stage` and `route_term_id` are now structured fields on the brief itself (Step 4's id resolution, below) that `ssc-ads-writer` can read directly. Keep `why_now`'s prose **consistent** with those structured fields — never let it contradict what you are about to save on `route_term_id` / `awareness_stage`.
- **`story_moment`** — a concrete scene direction, **only if this angle is story/person-led**, grounded in this persona's buying-behaviour + vocabulary (Kiều My scenes ONLY from `programme/kieu-my-story`). Otherwise write **exactly**: `Không áp dụng — chủ đề không thuộc dạng kể chuyện.`
- **`cta`** — a **DIRECTION ONLY, never fixed wording, and subordinate to the layer rule.** Say in a few Vietnamese words what this angle's close should *do*; never hand down a finished call-to-action sentence for the writer to paste. **Two authorities, read live in Step 1c. `craft/close-job` §3 owns the rule itself** — a brief states the close's JOB, never its wording, and it may not ask for a job other than the one the channel's close rule assigned — and **§2 owns the three-job vocabulary** (qualify / pre-sell / neither) the direction is phrased in. **`ad/layer-tones` §3 owns the paid assignment** — which of those jobs this angle's declared layer gets, and the KPI reasoning behind it — and its §5 demotes CTA **wording** to non-exhaustive illustration. So the layer's job is the constraint you write to; the phrasings in that doc are examples, not a menu, and lifting one as this angle's `cta` re-fixes the wording the doc just demoted.

  **The layer rule always wins.** Where your `cta` and the layer's close job disagree — including on a brief written before that job was revised — **the layer rule governs and the `cta` yields.** `ssc-ads-writer` treats the layer as authoritative and corrects a mismatched `cta` downstream; a `cta` that fixes wording only guarantees that correction happens silently. A `cta` that would push a layer to do a job that is not its own is **wrong even when it reads well** — cut it back to a direction that serves the job the live doc states.

All five values are Vietnamese prose. Do NOT derive or write a `theme` value.

**If — and only if — this angle came out of Step 3 as an override candidate: author the angle-local override, or drop it.** Do this *before* writing the five fields, because the fields are written to the angle's **resolved** mechanism. Work every bound in *Carry the mechanism* in order, and stop at the first one that fails (a failed bound means **no override**: the angle falls back to the inherited mechanism, or is dropped as a misfit — it is never rescued by relaxing a bound):

1. **Re-check the trigger.** Does the inherited mechanism genuinely fail *this* persona × route, or would it simply be less convenient? Only the first opens the override.
2. **Bank-first.** Scan `craft/mechanism-bank` (loaded live in Step 1c) for an entry that serves this persona × route. A fitting entry supplies the override and you hold its `bank_id`. Only where none fits do you author a new Vietnamese mechanism sentence, held as `in_bank: false`.
3. **Judge it against `craft/doctrine` §2, read live** — the same definition every other mechanism meets.
4. **Ground it** in one attributed voice-of-customer item from the approved Approaches document held in Step 1b (`plan.context`). Hold the item and its attribution verbatim. **Run no outward pass of your own** — you hold no tool for it, and an unattributable phrase supports no override. If `plan.context` was unavailable (Step 1b), there is nothing to attribute to: author **no** override this run and say so in Step 7.
5. **Route its proof** from the proof lines the approved Approaches document held in Step 1b (`plan.context`) already states — each candidate mechanism there carries a proof family + trace already selected from this period's stated inventory and already marked verified or `unverified_for_period`. That document is the only proof route readable here (no head-plan read exists in this skill's tools), so carry its route rather than re-deriving one; where it states no route this override can carry — or `plan.context` was unavailable — mark the route **unverified for the period** rather than assuming one.
6. **Compliance-check that route** against `rules/compliance`. Refused → **drop the override**; never soften the claim and never re-trace it onto another family.

Hold, per surviving override: the angle, the **override sentence** (Vietnamese), `bank_id` **or** `in_bank: false`, the **inherited mechanism it departs from** (verbatim), the **reason** it does not serve this angle's persona × route, the **attributed voice-of-customer item**, and the **proof route** (family + trace + verified/unverified). All of it is reported in Step 7; the sentence itself is what Step 6 passes as `mechanism`. `idea.mechanism` is not written, and no sibling angle is re-opened, re-run or re-scored.

**The `angle_label` (MANDATORY, distinct per angle, AND persona-legible).** A short Vietnamese label naming this angle's persona AND its anchor — since one subject now yields angles for **several** personas, a label naming only the anchor is ambiguous the moment two personas land similar-sounding hooks. Make the persona identifiable at a glance, e.g. `<Tên persona (từ brand/personas)> — <tên gọi ngắn cho anchor>` such as `Chị [tên persona] — nỗi sợ chùng da khi giảm cân` — the persona's actual name/label always comes from the live roster read in Step 1d, never a name assumed or remembered here. No two labels are the same — neither within this batch nor against any label already in the taken set.

**Resolve the ids, from the maps built in Step 2:**

- `persona_term_id` ← `personaMap[this angle's persona's taxonomy code]`.
- `route_term_id` ← `routeMap[the route code chosen in Step 3]` (`problem` / `solution` / `comparison` / `proof` / `curiosity`).
- `target_layer_term_id` ← `layerMap[the campaign_layer code the diagnosed stage implies, Step 3]`.
- `awareness_stage` ← the diagnosed stage, expressed as one of the tool's five fixed tokens: `unaware` / `problem-aware` / `solution-aware` / `product-aware` / `most-aware`. (These five token names mirror the live ladder's own stage names — the JUDGMENT of which one applies is what Step 3 reads live; the token itself is just the field's fixed wire format, same as `channel: post|ad|youtube` elsewhere.)

**Never resolve `audience_intent`.** It is not part of this skill's output — see Governance.

**Never resolve a lead-type term id.** A `lead_type` taxonomy kind exists, and `list_taxonomies` returns its terms — that is for `ssc-ads-writer`, which resolves one **per produced asset**. A brief has no lead field and you never populate one, never stash a lead code in `comment` or a narrative field, and never enumerate the roster in this skill's prose. `save_brief` takes no lead argument; if a future one appears, this skill still does not pass it.

If a code you need is not in the map returned by `list_taxonomies` (a persona/route/layer that genuinely doesn't exist in the live taxonomy), do not invent an id — drop that candidate angle, note the mismatch in the Step 7 summary as a taxonomy gap, and move to the next candidate.

The `score` + `comment` are assigned in Step 5.

### Step 5: Quality gate — self-score, drop, and regenerate

Mirror `ssc-ads-writer`'s honest-scoring quality-replacement loop. For **each** angle, self-score `1–5` (integer) on:

- **Distinctiveness** — genuinely different from every brief in the TAKEN SET for **this angle's persona** (Step 2) **and** from every other angle in this batch (any persona)? A near-duplicate within the same persona caps low; the same anchor genuinely re-grounded under a *different* persona is not itself a duplicate (see Step 2).
- **Persona fit + grounding** — does this angle trace to a *genuine* connection between the subject and this persona's own anchor (Step 1d), with every field sourced from her doc, nothing fabricated? A forced-fit angle — a persona whose connection to the subject was strained rather than real — caps low here even when its wording is polished.
- **Strategic sharpness** — a real, pointed, actionable argument, not a vague restatement of the subject. Specificity over cleverness.
- **Awareness fit** — does the angle's route match its diagnosed stage (Step 3), and does it clear the sophistication bar? A well-sourced angle aimed at a stage its route can't land caps low here.
- **Decision fidelity** — do `hook_direction` / `core_message` / `why_now` plainly read as the SAME route, stage, and anchor Step 3 diagnosed and Step 4 was supposed to write to — does `angle_label` name that same anchor — and does the angle stay recognizably about the idea's own `hero` (Step 1a)? A field that quietly drifts to a different route/stage/anchor/hero than what was decided caps low here even if the drift reads well on its own.
- **Authenticity + `Tránh` compliance** — this persona's own voice; no corporate register, no ad-speak, no fabricated real-person story. **Any angle that violates THIS persona's `Tránh` list caps at 2 — a hard cap**, regardless of how distinct/grounded/sharp/on-stage it is. This is the FIRST `Tránh` gate; `ssc-ads-writer`'s Step 7(d) gates the finished sentences separately and is never a reason to relax this one.
- **Close-job compliance (`cta`)** — is `cta` a **direction** rather than fixed wording (`craft/close-job` §3), and does it serve the **close job** this angle's diagnosed layer is assigned (`ad/layer-tones` §3), phrased in that doc's own three-job vocabulary (`craft/close-job` §2)? Both read live in Step 1c. **Any `cta` that fixes a finished call-to-action sentence, or that pulls the close toward a job that is not this layer's, caps at 2 — a hard cap**, the same weight as a `Tránh` violation. The layer rule wins; the `cta` yields.
- **Mechanism fidelity** — is this angle written **to** its **resolved** mechanism (the subject's `idea.mechanism`, or this angle's declared angle-local override), consistent with it and leaving the writer able to hit the mechanism beat? **Any angle that restates, paraphrases, sharpens or softens its resolved mechanism caps at 2 — a hard cap.**

  **A competing mechanism and a declared override are not the same thing, and they do not score the same.** Apply this test literally, in this order:

  - **A COMPETING mechanism caps at 2 — a hard cap.** That is an angle whose fields quietly argue a mechanism other than the inherited one **without a declared override**: no trigger stated, no `bank_id` or `in_bank: false`, no attributed voice-of-customer item, no proof route, nothing to report. It is drift, and the cap is unchanged from before this permission existed. The giveaway is that a reader cannot tell the angle departed at all.
  - **A DECLARED, BOUNDED, REPORTED override is not penalised — it does not cap, and it earns no bonus either.** It is scored on the same merits as any other angle. "Declared, bounded, reported" means all three, and they are checkable: the angle **declares** the override and the reason the inherited mechanism does not serve *this* persona × route; it is **bounded** — bank-first with a `bank_id` (or `in_bank: false` where nothing fit), judged against `craft/doctrine` §2 read live, grounded in an attributed voice-of-customer item from the approved Approaches document, proof-routed from the proof lines that document already states (or marked unverified for the period where it states none the override can carry), and not softened or re-traced after a compliance refusal; and it is **reported** in Step 7 with its provenance. Score the angle as written.
  - **An override missing ANY of those three caps at 2, and the override is withdrawn** — the angle falls back to the inherited mechanism or is dropped. A half-declared override is a competing mechanism with better manners, and it scores as one.
  - **An override authored where the inherited mechanism DOES serve this angle's persona × route caps at 2** — the override is for a genuine misfit, never a preference. "Another mechanism would also work" is not a trigger.
  - **An override that touches `idea.mechanism`, or that re-opens, re-runs, re-scores or reports stale any sibling angle, caps at 2** and is withdrawn. Its blast radius is one angle.

  The mechanism is the idea's and is never re-authored per persona; the override is angle-local and departs from it only under the bounds above. Skip this whole criterion only on a legacy subject carrying none (Step 1) — and author no override in its place — saying so in Step 7.
- **Lead-openness** — do the fields leave the writer free to choose among the leads this angle's declared stage admits? **Any field that names a lead type, or a `hook_direction` only one lead could open, caps at 2 — a hard cap.** The lead is the writer's per-asset decision; a brief that pre-empts it collapses the overlap coverage runs on.

Write a one-line Vietnamese `comment` for each, naming the source it traces to and, where relevant, why this layer/route was chosen over an alternative. Use the full range honestly.

**No separate banned-words / compliance tool scan** — a brief has no regulatory compliance gate (that's copy time, in `ssc-ads-writer`). **The exception remains the persona's `Tránh` list**, checked here per the angle's own persona.

**Quality-replacement loop — no saved angle may remain ≤3:**

1. Identify every angle rated ≤3.
2. Drop it (never saved) and draft a fresh, stronger replacement — for the **same persona** (a different anchor she genuinely holds, not yet taken), or, if her pool is genuinely exhausted, a candidate for a **different fitting persona** instead of forcing another weak angle on her. Fixing the named failure: an angle dropped for awareness fit is replaced by re-expressing through an on-stage route or a different anchor the stage admits — never by arguing the off-stage angle harder. An angle capped for `Tránh` is replaced by re-framing the same anchor in a permitted direction. An angle capped for a **competing mechanism** is replaced by re-writing it to the inherited mechanism, or — where the inherited one genuinely does not serve this persona × route — by authoring a proper angle-local override that clears every bound; never by arguing the undeclared mechanism harder, and never by relaxing a bound so a failed override passes. Re-score. **Bound at 2 replacement attempts per angle.**
3. Continue until every angle in the batch is ≥4 — or the honest supply is exhausted (never invent a padding angle, on any persona, to reach five or to avoid an empty batch).

**If nothing survives (or nothing was available), save NOTHING and STOP** — Step 7's empty-result summary names which of the three reasons applies (fits no persona / taken set exhausted / too thin to reach ≥4).

### Step 6: APPEND each passing angle as a DRAFT brief

For **each** angle rated ≥4, INSERT a DRAFT `brief` **immediately**. If **no** angle passed, **skip this step entirely** and go to Step 6b (curation still runs even when the append is empty):

```
Call: save_brief
  idea_id:               <idea.id from Step 1>
  channel:               ad
  angle_label:           <this angle's mandatory, persona-legible, distinct Vietnamese label>
  hook_direction:        <derived, angled to this angle's persona + anchor>
  core_message:          <derived>
  why_now:               <derived — consistent with route_term_id / awareness_stage below>
  story_moment:          <derived, or the "Không áp dụng…" line>
  cta:                   <a DIRECTION only — never a finished call-to-action sentence;
                          serves this layer's close job, and yields to it on any conflict>
  score:                 <the integer 1–5 you assigned (≥4)>
  comment:               <the one-line Vietnamese rationale>
  persona_term_id:       <resolved via list_taxonomies, Step 4>
  route_term_id:         <resolved via list_taxonomies, Step 4>
  target_layer_term_id:  <resolved via list_taxonomies, Step 4>
  awareness_stage:       <one of: unaware | problem-aware | solution-aware | product-aware | most-aware>
  mechanism:             <ONLY on an angle that authored an angle-local override: that
                          override's Vietnamese sentence, verbatim (Step 4). OMIT the
                          argument entirely on every other angle — see below>
```

**Never pass `audience_intent`.** It is a deprecated, dormant column with no consumer in this model — the server still accepts it (until the Contract phase drops it) but this skill never writes it. Do NOT pass `theme` or any approval/status field either.

**Never pass a lead. Pass `mechanism` if — and only if — this angle authored an override.** The brief's declared identity is persona × route × anchor + `awareness_stage` + `target_layer_term_id` — **no lead type**, because the writer picks that per asset from the stage's admitted set.

`mechanism` is the one field that is now conditional, and the condition is exact:

- **No override → OMIT the argument.** Do not pass it as `null`, as an empty string, or as a copy of `idea.mechanism`. Omitting it is what makes the angle plainly **inherit** the subject's mechanism; copying it down would create a second copy free to drift out of agreement with the subject it came from, which is precisely why the field is not a mirror of the idea's.
- **Override authored → pass exactly that override's Vietnamese sentence**, verbatim from Step 4. Never a summary of it, never with a `bank_id`, a valence marker or a bracket tag stuffed into the sentence — the string must reach `ssc-ads-writer` clean, because the writer carries it verbatim.

**Degraded state, while the server has no `mechanism` argument on `save_brief` — this is expected, and it is not a bug.** The field is a staged server change that had not landed when this skill was written. Decide by the tool's own live surface, not by assumption: if `save_brief` accepts no `mechanism` argument (or rejects the call because of it), you are in the degraded state, and:

- Save the angle **without** `mechanism` — never let an unpersistable override cost the angle its row — and **report the override anyway** in Step 7, in these words: *override authored, reported and not persisted — `briefs.mechanism` not yet available on the server.* An operator who sees the override in the report and not on the row is looking at the known degraded state, not a dropped write.
- **Repurpose NO other field to carry it.** Not `comment`, not `angle_label`, not `core_message` or any other narrative field, and never `idea.mechanism`. A smuggled value is one no consumer resolves and one that makes the brief's stored fields disagree with the reasoning that produced them.
- When the argument does exist, pass it as specified above and report the override as **persisted**. Nothing else in this skill changes on that day.

`save_brief` **INSERTS** a brief **always created as `draft`**. It is an **APPEND** — it adds a new row alongside whatever the subject already carries and never overwrites an existing brief (mutating an existing draft is Step 6b's job, via `edit`/`delete`, never `save_brief`). Capture each returned confirmation (incl. each new `brief_id` **and its `version`**) for Step 6b and the Step 7 summary. Then **proceed to Step 6b**.

**Propose-only (approval sense):** you never call `approve`, never un-approve, never touch an **approved** brief. You do not curate the angles you just appended — they are already ≥4; Step 6b curates the **pre-existing** drafts.

### Step 6b: Curate the existing DRAFT set

Now tidy the **pre-existing DRAFT briefs** read in Step 2 — the ones that existed *before* this run, NOT the angles you just appended in Step 6 (those are already ≥4). **APPROVED briefs are never touched here.** This pass is `entity='brief'`, this subject's own DRAFT rows **only**.

Re-judge each pre-existing draft against the **Step 5 rubric** + the idea's **current `hero`** (Step 1a) + the live persona / `craft/awareness-framework` / `ad/layer-tones` docs already loaded. It is a **curation candidate** when any of these is true:

- it would now score **≤3** on the Step 5 rubric;
- **mis-homed** — its `route_term_id` / `awareness_stage` / `target_layer_term_id` no longer matches its anchor under the *live* framework (e.g. the framework was revised since it was saved);
- **hero-drifted** — its `core_message` centers a different product/feature/pain-point than the idea's current `hero` (common right after a Step 1a hero write);
- **`Tránh`-violating** — it breaks its persona's live `Tránh` list;
- **label mismatch** — its `angle_label` no longer names the anchor its five fields actually express;
- **near-duplicate** — two drafts under the **same persona** spend the same anchor with near-identical five fields;
- **lead-declaring** — a draft written under the old model that names a lead type, or whose `hook_direction` only one admitted lead could open. Revise it back to route + anchor so the writer's choice is restored; a brief that pre-empts the lead costs the batch its coverage;
- **mechanism-drifted** — its `core_message` restates the draft's resolved mechanism, or quietly supplies a **competing** one, instead of writing to it. A draft that carries a **declared, bounded, reported** angle-local override is **not** drifted and is not a candidate on this ground: re-derive its fields toward that override if some other ground makes it a candidate, and never strip an override to "restore" the inherited mechanism. A draft whose fields argue a different mechanism with **no** declared override is drifted — revise it back to `idea.mechanism`, or author a proper override for it only if it clears every bound in *Carry the mechanism*. **Curation never writes `idea.mechanism`, and never re-opens a sibling angle** because one draft overrode;
- **cta-overreaching** — its `cta` fixes a finished call-to-action sentence (against `craft/close-job` §3), or pulls against the close job its layer is assigned in the live `ad/layer-tones` §3. Cut it back to a direction that serves the job; the layer rule wins, so leaving the mismatch in only means the writer silently overrides it later.

Then act, per candidate:

- **Revise in place (fixable).** `edit(entity='brief', id, { …only the fields that change… }, expected_version)`. Re-derive the offending fields exactly as Step 4 does (grounded in the subject + that persona's doc, `Tránh`-checked), re-home the term ids if mis-homed, and set `score` + `comment` to the new honest rating. If the revision authors an angle-local override (every bound in *Carry the mechanism* cleared), `mechanism` goes in the patch on exactly the terms Step 6 states — **only** when an override was authored, omitted otherwise, and **reported and not persisted** while the server's `edit(entity='brief')` allowlist does not yet carry the field; no other field is repurposed to hold it. The revised angle must land **≥4**; if ≤2 attempts cannot get it there, it is unfixable → discard it if no-cost, else leave-and-report. **Never** put `status` in the patch (that would be a demotion — denied, and not your job), and never mix a demotion with field edits.
- **Discard (no-cost redundant).** For a near-duplicate pair, keep the stronger and discard the weaker; for an unfixable weak draft, discard it — **only if no-cost** (0 creatives AND 0 copy). Use the preview-then-confirm flow from "Discarding a draft angle": `delete(brief, id, expected_version)` with no `confirm` → on `{ confirmation_required, creatives: 0, copy: 0, … }` re-call with `confirm: true`. On ANY refusal or capability-denial (the draft has creatives/copy → needs `approve`; it or its dependents are approved → refused) → **STOP that discard, leave the row untouched, and report it in Step 7** as the operator's to remove. Never un-approve or delete dependents to force it.
- **Leave.** A healthy draft (already ≥4, on-hero, on-stage, `Tránh`-clean, distinct) → untouched. A weak/duplicate draft that carries produced work → untouched (you cannot discard it) and named in Step 7.

**Discipline — curate, don't churn.**

- `expected_version` comes from the row you read in Step 2; on a `stale_version` refusal, re-read once via `list_briefs` and retry, else report and move on.
- A **no-op Step 6b is the normal, healthy outcome** — a sound draft set is left exactly as it was. Editing costs nothing, which is precisely why you must not touch a draft that is already fine.
- **The operator protects an angle by APPROVING it** — an approved brief is immutable here. A row left as a draft is, by that choice, still in play for curation, no matter which run created it. So curation ranges over **every** pre-existing draft (not only ones from this run), but never over an approved one.
- Bound revision at **2 attempts per draft** (mirrors Step 5). Never discard a draft only to re-append a near-identical one — that is churn, not curation.

Hold a curation tally for Step 7: **revised** R, **discarded** D, **could-not-discard** C (with reasons).

### Step 7: Output summary

**If no new angle was appended** (Step 6 saved none), emit the empty-append summary — a clean, successful outcome (draft curation may still have run; report it in the `**Curation**` line). There are **three** distinct reasons the append came back empty, each with its own honest framing:

```
## Ads Brief — <subject title> — no new angle appended

**Target subject:** <idea_id> — status approved
**Mechanism:** <the subject's mechanism, carried unchanged> — or "absent (legacy subject approved before the doctrine); mechanism fidelity not scored this run, and none was invented."
**Mechanism overrides:** none — no angle was appended this run, so none departed from the subject's mechanism. <If a Step 6b revision authored one, report it on the same terms as the appended-angle summary below, including its persistence state.> <If `craft/mechanism-bank` or `rules/compliance` could not be read, or `plan.context` was unavailable, say so here — no override could have been authored.>
**Taxonomy resolved:** persona / route / campaign_layer maps loaded via list_taxonomies. No lead-type id resolved — a brief declares no lead.
**Personas evaluated:** <every persona currently on the roster whose doc loaded>, of which <N> genuinely fit this subject (<list, or "none">). <Any KB-gap personas named explicitly.>
**Taken set:** <M> existing brief(s) read across <K> persona(s) (<X> approved, <Y> draft) — approved left untouched.
**Curation (drafts):** <R> revised, <D> discarded (no-cost), <C> left for you (has produced work / approved) — or "none needed; the draft set was healthy".
**Hero:** <the resolved hero text> — <"newly defined this run" | "revised this run (was: <old hero text>)" | "already set, unchanged">. <If newly defined or revised:> existing briefs on this idea predating it: <list angle_labels, or "none">. (Step 1a resolves the hero BEFORE the angle search, so a run that saves nothing may still have written one — disclose it either way.)
**Result:** 0 new brief(s) — <ONE of:>
  - "the subject connects to no persona currently on the roster — every roster persona's anchor pool was checked and none genuinely resonates. Sharpen the subject or wait for the roster to grow."
  - "every persona this subject fits already has her distinct anchors spent by existing briefs — <N> brief(s) across <K> persona(s) already cover every anchor + on-stage route this subject + those personas' docs support."
  - "no angle for any fitting persona reached ≥4 — the subject is too thin for a strong angle yet."
Nothing was padded, on the anchor axis or the persona axis, and no NEW brief was appended (any draft curation is reported above).

**Fitting personas and their taken anchors (why nothing remains, when applicable):**
| # | persona | existing angle_label | status | route | anchor |
|---|---------|----------------------|--------|-------|--------|
| 1 | <label> | <label>              | draft\|approved | <route> | <anchor> |
| … | …       | …                    | …      | …     | …      |

**Next:** sharpen the subject (`title`) if you genuinely want more angles, then re-invoke `/ssc-ads-brief <idea_id>`. Otherwise, approve the angle(s) worth producing in /ad/<month>/<idea_id> and run `/ssc-ad <brief_id>`.
```

Never suggest discarding briefs as a way out of an empty result.

**Otherwise, after appending the new angle(s)**, output:

```
## Ads Brief — <subject title> — <N> new angle brief(s) appended across <K> persona(s)

**Target subject:** <idea_id> — status approved
**Mechanism:** <the subject's mechanism, carried unchanged — every angle below is written TO it, or TO its own declared angle-local override; none restates it, and none varies it without a declared override> — or "absent (legacy subject approved before the doctrine); mechanism fidelity not scored this run, and none was invented."
**Mechanism overrides:** <ONE of:> "none — every angle above carries the subject's mechanism." — or the table below, one row per override. **This line is never omitted**: "no overrides" and "overrides not reported" must never look the same to a reader.
**Plan context:** period <YYYY-MM> — or "plan/period unavailable, why_now derived from the subject alone"
**Personas evaluated:** <every persona whose doc loaded>. **Fit:** <fitting personas, and which anchor each connects to> — any persona ruled out as non-fitting is named too, so a "why wasn't she used" question has a plain answer.
**Personas covered this run:** <persona A> (<n> angle(s)), <persona B> (<n> angle(s)), … — <K> distinct persona(s) this run. (Flag plainly if K=1 despite multiple personas fitting: say why — e.g. the batch cap was reached mid-spread, or the other fitting persona's anchors were already fully taken.)
**Diagnosis per angle:** stage + route + layer, in the table below — no single run-wide diagnosis anymore; each angle judged on its own. **No lead is declared on any angle** — each declared stage admits several, and `/ssc-ad <brief_id>` picks one per asset from that set.
**Taken set:** <M> existing brief(s) read across <K'> persona(s) — approved left untouched; the new angles are distinct from every one of them (same persona: different anchor; different persona: independently grounded).
**Curation (drafts):** <R> revised in place, <D> discarded (no-cost), <C> left for you (has produced work / approved) — or "none needed; the draft set was healthy". <If R>0 or D>0:> details in the curation table below.
**Hero:** <the resolved hero text> — <"newly defined this run" | "revised this run (was: <old hero text>)" | "already set, unchanged">. <If newly defined or revised:> existing briefs on this idea predating it: <list angle_labels, or "none">.

| # | persona | angle_label | route | stage | layer | score | anchor | hook_direction | core_message | why_now | story_moment | cta | comment (VN) |
|---|---------|-------------|-------|-------|-------|-------|--------|----------------|--------------|---------|--------------|-----|--------------|
| 1 | <persona> | <label> | <Problem\|Solution\|Comparison\|Proof\|Curiosity> | <stage> | <L1\|L2\|L3\|YouTube> | <score> | <anchor> | <digest> | <digest> | <digest> | <digest or "Không áp dụng…"> | <digest> | <VN> |
| … | … | … | … | … | … | … | … | … | … | … | … | … | … |

**Quality loop:** <count> angle(s) rated ≤3 dropped + regenerated; appended set all ≥4.
**Persisted:** <N> NEW DRAFT brief(s), appended alongside the existing <M> — one row per angle, each with its own `persona_term_id`/`route_term_id`/`target_layer_term_id`/`awareness_stage` plus `angle_label`/`brief_id`. **No lead type was written on any row** — the lead is the writer's per-asset choice. **`mechanism` was written on <n> row(s)** — only the angle(s) that declared an angle-local override; every other row omits the field and inherits the subject's mechanism, which is untouched on the `ideas` row. <Or, in the degraded state:> **`mechanism` was written on 0 rows — <n> override(s) were reported and NOT persisted: `briefs.mechanism` is not yet available on the server. This is the expected state, not a dropped write, and no other field was repurposed to carry them.** `audience_intent` was not set on any row. **No APPROVED brief was touched.**

**Mechanism overrides** — *include this table only when at least one angle overrode; otherwise the `**Mechanism overrides:**` line above reads "none":*

| brief_id / angle_label | persona × route | override (VN) | provenance | departed from | why it does not serve this persona × route | VOC (attributed) | proof route | persisted? |
|---|---|---|---|---|---|---|---|---|
| <id> — <label> | <persona> × <route> | <the override sentence> | `bank_id: <id>` \| `in_bank: false` | <the subject's mechanism, verbatim> | <VN: the reason> | <the item + its attribution in the approved Approaches doc> | <family + trace, or "unverified for the period"> | persisted \| **reported, not persisted (`briefs.mechanism` not yet available)** |

Every override above is angle-local: `idea.mechanism` was not written, patched or demoted, and no sibling angle was re-opened, re-run, re-scored or reported stale.

**Curation (drafts only)** — *include this table only when a draft was revised or discarded:*

| brief_id | persona | angle_label | action | reason | new score |
|----------|---------|-------------|--------|--------|-----------|
| <id> | <persona> | <label> | revised \| discarded \| left (has produced work) | <VN: why> | <≥4, or —> |

**Next:** open /ad/<month>/<idea_id> → review the new angle(s) and **approve the one(s) you want to produce**. Then, per approved angle, run `/ssc-ad <brief_id>` (and later `/ssc-image-prompt <brief_id>`) — one `brief_id` per run. Want more angles? Re-invoke `/ssc-ads-brief <idea_id>` — it appends whatever distinct angles still remain, across whichever personas still fit.
```

If the `date` resolved more than one approved subject (Step 1), note which one you worked and that the rest still need their own passes.

## Output

- **Saved, not presented.** NEW DRAFT `brief` rows via `save_brief(idea_id, channel='ad', angle_label, the five narrative fields, score, comment, persona_term_id, route_term_id, target_layer_term_id, awareness_stage)` — plus `mechanism` on an overriding angle **only**, omitted on every other, and never `audience_intent`. Saved immediately after scoring; no in-chat candidate presentation or revise loop.
- **Appends AND curates — never a fixed count, on either axis.** Cold start: up to five angles, spread across fitting personas. Top-up: only the angles that genuinely remain. Each run also curates the pre-existing **DRAFT** set (Step 6b: revise weak, discard no-cost redundant); a healthy draft set means a no-op curation pass.
- **Possibly no new angle — for one of three honest reasons** (fits no persona / taken set exhausted / too thin), and that is a success (curation may still have run).
- **Approved briefs untouched; drafts may be curated.** Every APPROVED brief is byte-for-byte unchanged at the end. A pre-existing DRAFT may have been revised in place or discarded (no-cost only) in Step 6b — always reported in the summary.
- **No copy precondition.**
- **Every saved angle declares its persona, route, awareness stage, and target layer** as first-class fields — not just narrative prose. `target_layer_term_id` is pinned at save; a later framework revision does not re-home it.
- **No saved angle declares a LEAD** — the stage is declared, the lead is not, and `ssc-ads-writer` picks one per asset from the set that stage admits (mapping read live at writing time). The mapping is overlapping by design and the overlap is where coverage lives.
- **The subject's MECHANISM is carried, not copied.** It stays on the `ideas` row — never written, patched or demoted here; every angle is written to its **resolved** mechanism — the subject's, or its own declared override — no brief field restates it, and a legacy subject carrying none has that absence reported rather than filled in.
- **Every ANGLE-LOCAL OVERRIDE, where a run authored any** — each naming the angle, the inherited mechanism it departed from, why that mechanism does not serve the angle's persona × route, its `bank_id` or `in_bank: false`, its attributed voice-of-customer item, its proof route, and whether it was persisted — or an explicit "none: every angle carries the subject's mechanism". `mechanism` is passed to `save_brief` **only** on an overriding angle and **omitted** on every other; while the server has no such argument the override is **reported and not persisted**, said in those words, and never smuggled into another field.
- **`cta` is a direction, never wording** (`craft/close-job` §3) — subordinate to the close job its layer is assigned in `ad/layer-tones` §3, which wins on any conflict.
- No angle rated ≤3 persisted (whether appended fresh or revised in Step 6b). No gate flipped, no idea `status` touched, no brief approved or demoted, no APPROVED brief edited or deleted. No `content` row created.
- **`idea.hero` may be written once via `edit(entity='idea', patch = { hero })` (Step 1a)** — the sole write this skill makes outside the angle set, and only when the idea has no hero yet or the operator explicitly asked to revise it; see Governance.
- No ad-set/media-buy row created or referenced — the media buy is realized later, by a human, from the angle's declared `target_layer_term_id`.
- Summary of saved angles (persona, route, stage, layer, label, score, Vietnamese comment) plus the grounding context and next step.

## Governance

- **Propose-only in the approval sense (hard rule):** `save_brief` mints only **DRAFT** briefs — no `status` argument. You **never** call `approve` or un-approve (any entity, incl. `brief`), never write the narrative fields or the persona/route/layer/stage fields back onto the `ideas` row, never call any publish/schedule tool, and never call an ad-set/media-buy tool (`create_ad`/`create_adset`/`create_campaign`/`update_budget`/`save_ad_plan_slots`) — the media buy is a separate ops concern this skill never touches; it only declares an intent (`target_layer_term_id`) a human later realizes.
- **Append + curate DRAFTS (hard rule).** `tools:` is `[get_idea, get_channel_plan, get_knowledge, list_taxonomies, list_briefs, save_brief, edit, delete]`. `save_brief` **appends** new draft angles; `edit` / `delete` **curate** the skill's own **draft** briefs (Step 6b). `edit` and `delete` are **generic verbs**, and their reach is scoped by entity, not left open: **`delete` is `entity='brief'` ONLY**, and only on this subject's own DRAFT rows. **`edit` is `entity='brief'` under that same DRAFT-only restriction, PLUS exactly one narrow idea-row exception** — Step 1a's `edit(entity='idea', id, patch = { hero }, expected_version)`, the single scoped idea-row write, carrying **`hero` and nothing else** in the patch. There is no longer a separate per-entity idea write tool; the hero goes through the same generic verb as everything else. Never any other entity, never an approved brief — and **`status` never enters any patch**: a `status` patch is a demotion, which needs the `approve` capability this skill does not hold, and `edit` can never promote anything in any case.
- **APPROVED briefs are immutable, and that is a SKILL rule you enforce (hard rule).** The server blocks the *destructive/promotion* halves for you — un-approving and deleting-a-brief-with-produced-work both need the `approve` capability you lack — but it would let a plain field `edit` (no `status` in the patch) through on an approved row. So **never edit or delete an approved brief** is enforced *here*, in prose, exactly like propose-only: a human blessed that angle's exact wording; you never silently rewrite it.
- **Hero is idea-wide, defined once then read-only unless explicitly revised (hard rule).** `idea.hero` is resolved in Step 1a: derived from `idea.title` alone (never fabricated further) when empty, persisted via `edit(entity='idea', patch = { hero })` before any angle is created, and left untouched on every later run unless the operator gives an explicit `revise hero:` instruction. The hero write itself touches **no** brief. A hero revision never edits, re-scores, or blocks any **approved** brief or its copy — Step 7 only discloses which existing briefs predate the current hero; but a **draft** that now reads as drifted from the new hero is an ordinary Step 6b curation candidate (revise toward the hero, or discard if a redundant no-cost draft). Every angle's narrative fields (Step 4) and `angle_label` must stay faithful to the hero (Step 5's Decision fidelity criterion).
- **Persona is CHOSEN here, never inherited (hard rule).** `ssc-ads-ideate` mints subjects with no persona tag at all — `idea.tags[]` is expected empty. This skill never reads a persona (or any other structural dimension) off the idea; Step 1d always re-selects, fresh, from the live `brand/personas` roster. If a legacy idea unexpectedly carries a stray tag, it is ignored for persona purposes.
- **One subject → many personas (hard rule, the point of this design).** Step 1d evaluates **every** persona whose detail doc loaded, independently, and never stops at the first fit. A subject that genuinely resonates with three personas yields angles across all three (subject to the never-pad rules and the batch cap), not just one. Step 3's spread rule forbids one persona consuming the whole batch when others fit too.
- **`audience_intent` is DEPRECATED — NEVER write it (hard rule).** The shipped `save_brief` still accepts the field and the column still exists on `briefs`, but it has no consumer in this design (the Writer tunes to `persona_term_id`/`route_term_id`/`awareness_stage`; deployment reads `target_layer_term_id`; Measure groups by angle + layer) and it is dropped in the server's later Contract phase. Never pass it, never read it back, never reference it anywhere in this skill.
- **A brief declares the STAGE and the LAYER; it NEVER declares a LEAD (hard rule).** No `save_brief` call carries a lead type, no narrative field names one, no `hook_direction` is written so that only one admitted lead could open it, and this skill's prose never enumerates the lead roster (a seventh lead must need no change here). `ssc-ads-writer` selects the lead **per asset** from the set the declared stage admits, read live from `craft/awareness-framework` §7, and records which it used. **Why, so nobody "optimises" it back:** the awareness→lead mapping is **overlapping by design** — one stage admits two or three leads — and that overlap is exactly where coverage lives. Fixing the lead here would collapse it, would cost **four operator approvals for one creative decision** if a batch wanted to span four leads on one angle, and would freeze the only axis that changes the **first line** — the part the ~125-character fold puts in front of the reader. Step 3 reads §6–§7 only to **confirm the diagnosed stage admits more than one lead**; a stage that admits exactly one is a signal to re-check the diagnosis, never licence to name a lead.
- **The MECHANISM lives on the idea and is CARRIED, never restated, and never varied on this skill's own initiative (hard rule).** The subject's mechanism (`idea.mechanism`, required at Ideate approval, per `craft/doctrine` §2) is inherited by every angle beneath it. Every angle is written **to** its resolved mechanism — consistent with it, leaving the writer able to hit the mechanism beat — and no brief field restates, paraphrases, sharpens or softens it. `idea.mechanism` is **never** written, patched or demoted here, on any path, including Step 6b curation. A **legacy** subject approved before the doctrine may carry none — proceed, drop the mechanism-fidelity criterion, **name the absence** in Step 7, and author no override in its place; never invent one.
- **The ANGLE-LOCAL OVERRIDE is the ONE bounded exception, and every bound is a hard rule.** It opens only where the inherited mechanism genuinely **does not serve this angle's persona × route** — never because another mechanism would also work — and only when **all** of the following hold: sourced **bank-first** from `craft/mechanism-bank` read live (naming its `bank_id`, or marked **`in_bank: false`** where nothing fits); judged against **`craft/doctrine` §2 read live**, the same definition every other mechanism meets; **grounded in an attributed voice-of-customer item from the approved Approaches document** for this period, this skill running **no** voice-of-customer pass of its own and opening no second outward account of the period; **proof-routed from the proof lines that same approved Approaches document already states** — the only proof route readable here, carried on the terms that candidate carries it, never re-derived, and marked **unverified for the period** where the document states no route the override can carry (or `plan.context` was unavailable), never assumed; and **dropped — not softened, not re-traced —** where `rules/compliance` refuses its only route. Fail any one and **no override is authored**: the angle falls back to the inherited mechanism or is dropped as a misfit. An override is **never an escape hatch for a weak angle** — it is for the case where the *angle* is right and the *inherited mechanism* is wrong for it — and it never fills a missing mechanism on a legacy subject.
- **An override's blast radius is ONE angle (hard rule).** `idea.mechanism` is never written, patched or demoted, and sibling angles on the same subject — draft or approved — are **never** re-opened, re-run, re-scored or reported stale because one angle overrode. The guarantee is **one angle, one mechanism** — never *one subject, one mechanism*.
- **Every override is REPORTED (hard rule).** Step 7 names the angle, the inherited mechanism it departed from, why that mechanism does not serve this angle's persona × route, and its provenance (`bank_id`, or `in_bank: false`), plus its voice-of-customer attribution and proof route. A run with **no** override says so explicitly — "no overrides" and "overrides not reported" must never look the same to a reader. An override a human never sees is drift.
- **`mechanism` is passed to `save_brief` if and ONLY if an override was authored (hard rule).** It is **omitted** on every other angle, so that angle plainly inherits the subject's — never passed as `null`, never as a copy of `idea.mechanism`. **While the server does not yet accept the argument, the override is `reported, not persisted`**, stated in those words as the expected degraded state rather than a dropped write, and **no other field is repurposed to carry it** — not `comment`, not `angle_label`, not a narrative field, and never `idea.mechanism`. The same conditional and the same degraded rule govern a `mechanism` key in a Step 6b `edit(entity='brief')` patch. `mechanism` is an ordinary draft field, not approval-bearing: it never appears alongside `status` in a patch, and it flips no gate.
- **The bank is READ, never restated (hard rule).** `craft/mechanism-bank` is loaded live from the KB and never from memory. **`craft/mechanism-bank` is scoped to override consideration, not to every run**: read it live whenever an angle-local override is being considered, and a failed read of it authorises **no** override this run — every angle falls back to the inherited mechanism or is dropped as a misfit, and the gap is named plainly rather than left silent — never a run halted, never a remembered bank, and never an override authored without a successful live read. **No mechanism sentence, no bank `id`, no `valence` value and no `fits` phrasing is written into this skill** — the bank is revised on its own cadence, and a baked-in copy would go stale silently and then outrank the live document it was meant to reflect. This skill never proposes into the bank and holds no tool that could: harvesting is the KB pipeline's job.
- **`cta` is a DIRECTION ONLY, and the layer rule always wins (hard rule).** A brief may indicate what the close should *do*; it may **not** fix the wording. That rule — and the three-job vocabulary a direction is phrased in — is owned by `craft/close-job` (§3 and §2), read live and never restated here. **Which** job this angle's layer is assigned, its KPI justification, and the per-layer example lines are paid and owned by `ad/layer-tones` (§3 and §5), which demotes CTA wording to non-exhaustive illustration — so its phrasings are examples, never a menu to lift from. On any disagreement between a brief's `cta` and the layer's job, **the layer rule governs and the `cta` yields** (`ad/layer-tones` §6); `ssc-ads-writer` treats the layer as authoritative and corrects a mismatched `cta` downstream. A `cta` that fixes a finished sentence, or that pushes a layer toward a job that is not its own, caps at **2** in Step 5 — a hard cap.
- **`awareness_stage` and `target_layer_term_id` are angle JUDGMENTS, not lookups (hard rule).** Derive both per-angle (Step 3): the stage from the live `craft/awareness-framework` §1 ladder, the layer from the live `ad/layer-tones` §7 stage↔layer mapping (paid, and therefore **not** in the framework), each against that angle's own (persona, anchor) pair — never from a baked route→stage or stage→layer table written into this skill. The same route can serve a different stage for a different persona; both mappings are read live every run because each doc is revised on its own cadence.
- **The taken set is scoped per persona, then per anchor within her (hard rule).** No anchor repeats within one persona's briefs. The same conceptual anchor recurring under a genuinely different persona — each independently grounded in her own doc — is not a collision; a literal copy-paste across personas still is.
- **Cross-subject/plan taken-set widening is aspirational, not implemented — say so.** No shipped tool lists briefs across a whole plan (`list_briefs` takes only one `idea`). Disclose this gap in the Step 7 summary rather than fabricate a workaround.
- **Approved briefs read-only; drafts curatable (hard rule).** No edit, delete, re-write, re-score, re-label, or status change on any **approved** brief, any persona. A **draft** brief may be revised in place or discarded (no-cost only) in Step 6b — but never demoted (`status` never enters a patch) and never touched once it is approved.
- **Curate, don't churn (hard rule).** Step 6b touches a draft ONLY when it is genuinely weak, mis-homed, hero-drifted, `Tránh`-violating, mislabeled, or a near-duplicate. A healthy draft set is a no-op. Revision is bounded at 2 attempts per draft; a revised angle must land ≥4 or be discarded (no-cost) / left-and-reported. Every `edit`/`delete` is `expected_version`-guarded (re-read once on `stale_version`).
- **Discarding a draft — no-cost only, preview-then-confirm, never forced (hard rule).** You may `delete` only a draft with **0 creatives AND 0 copy** (prompts don't count); the server denies the rest. Use preview (`delete` without `confirm`) then `confirm: true`. On any refusal (produced work → needs `approve`; approved → refused), STOP and report to the operator — never un-approve or delete dependents to force it. Describe the operator's dashboard cascade honestly (irreversible; takes the angle's draft copy + creatives with it). See "Discarding a draft angle" above.
- **Angle basis = a distinct persona ANCHOR, scoped to that persona.** The anchor pool is her doc's core pain, insight, ranked trigger points, objections, and myths. Core pain and insight are first-class anchors, not fallbacks.
- **The persona's `Tránh` list is a HARD guardrail, gated at THIS layer (per the angle's own persona) and again at the writer.** Read every fitting persona's list live every run (Step 1d); never carry one persona's prohibitions onto another's angle. A `Tránh` violation caps an angle's score at **2** (Step 5) — a hard cap, not a deduction.
- **`why_now` stays consistent with the structured fields, but is no longer their sole carrier.** Unlike the pre-fan-out model, `awareness_stage` and `route_term_id` are now first-class saved fields the writer can read directly — `why_now`'s prose should still name the stage for a human reader, but never contradict what is saved on those two fields.
- **Every narrative field strictly follows the angle's own decisions (hard rule).** `hook_direction` / `core_message` / `why_now` / `story_moment` / `cta` and `angle_label` must never contradict this angle's persona (Step 1d), its diagnosed route / `awareness_stage` / `target_layer_term_id` (Step 3), or each other (Step 4). A field drafted to a different route, stage, or anchor than the one just decided gets rewritten to match — the decision is never re-opened to fit a field. `target_layer_term_id` binds here because it is derived from the same Step 3 diagnosis as the narrative fields, not because it is an independent creative input.
- **A failed KB read STOPS the run (hard rule).** `get_knowledge` reports absent paths in `missing`; check it on every load (Steps 1c/1d). Retry a missing path once, then **STOP and name the doc**. There is no fallback: this skill holds no copy of any rule it applies, so proceeding would mean running on a remembered version — two sources of truth for a doctrinal rule is the drift this repo has already been burned by, and a stopped run is recoverable where a silently-stale one is not. `brand/personas`, `craft/doctrine`, `craft/awareness-framework`, `ad/layer-tones`, `craft/close-job` and `craft/coverage` each stop the run. **`rules/compliance` and `craft/mechanism-bank` are scoped differently, not softer**: each is load-bearing only for an override, so a failed read of either authorises **no** override this run (every angle falls back to the inherited mechanism or is dropped) and is named in Step 7 — never an override waved through uncompliance-checked, and never one sourced from a remembered bank. The **single exception** is a persona **detail** doc: that persona is excluded and named as a KB gap, nothing is remembered in her place, and the rest of the roster is still evaluated.
- **`craft/awareness-framework` is the strategic filter AND the lead-mapping source, and the KB doc is its ONLY source (hard rule).** Read the awareness ladder (§1), the sophistication position (§2), the emotion cluster(s) (§3), the route lens (§4), and the §6–§7 lead taxonomy + awareness→lead mapping **from the live doc every run** — never restate, summarise, or hard-code its tables, stage numbers, lead names, or Cambridge's position. §6–§7 is read here only to confirm the diagnosed stage admits more than one lead; the lead itself is chosen downstream. **The tier/layer mapping is NOT in that doc** — it is paid and belongs to `ad/layer-tones` §7, read live from there under the same never-hard-code rule. If either doc is unavailable, the run **stops** (see above) — it never proceeds with guessed stage/route/layer fields.
- **Never pad — on the anchor axis, the persona axis, and the route axis, all three (hard rule).** A forced persona-fit is exactly as much a defect as a re-used anchor or an off-stage route argued harder. If genuinely nothing remains on any axis, **write NOTHING** and say so plainly. An empty run is an ordinary, successful outcome.
- **Mandatory distinct, persona-legible `angle_label`.** Every angle carries a short Vietnamese label naming both its persona and its anchor; no two labels are the same — within the batch or against the taken set.
- **Quality gate is hard.** Every persisted angle is rated ≥4 on distinctiveness / persona-fit-and-grounding / strategic sharpness / awareness fit / decision fidelity / authenticity / close-job compliance / mechanism fidelity / lead-openness, with a one-line Vietnamese `comment`. The last three carry **hard caps at 2**, alongside `Tránh`. Under mechanism fidelity the cap falls on a **competing** mechanism — one the angle argues with no declared override — and on an override that is missing a bound, unreported, authored where the inherited mechanism does serve the angle, or reaching beyond its one angle; a **declared, bounded, reported** override is **not** penalised and is scored on its merits like any other angle. Any ≤3 is dropped + regenerated (bounded at 2 attempts) or the batch is honestly reduced.
- **Never touch `theme`.** Removed from the schema entirely.
- **One subject at a time.** A date with several approved subjects is handled one subject per run.
- **Never fabricate.** `story_moment` only when genuinely story/person-led (Kiều My scenes ONLY from `programme/kieu-my-story`); otherwise the explicit "not applicable" line.
- **All persisted prose in Vietnamese** — the five narrative fields, `angle_label`, and `comment`. Chat-side reasoning may stay English.
- **N briefs per subject, across M personas, is the live shape, and the set GROWS.** The multi-persona, multi-angle spread is the real payoff of this skill; distinctiveness (now on two axes) and honest scoring are load-bearing.
- **The briefs are the downstream anchor, including their declared media home.** An approved `brief_id` is what `ssc-ads-writer` writes copy against and what the ImageStudio prompt chain keys on; its `target_layer_term_id` is what a human later realizes as an actual ad-set placement — this skill performs no media operation and creates no ad.
- Operates only on the ad channel (`channel='ad'`); never reads or writes `post`/`youtube` state.
- Requires the `edit` capability (plus `view` for the `get_idea` / `get_channel_plan` / `get_knowledge` / `list_taxonomies` / `list_briefs` reads).
