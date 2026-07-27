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

### The diversity boundary — who owns which half

Diversity has two halves and they live in different places. Getting this wrong
means either nobody checks or both do:

| | Owner | Scope |
|---|---|---|
| **Route / angle COVERAGE** | the **caller** | across the whole batch of ideas |
| **Field-level repetition** | **you** | within the sets you return for THIS idea |

**Coverage is structurally not yours.** Whether a month's thirty posts spread
across the persuasion routes is a property of the batch, and you only ever see one
idea. The caller keeps the running tally and passes each route in already decided.

What you DO owe on the angle you were handed is a **fit check**: the route must
suit this idea's own frame and journey stage. A `stage-0` idea whose reader does
not yet admit the problem cannot carry a `comparison` route; a founder-story idea
is `proof` far more naturally than `problem`. **If the route does not fit, say so
and return it as below bar** — do not quietly write fields for an angle that
cannot work. That is the one angle judgement you make, and it is about fit, never
about spread.

## Inputs (from the caller)

- `idea` — the idea row: at minimum `id`, `title`, `channel`, `version`, and its
  taxonomy `tags` (pillar / persona / value / entry / frame / journey_stage).
- `angle_count` — how many field sets to return. **1 for post.**
- `angles[]` — one spec per requested set: `{ persona, route, anchor }`, where
  `anchor` is the concrete thing this angle attacks (a belief, a trigger, an
  objection, a myth) named by the caller.
- `grounding` — the caller's already-loaded context: the month's guidance (a
  channel Approaches doc or equivalent), plus which KB docs it read. **This is an
  optimisation, not a substitute:** Step 1's list is read live regardless of what
  the caller says it already has, because a caller that read a doc for a different
  purpose may not have held the part you need. `grounding` only lets you skip
  re-reading the month's guidance itself.
- `taken` — the briefs that already exist for this idea. Empty by construction on a
  single-angle channel; see **Step 3**. Cross-idea repetition is NOT passed here and
  is not yours — see the diversity boundary.

## Procedure

### Step 1: Load only what the caller did not

The caller has already read the month's guidance and the personas. You need, and
should read live rather than assume:

- `brand/angles` — the value / entry / against / experience dimensions and the
  frame codes. This is the vocabulary the fields are expressed in.
- `brand/proof-points` — what the brand may actually claim, for `core_message`
  and any proof phrasing.
- `rules/banned-words` — checked against every Vietnamese string you return.
- **The ENTIRE `voice` category** — load it with `get_knowledge(categories: ["voice"])`,
  never as an enumerated path list. All of it applies: tone, the pronoun rules, the
  vocabulary, the Vietnamese-language rules and the founder voice. A hardcoded subset
  is how this skill shipped 7 titles addressing the reader as "chị" when
  `voice/pronouns` says public posts use "bạn" - the doc was simply never loaded.
- The angle's persona detail doc (`brand/persona-<slug>`) when the caller has not
  already supplied its trigger list. Resolve `<slug>` mechanically from the `code`
  **as `brand/personas` lists it**, with the `chi-` prefix stripped — you hold no
  `list_taxonomies` and do not need one, since the roster doc carries the codes.
  Never hardcode a path list, so a persona added or retired needs no change here.

`search_knowledge` only when an anchor names something these do not cover and you
need the brand's own position before writing a field about it.

### Step 2: Resolve the HERO — once per idea, before any field

The hero is the idea's **core concept, stated at full strength in about five
Vietnamese words.** It is per **idea**, not per angle — several angles on one idea
share one hero.

**`ssc-ads-brief` Step 1a is the single definition; apply it unchanged.** Its three
tests, restated only so you can fail a hero without leaving this file:

- It is the **core concept** — not a detail, not a scene, not the situation the
  idea sits in.
- It is a **STRONGER version of the title, never an explanation of it.** It should
  read as something that could REPLACE the title and hit harder. The moment it
  describes what the title refers to, or supplies the reasoning behind it, it has
  become a `core_message` and is wrong.
- It is **short — around five words.** A sentence long enough to argue is long
  enough to explain.

Worked shape: title *"Vì sao ăn ít lại mà vòng 2 vẫn tăng sau tuổi 45"* → hero
**"Ăn ít không còn đủ."** A purpose statement like *"the reader recognises that her
stalled progress has a mechanism, not a discipline problem"* is NOT a hero — it is
the `core_message`, and a hero written that way fails all three tests at once.

- If `idea.hero` is already set, **read it and keep it.** Do not silently replace
  an operator's hero. If it plainly contradicts the angle spec, say so and let
  the caller decide.
- If it is empty, derive it from the idea's title and return it for the caller to
  write via `update_idea(hero=…)`.
- **On `stale_version` at that write, the caller must re-read and RE-DERIVE.** The
  hero derives from the title, so a moved version most likely means an operator
  just edited that title.

### Step 3: The taken set — read before proposing, not after

Call `list_briefs` for the idea and hold every existing brief **whatever its
status**, draft and approved alike. Compare on the **five narrative fields**, not
on labels: two briefs with different persona labels that open on the same line
and carry the same argument are the same brief.

**On a single-angle channel this set is empty by construction, and that is not a
pass.** A post idea has exactly one brief and it is the very row about to be
written — its five fields are all null, so comparing against it always succeeds and
tells you nothing. Do not report "taken set clear" as evidence of anything on a
post. The only repetition a post can have is **against its sibling ideas**, which
you never see; that check belongs to the caller and is listed in the diversity
boundary above.

So: this step does real work for **ads** (an idea accumulating angles across runs)
and is inert for **posts**. Say which case you were in when you report.

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

Audit **only what you produced for this idea, plus a non-empty taken set** — the
scope in the diversity boundary above. With `angle_count: 1` the first three checks
have nothing to compare and are reported as not applicable, not as passed.

- No two sets share the same opening strategy. *(≥2 sets only)*
- No two sets share the same `story_moment` shape. *(≥2 sets only)*
- `why_now` reasons are distinct, not one seasonal fact restated. *(≥2 sets only)*
- Every set's fields are mutually consistent — hook, message and cta argue the
  same thing. *(always)*
- The route FITS this idea's frame and journey stage. *(always — see the fit check
  in the diversity boundary; a misfit returns below bar)*

**Never report a batch-level verdict.** You cannot see the batch. Cross-idea
repetition and route coverage are the caller's audit, and claiming them here would
be a pass nobody actually ran.

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
