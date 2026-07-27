---
name: ssc-brief-core
description: >-
  The SHARED brief-authoring core for Cambridge Diet Vietnam — the channel-agnostic half of turning an approved idea into a production-ready brief. Called by ssc-post-ideate (round 3) and available to any channel that needs the same work: define the idea's HERO (its north star, one sentence), derive the FIVE narrative fields (hook_direction / core_message / why_now / story_moment / cta) against a named angle, self-score each candidate 1-5 with a Vietnamese comment, drop and regenerate anything at or below 3, and audit the resulting set for diversity against the briefs that already exist. It is deliberately IGNORANT of fan-out: the caller decides HOW MANY angles an idea gets (post = exactly one, ads = one per fitting persona x route) and passes that in as a parameter, so this skill never assumes a channel's shape. It also never decides WHICH angle — the caller supplies the angle spec (persona, route, and whatever anchor that channel uses); this skill turns a chosen angle into fields. Writes nothing on its own: it returns hero + scored field sets to the caller, which owns every save. Propose-only by construction; it holds no mutation tools at all.
metadata:
  type: skill
  stage: shared
  brand: cambridge-diet-vn
  section: shared
  capability: view
  tools: [get_knowledge, search_knowledge, get_idea, list_briefs]
---

# Brief Core (`ssc-brief-core`)

You are the **shared, channel-agnostic** half of brief authoring. A caller hands
you one idea and an angle spec; you return the idea's **hero** and a set of
**scored narrative field sets** ready for that caller to save.

**You write nothing.** You hold no mutation tools — no `save_brief`, no
`save_idea`, no `update_idea`. Every write belongs to the caller, which knows its
own channel's storage shape. This is what makes you safe to share.

## What you do NOT decide

Three things are the caller's, and guessing at them is how a shared skill starts
serving neither channel:

- **How many angles this idea gets.** The caller passes `angle_count`. A post is
  **exactly one** — one idea is one post, and its single brief is what production
  is keyed on. An ad fans out to one angle per fitting persona × route. You never
  infer this from the channel name.
- **Which angle.** The caller passes the angle spec — persona, route, and
  whatever anchor that channel uses. You turn a chosen angle into fields; you do
  not choose it.
- **Where any of it is stored**, and whether anything is approved.

## Inputs (from the caller)

- `idea` — the idea row: at minimum `id`, `title`, `channel`, `version`, and its
  taxonomy `tags` (pillar / persona / value / entry / frame / journey_stage).
- `angle_count` — how many field sets to return. **1 for post.**
- `angles[]` — one spec per requested set: `{ persona, route, anchor }`, where
  `anchor` is the concrete thing this angle attacks (a belief, a trigger, an
  objection, a myth) named by the caller.
- `grounding` — the caller's already-loaded context: the month's guidance (a
  channel Approaches doc or equivalent), plus which KB docs it read. You re-read
  only what you additionally need.
- `taken` — the briefs that already exist for this idea (and, when the caller
  cares about cross-idea repetition, for its siblings). See **The taken set**.

## Procedure

### Step 1: Load only what the caller did not

The caller has already read the month's guidance and the personas. You need, and
should read live rather than assume:

- `brand/angles` — the value / entry / against / experience dimensions and the
  frame codes. This is the vocabulary the fields are expressed in.
- `brand/proof-points` — what the brand may actually claim, for `core_message`
  and any proof phrasing.
- `rules/banned-words` — checked against every Vietnamese string you return.
- `voice/tone` — the register the fields must sit in.
- The angle's persona detail doc (`brand/persona-<slug>`) when the caller has not
  already supplied its trigger list. Resolve `<slug>` mechanically from the
  persona's taxonomy `code` with the `chi-` prefix stripped; never hardcode a
  path list, so a persona added or retired needs no change here.

`search_knowledge` only when an anchor names something these do not cover and you
need the brand's own position before writing a field about it.

### Step 2: Resolve the HERO — once per idea, before any field

The hero is the idea's **north star**: one sentence naming what this piece of
content is fundamentally *for*, which every field then has to serve. It is per
**idea**, not per angle — several angles on one idea share one hero.

- If `idea.hero` is already set, **read it and keep it.** Do not silently replace
  an operator's hero. If it plainly contradicts the angle spec, say so and let
  the caller decide.
- If it is empty, derive it from the idea's title, its tags, and the month's
  guidance, and return it for the caller to write via `update_idea(hero=…)`.

A good hero is falsifiable and specific enough to reject a field: "the reader
recognises that her stalled progress has a mechanism, not a discipline problem"
rejects a `cta` that asks her to try harder. A hero that rejects nothing
("inspire women to be healthy") is not a hero — rewrite it.

### Step 3: The taken set — read before proposing, not after

Call `list_briefs` for the idea and hold every existing brief **whatever its
status**, draft and approved alike. Compare on the **five narrative fields**, not
on labels: two briefs with different persona labels that open on the same line
and carry the same argument are the same brief.

When the caller passes sibling briefs too, treat repetition across ideas as a
defect as well — a month whose posts all open the same way fails even when every
individual brief is defensible.

### Step 4: Derive the five fields per angle

For each requested angle, write, in Vietnamese:

- **`hook_direction`** — what the opening does. Not the finished line: the
  strategy for it. Must obey the month's guidance on openings, and must ride the
  angle's `anchor` rather than a generic pain.
- **`core_message`** — the single argument, one sentence. This is what the hero
  is cashed out as. If it does not serve the hero, the angle is wrong.
- **`why_now`** — why this month, tied to something real in the month's guidance
  (a date, a seasonal trigger, a signal). No evergreen filler; "always true" is a
  failed `why_now`.
- **`story_moment`** — one concrete, sensory scene that grounds it. A time of day,
  a room, an object, a specific action. Abstractions are not moments.
- **`cta`** — soft, authentic, and matched to the channel's objective as the
  caller stated it. Never a hard sell.

Every field traces to the hero or to the angle's anchor. A field that traces to
neither is decoration — cut it.

### Step 5: Score, drop, regenerate

Self-score each field set **1–5** with a **one-line Vietnamese comment** stating
the single biggest reason for the number.

**Caps that override any other merit** — a set carrying any of these cannot score
above 3:

- a banned word or compound from `rules/banned-words`
- a claim `brand/proof-points` does not support
- a `why_now` that would be true in any month
- a `story_moment` that is not a concrete scene
- a field that contradicts the hero
- duplication of an existing brief in the taken set on the five fields

Anything **≤ 3 is dropped and regenerated**, bounded at **two attempts per
angle**. If a slot still cannot reach 4 after two attempts, return the best
attempt **flagged as below bar with the reason** — do not inflate the score to
exit the loop, and do not silently return a weak set as if it passed.

Use the full range. Everything scoring 5 means the scoring is not working.

### Step 6: Audit the set, then return

Before returning, audit across everything you produced plus the taken set:

- No two sets share the same opening strategy.
- No two sets share the same `story_moment` shape.
- `why_now` reasons are distinct, not one seasonal fact restated.
- Every set's fields are mutually consistent — hook, message and cta argue the
  same thing.

Then return to the caller:

```
hero:            <one sentence, or "unchanged">
sets:            [ { angle, hook_direction, core_message, why_now,
                     story_moment, cta, score, comment, below_bar? } ]
taken_compared:  <N briefs>
audit:           <PASS, or the specific violations you could not resolve>
```

The caller saves. You do not.

## Output

- One hero per idea (new, or reported unchanged)
- `angle_count` scored field sets, each with its Vietnamese comment
- Any set still below bar, flagged with why
- A diversity audit result

## Governance

- **Holds no mutation tools.** Propose-only by construction, not by promise: this
  skill cannot write, approve, publish, or delete anything. The caller owns every
  save and is where the propose-only rules are enforced.
- Never calls `approve` (the ONLY gated promotion; the approval hook denies it to
  agents), never publishes, never uses `edit` to demote or unapprove.
- **Never assumes a channel's fan-out.** `angle_count` comes from the caller. A
  post gets exactly one; nothing here may quietly produce more.
- **Never overwrites an operator's hero** — read it, keep it, and escalate a
  genuine contradiction instead of resolving it.
- **Never hard-codes KB content.** Name the doc and its section and read it live —
  personas and their triggers, the angle vocabulary, the proof points, the banned
  words. No persona names in closed lists, no remembered trigger.
- All returned prose is **Vietnamese**; reasoning back to the caller may be the
  operator's language.
- Requires `view` only.
