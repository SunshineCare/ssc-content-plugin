---
name: ssc-youtube-ideate
description: >-
  Generates the month's YouTube video ideas — reads the approved youtube channel_plan and the channel knowledge base, then saves draft ideas via save_idea, self-checking diversity, hook variety and the compliance rails (read live). Step 2 of the YouTube pipeline, gated on the approved briefing. Propose-only: every idea is a draft a human curates and approves.
metadata:
  type: skill
  stage: youtube-pipeline
  brand: cambridge-diet-vn
  section: youtube
  capability: edit
  tools: [get_knowledge, get_channel_plan, list_taxonomies, save_idea]
---

# Monthly YouTube Ideation (`ssc-youtube-ideate`)

You generate draft YouTube video ideas for a Cambridge Diet Vietnam monthly YouTube cycle. You read the approved youtube `channel_plan` (the briefing's cadence detail + buyer-stage/series distribution), load the creative and channel knowledge base **together with the compliance rails** (`rules/compliance`, `brand/proof-points`, `rules/food-placeholder`, `rules/person-rule` — read live, never restated here), generate one idea per planned video via `save_idea` with `channel='youtube'`, and self-enforce diversity **and those rails** before finalising. A refused proof device is **refused citing the rule that forbids it**; a claim that traces to no live proof family and no real paperwork is **refused**. You are propose-only: every idea is created as a DRAFT for a human to curate and approve in the content workspace (`/content/youtube`).

This is step 2 of the YouTube pipeline (**Briefing → Ideate → Schedule**), keyed on `channel_plans(channel='youtube', period=YYYY-MM)` and hanging off that period's monthly-plan head, which released the channel with its Narrative approval.

## Inputs

- `period` — the plan month, e.g. `2026-07` (YYYY-MM)

## Procedure

### Step 1: Read the plan and gate-check the briefing

Call:

```
Call: get_channel_plan
  channel: youtube
  period: <period>
```

**Gate-check:** From the returned `{ plan }`, if `plan` is null **or** `plan.approved` is not `true`, STOP immediately and tell the operator:

> The YouTube briefing has not been approved yet. Please review and approve the briefing in the content workspace (`/content/youtube`) before running Ideate.

Do not proceed past this gate under any circumstances — do not load the KB or save any idea until the plan is approved.

If `plan.approved` is `true`, extract and hold from the aggregate:

- `plan.id` — the plan id, passed to `save_idea` as `plan_id`
- `plan.targets` — the briefing distribution as a SET of rows, each `{ term_id, term_kind, term_code, term_label, target_value, meta }`. The `term_kind = 'buyer_stage'` rows give the **video count per buyer stage**; the `term_kind = 'youtube_series'` rows give the **video count per series** (their `meta` may carry theme/persona mappings). Hold each row's `term_id` — you re-tag ideas with these exact ids.
- `plan.detail.long_form_per_week` / `plan.detail.shorts_per_week` — the approved cadence
- `plan.tactics` — the approved month tactics (markdown), for tonal/strategic weight
- `plan.context` — the approved month brief (markdown): themes, key dates, seasonal pain points

**Gate-check:** If `plan.targets` has no `youtube_series` rows, STOP and tell the operator the briefing has not produced a series distribution yet (run `ssc-youtube-briefing` first).

### Step 2: Load the creative knowledge base and the compliance rails

Call `get_knowledge` for these verified paths, plus the whole `voice` category:

- `channels/youtube` — the YouTube channel strategy: content series descriptions, cadence rules, SEO priorities, tone, Shorts approach, and the YouTube → Facebook repurposing workflow
- **the ENTIRE `voice` category** — load it as `get_knowledge(categories: ["voice"])`, never as named paths. All of it binds: tone, the pronoun rules (`bạn` + `mình/chúng mình` for public content, with `các chị` permitted in the plural on YouTube), the vocabulary, the Vietnamese-language rules, and the founder voice. Loading by category keeps the set correct as docs are added or retired; an enumerated subset silently omitted `voice/founder-voice` here.
- `brand/personas` — the core audience archetypes and their value priorities (the archetype names and definitions live in this document — do not assume them)
- `brand/persona-<slug>` (one call per persona currently listed in `brand/personas`) — each persona's detail doc: ranked trigger points with content guidance, objections + how to dismantle them, real vocabulary to echo/avoid, and myths to debunk. Resolve `<slug>` mechanically from that persona's taxonomy `code` with the `chi-` prefix stripped (e.g. `chi-huong` → `brand/persona-huong`) — never hardcode the path list, so a persona added later needs no procedural change here. This is a **batch** run spanning ideas across every persona and series in one pass, so load every currently-listed persona's detail doc upfront — not just one — to ground each video's pain points and aspirations in that persona's actual trigger points and vocabulary rather than the summary-only view in `brand/personas`.
- `brand/journey-stages` — the emotional journey stages and their content implications
- `rules/banned-words` — hard-banned words and phrases (zero tolerance). It is a **word-substitution table**: it says which words may not be written. It says nothing about proof devices, claims or sentence structure, which is why the four rails below exist alongside it.

**The compliance rails — mandatory on this channel, read LIVE every run, none of them restated anywhere in this file:**

- `rules/compliance` — **the compliance rail every idea is bound by.** It owns the **refusal table** (the section titled *Bảng từ chối*): what may never be written or shown, each row carrying **its own căn cứ** — Vietnamese law, Meta policy, or a stated brand-voice choice — and that doc says plainly the three kinds of basis are **not equal**. It also owns the **evidence-trace rule** (*Quy tắc gắn chứng cứ*) that check 12 enforces, the pre-publication checklist, and the platform rules for this category. **Not one refused device and not one legal basis is written into this file.** Read the table live and, when you refuse something, quote **that row's** basis — a refusal stated without its basis reads as arbitrary and gets quietly ignored.
- `brand/proof-points` — the live credibility table **and the owner of the adopted PROOF FAMILIES** every claim must trace to, each family stating **what it may and may not say** (a research family in particular has a hard limit on how far a result may be pressed). **The families, their limits and their figures are not listed here — read them live.** The numbers in that doc have been corrected more than once, so a figure recalled from memory or from this file is how a superseded one ships.
- `rules/food-placeholder` — the food, drink and product rules that bind any idea whose hook or `storyMoment` shows a meal, a shake or a drink: the permitted vessel↔setting pairings, the one-product rule, the forbidden props, and the **live Cambridge product catalogue**. Never name a product, flavour or vessel that is not in the live doc; when unsure which flavour belongs to a form, say the **form**, not a guessed name.
- `rules/person-rule` — the **grammatical** person rule (its three-question test is at §2) and, at §4, the **four permitted opening frames** every hook must sit in. It checks how a sentence is *built* — who the subject is and what the predicate asserts — not which words it uses, so `rules/banned-words` **structurally cannot** catch a violation of it. A hook with no banned word in it can still fail here.

All four are **mandatory**, not conditional on what the ideas turn out to be — you cannot know an idea needs a rail until you have read it. `get_knowledge` caps `paths` at 20, so if the resolved persona set pushes the list past the cap, split it into a **second, equally mandatory call** rather than dropping a rail, and check `missing` on **both**.

**Why this channel gets these four and not a word scan.** A banned-word scan plus a note about "no pushy sales language" is **not** a compliance surface and is no longer accepted as one here. This is a regulated food category: the sanction that actually ends the business is **suspension of the product's công bố** — not a rejected video — and under the amended Advertising Law in force from 01/01/2026 the person who presents the product is **personally liable** for what the content claims. YouTube is not exempt from any of this because it is organic. The rules, the sanctions and the legal references all live in the documents above; they are read live precisely so that nothing here can go stale against them.

> **A FAILED KB READ STOPS THE RUN — it never falls back to a remembered version (hard rule).** `get_knowledge` reports an absent path in `missing` rather than failing, so **check `missing` on every call**. If **any** requested path comes back missing, **STOP**, say plainly **which document** could not be read, and say the run stopped for it. Do **not** proceed from memory, do **not** substitute a similar document, do **not** work from a cached or previously-loaded copy, and above all do **not** reconstruct the refusal table, the proof families, the opening frames, the food rules or the banned list from anything written in this file — none of them is written here, deliberately. Two sources of truth for a compliance rule is the drift this repo has already been burned by; a stopped run is cheap, and a published video written against a remembered rule is not. **The one documented exception is `brand/persona-<slug>`**, whose filename is derived rather than fixed: **retry once** via that persona's detail-doc pointer in `brand/personas`, and **if it still does not resolve, STOP** and name the path — the fix is a KB gap-fill, not weaker ideas.

Read every document listed above carefully before generating any ideas (`brand/personas` plus every currently-listed `brand/persona-<slug>` detail doc together form the full persona-grounding set — load the summary AND every detail doc, not the summary alone).

### Step 3: Generate ideas

Generate exactly the number of ideas required by the briefing distribution: the sum of the `youtube_series` target counts (long-form + Shorts). Produce ideas grouped by series (matching each series row's `target_value`) to make series-count tracking easier.

**Resolve every strategic-dimension code → taxonomy id (do this once, before any `save_idea` write).** Call `list_taxonomies` once per needed `kind` — `youtube_series`, `buyer_stage`, `persona`, `journey_stage`, `value`, `format` (the dimensions that apply to the youtube channel) — **or** one unfiltered `list_taxonomies` call, and build a `code → id` map per kind. `save_idea`'s `terms` must carry the matching `taxonomies.id`, never a code, and never an invented id. (For `youtube_series` and `buyer_stage` you can reuse the `term_id`s already present on `plan.targets`.)

**Persona taxonomy can lag `brand/personas` (do not invent an id for the gap):** `brand/personas` is the live KB index of personas; the `persona` taxonomy (the `kind='persona'` map built above) is a SEPARATE list maintained independently, and it can lag behind the KB doc — a persona can be documented in `brand/personas` before her taxonomy term is added. After building the code → id maps, check every persona currently listed in `brand/personas` against the resolved `kind='persona'` map. If a listed persona has NO corresponding entry there, do NOT invent an id for her and do NOT tag any idea's `persona` term to her this run — carry her forward as untaggable, and report her by name in the Step 5 summary so the operator knows to add her taxonomy term rather than assuming full persona coverage was achieved.

For each idea, call `save_idea` with the following field mapping. Narrative fields go in `detail` (the `youtube_idea_details` columns); structural dimensions go in `terms` (resolved taxonomy leaf ids). There is NO `format_decision` blob and NO top-level `pillar`/`target_persona`/`hook_direction` args — any key outside this schema is rejected or lost.

```
save_idea(
  channel   = 'youtube',
  plan_id   = <plan.id>,
  source    = 'ai',
  status    = 'draft',
  score     = <your self-rating, 1–5 — see Field guidance>,
  comment   = <one-line rationale for the score, in Vietnamese — see Field guidance>,
  title     = <Vietnamese video title — specific, natural, search-intent aware>,
  terms     = [
    <youtube_series term id — the series this video belongs to>,
    <buyer_stage term id — awareness | consideration | decision>,
    <persona term id — the archetype from brand/personas this video speaks to>,
    <journey_stage term id — the journey stage from brand/journey-stages>,
    <value term id — the primary brand value angle>,
    <format term id — video (long-form) or reel (Shorts)>
  ],
  detail    = {
    hookDirection: <opening hook: the first 15 seconds — question, confession, or bold claim that earns the viewer's watch — Vietnamese>,
    coreMessage:   <the strategic direction — one clear Vietnamese sentence: what the viewer learns or feels>,
    whyNow:        <why this topic is timely for this month's context — Vietnamese>,
    storyMoment:   <the concrete scene or opening moment that anchors the video — specific, sensory — Vietnamese>,
    cta:           <call-to-action direction — soft, authentic: what we invite viewers to do next (comment / subscribe / consult) — Vietnamese>,
    theme:         <the month theme this video belongs to, from plan.context / the series row's meta — Vietnamese>,
    videoLength:   <'short' | 'medium' | 'long' | 'documentary'>,
    repurposable:  <true | false — whether this video yields a 60–90s Facebook clip or Reel>,
    seoIntent:     <'informational' | 'navigational' | 'transactional'>
  }
)
```

**Experimental track:** `save_idea` supports `track` (`proven` | `experimental`, defaults to `proven`) and `confidence` (`high`/`medium`/`low`, required when experimental). When an idea activates an experimental strategy finding, pass `track='experimental'` with its `confidence`; otherwise omit both and the default `proven` applies.

**Language rule (hard): every persisted prose field MUST be Vietnamese** — `title`, `comment`, and the `detail` fields `hookDirection`, `coreMessage`, `whyNow`, `storyMoment`, `cta`, `theme`. These are persisted artifacts the Vietnamese operator curates in the content workspace. Never save English prose in them; your chat-side reasoning stays English. The enum-valued fields (`videoLength`, `seoIntent`) and the taxonomy ids stay as their literal codes.

**Field guidance:**

> **The compliance rails bind every idea you write here, not only the finished video.** An idea is the brief a video is shot from, so a refused device accepted at this step reaches production already approved. Apply `rules/compliance`, `brand/proof-points`, `rules/person-rule` and `rules/food-placeholder` **as you read them this run** — Step 4's checks 11–14 are the audit, not the first application. **If any of those documents could not be read, the run has already STOPPED in Step 2**, precisely so none of them can be reconstructed from memory here.

- `score` — **self-rate every idea on a 1–5 scale** (rendered as stars for the operator to curate by strength). Judge how strongly the idea serves the month's approved tactics and its series/stage slot, the freshness of its hook, and brand-voice fit. Rate honestly and use the full range — do not give everything 5.
- `comment` — a **one-line rationale for the `score`, written in natural Vietnamese** (never English): the single biggest reason the idea is strong or weak — e.g. "Hook mở đầu mạnh, khớp giai đoạn Do dự của <persona>" or "Góc hơi chung, thiếu khoảnh khắc cụ thể".
- `title` — natural Vietnamese, search-intent aware. Use keywords from the SEO priority list in `channels/youtube` where relevant. Follow the title-length guidance in `channels/youtube` for long-form vs Shorts.
- `detail.hookDirection` — the YouTube hook must earn the first 15 seconds: a specific question, a surprising claim, or a confession line. Must vary across the batch — avoid repeating the same hook type on consecutive ideas. **Every hook sits in one of the four permitted opening frames at `rules/person-rule` §4 and passes that doc's test at §2** — read both live; the frames are not listed here. A question mark, a hypothetical (*"Nếu bạn đang…"*) and a compliment do not rescue a sentence that asserts something about the viewer's body, health or past failure. A surprising claim is only usable if it traces (see below).
- `terms` youtube_series — the exact series term from the `youtube_series` taxonomy matching a `plan.targets` series row. Do not invent series.
- `terms` buyer_stage — derive from the briefing's `buyer_stage` distribution and the series' stage affinity.
- `terms` persona — pick the archetype from `brand/personas` whose primary values align with this video's buyer stage and core message; tag its `persona` taxonomy term. The valid archetypes are whatever `brand/personas` currently defines — do not assume a fixed list.
- `detail.coreMessage` — the strategic direction (not a headline). One sentence stating what the viewer takes away — a belief, a reframe, or a transformation signal. **Whatever it claims must trace.** Name, in the idea's `comment`, the live `brand/proof-points` proof family (or the real product paperwork) the claim rests on, and press it only as far as that family's own stated limit allows. An idea whose core message traces to neither is **untraceable and is refused** (check 12) — rewrite it onto something that traces, or drop the claim; never invent a figure, and never recall one from this file, which carries none.
- `detail.cta` — soft, authentic call-to-action for YouTube viewers: subscribe with a reason, comment on a specific prompt, or visit Facebook/Messenger for personal consultation. **What a close may not do is the live refusal table's call, not a matter of taste** — read `rules/compliance` this run and apply the rows that govern closes (each with its own basis). *"No pushy sales language"* is a style note; it is **not** the rule and must never be used in place of one, in either direction: a close can read perfectly gentle and still be refused, and softening a refused close does not make it permitted. Do not reason about it from this bullet — read the rows.
- `detail.whyNow` — the month-specific context that makes this topic timely. No video should be purely evergreen.
- `detail.storyMoment` — the concrete opening scene: setting, character, emotion, in Vietnamese. E.g. "Chị Kiều My ngồi bên bàn bếp lúc 6 giờ sáng, tay cầm tấm ảnh chụp 20 năm trước." It is a **shot direction**, so two rails bind it: the scene must not depict anything the live refusal table in `rules/compliance` refuses to show, and any meal, shake or drink in it follows `rules/food-placeholder` as read this run — its vessel↔setting pairing, its one-product rule, and its live product catalogue. A real named person appears only as that doc and `brand/proof-points` permit; never invent a story, quote or lived experience for one.
- `detail.videoLength` — one of `short`, `medium`, `long`, `documentary`. Derive from the series' format/length metadata in `channels/youtube` (and the `youtube_series` taxonomy) — documentary series run documentary-length; Shorts are `short`.
- `detail.repurposable` — `true` when the video naturally yields a 60–90s clip or moment for Facebook Reels (per the YouTube → Facebook workflow in `channels/youtube`). Most long-form videos should yield at least one repurposable clip.
- `detail.seoIntent` — awareness-stage videos are typically `informational`; decision-stage videos can be `navigational` (brand search) or `transactional`.

### Step 4: Self-check diversity and compliance

Before finalising, audit the full set of ideas against these constraints. The definitive rules live in the documents loaded in Step 2 — `rules/compliance`, `brand/proof-points`, `rules/person-rule`, `rules/food-placeholder`, `rules/banned-words` and `channels/youtube`. **If any of them conflicts with the guidance below, the document wins**, and it wins as it reads **this run**, not as it is summarised here. **If any of them could not be read, the run has already STOPPED in Step 2** — no check below may be run from a remembered version of its document.

**Checks 1–10 are craft; checks 11–14 are compliance and are not negotiable against craft.** A compliance failure is a **refusal**: the idea is rewritten or dropped, never saved with a caveat in `comment` and never rated down and kept. Craft checks 1–7, 9 and 10 may be satisfied by adjusting the batch; checks 8 and 11–14 may not be traded off against how strong an idea is.

**Mandatory checks (all must PASS):**

1. **Series count accuracy**: Count ideas per `youtube_series` term. Every series' count must match its `plan.targets` row's `target_value` exactly. Any deviation = fix before finalising.

2. **Stage mix accuracy**: Count ideas per `buyer_stage` term. Totals must match the briefing's `buyer_stage` target rows. Any deviation = fix before finalising.

3. **Archetype specificity**: Spot-check 3 ideas. Each must name month-specific pain points or aspirations for its tagged persona (per `brand/personas`), drawn from that persona's detail-doc trigger-point section (Step 2) rather than invented generically — not generic descriptions. Generic = rewrite.

4. **Journey stage alignment**: Spot-check 3 ideas. The tagged `journey_stage` must match the content direction — a video at "Nhận ra" must not already propose a solution; a video at "Tiến triển" must not dwell on initial pain. Misaligned = rewrite.

5. **Month-specificity**: Count evergreen ideas (those without a month-specific hook or context in `detail.whyNow`). If >25% of ideas are purely evergreen, add month-specific context or replace the worst offenders.

6. **Hook-opener variety**: Across all `hookDirection`s, no more than 30% may begin with the same opener type (question / confession / bold claim). At least one hook from each type must appear across the batch. Rewrite violating hooks to add variety.

7. **Repurposability coverage**: At least 60% of long-form ideas should have `repurposable: true`. If below threshold, revisit ideas that lack obvious Facebook clip moments.

8. **No banned words**: Scan every `title`, `hookDirection`, `coreMessage`, and `cta` for any word or phrase listed in `rules/banned-words`. Any match = rewrite that field. Zero tolerance.

9. **Pronoun consistency**: Every idea must follow `channels/youtube`'s xưng hô convention — `Bạn` for viewer address and `Mình`/`Chúng mình` for brand self-reference in `hookDirection` and `cta`. Violations = rewrite.

10. **No duplicate series+message within the month**: No two ideas may share the same series AND the same core-message direction. If a series has duplicate core messages, vary the angle, persona, or journey stage on the excess ideas.

11. **No refused proof device** (`rules/compliance`, live): Read the refusal table this run and scan every idea's `title`, `hookDirection`, `coreMessage`, `storyMoment` and `cta` — and the shot the `storyMoment` implies, since a refusal can be visual as well as verbal — against **every** row of it. **A refused device is REFUSED, citing the rule that forbids it** — rewrite the idea onto a device the table permits, or drop the idea. When you refuse one, state **which row** it hit and **quote that row's own căn cứ** (law / Meta policy / brand-voice choice, as that doc records it), because a refusal without its basis reads as arbitrary and gets quietly overridden — especially by a writer who has just seen a competitor do the same thing unpunished. **The rows are not reproduced here and never may be:** a second copy is how a superseded refusal survives. Zero tolerance, and never weighed against how strong the video would be.

12. **Every claim traces** (`brand/proof-points` + `rules/compliance`, live): For every claim any idea makes — in `title`, `hookDirection`, `coreMessage` or `cta` — name the **live proof family** it belongs to or the **real product paperwork** it rests on, and record that source in the idea's `comment`. Press it no further than that family's own stated limit. **A claim that traces to neither is UNTRACEABLE and is refused** — rewrite it onto a claim that traces, or cut the claim. Never fabricate a figure, and never write one from memory or from this file: this file states no proof point, no figure and no family, and the live doc's numbers have been corrected more than once.

13. **Person rule** (`rules/person-rule`, live): Every `hookDirection` — and every second-person sentence in `coreMessage`, `storyMoment` and `cta` — passes that doc's test and sits in one of its four permitted opening frames. Name the frame each hook used in your working notes (there is no field for it on a youtube idea; it is not persisted). A violation is a **rewrite**, not a low score. **Check 8 structurally cannot catch this** — the rule is grammatical and the banned list is lexical, so an idea with no banned word in it can still fail here, which is exactly why the doc exists separately.

14. **Food, drink and product depiction** (`rules/food-placeholder`, live): Any idea whose hook or `storyMoment` shows a meal, shake, drink or Cambridge product follows the live doc — the permitted vessel↔setting pairings, the one-product rule, the forbidden props, and the **live product catalogue**. **Never name a product or flavour outside that catalogue**; when unsure which flavour belongs to a form, name the form, not a guess. A violation is a rewrite of the scene, not a note for the shoot.

**If any check fails:** Fix the violations before finalising Step 5. Do not finalise until all 14 checks pass. A check that could not be run because its document could not be read is **not a pass** — the run stopped in Step 2.

### Step 5: Output summary

The ideas are already tagged to the plan via `plan_id` — no plan write is needed after saving them (there is no phase bookkeeping to record; the plan's gates are the only state, and this skill never touches them). Output:

```
## YouTube Ideation — <period>

**Ideas saved:** <N> drafts (channel='youtube', propose-only — awaiting human curation)
  Long-form: <n> | Shorts: <n>

### Series Distribution
| Series | Target | Saved | Status |
|--------|--------|-------|--------|
| <series term_label> | <target> | <actual> | PASS / FAIL |

### Stage Mix
| Buyer Stage | Target | Saved | Status |
|-------------|--------|-------|--------|

### Diversity Check Results
| Constraint | Threshold | Actual | Status |
|------------|-----------|--------|--------|
| Hook opener variety (max same type) | ≤30% | <worst %> | PASS / FAIL |
| Repurposability coverage | ≥60% long-form | <count> | PASS / FAIL |
| Month-specificity (evergreen) | ≤25% | <count> | PASS / FAIL |
| Banned words | 0 | 0 | PASS |
| Duplicate series+message | 0 | <count> | PASS / FAIL |
| Pronoun consistency | 0 violations | <count> | PASS / FAIL |

### Compliance Check Results
| Rail | Constraint | Refused / rewritten | Status |
|------|-----------|---------------------|--------|
| `rules/compliance` | 0 refused proof devices | <count> | PASS / FAIL |
| `brand/proof-points` | every claim traces to a live family or real paperwork | <count untraceable> | PASS / FAIL |
| `rules/person-rule` | 0 violations; every hook in a permitted opening frame | <count> | PASS / FAIL |
| `rules/food-placeholder` | 0 violations in any depicted meal / drink / product | <count> | PASS / FAIL |

For each refusal, name the idea, the row or rule it hit, and that rule's own basis as the live document states it.

### Persona taxonomy coverage
Personas listed in `brand/personas` with no corresponding `persona` taxonomy term (untaggable this run — add their taxonomy term before assuming full persona coverage): <none / list of persona names>

---
Curate and approve the video ideas in the content workspace (/content/youtube). Approving ≥1 idea opens Schedule; then re-invoke the agent.
```

## Output

- Draft ideas saved via `save_idea(channel='youtube', plan_id, source='ai', status='draft', …)` — narrative fields in `detail`, structural dimensions in `terms`, all DRAFT status, tagged to the youtube plan
- No gate flipped — ideas are drafts awaiting human curation
- Summary tables showing series/stage distribution accuracy, diversity check results, and the compliance-rail results — with every refusal naming the rule that forbade it and that rule's own basis
- Or, if any Step 2 document could not be read: **no ideas at all** — the run stopped, naming the document

## Governance

- Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — never call `approve` (the ONLY gated promotion; the approval hook denies it to agents, any entity, any gate), and never publish. Demotion is no longer a separate `unapprove_*` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a row. Never edit or delete operator-curated or approved rows: the generic `edit`/`delete` verbs may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- Always gate-check `plan.approved` first (Step 1). If the briefing is not approved, STOP — do not load the KB or save any idea.
- **Every persisted prose field is Vietnamese** (title, comment, hookDirection, coreMessage, whyNow, storyMoment, cta, theme) — hard rule, never English.
- `channel` must always be `'youtube'` and `plan_id` must always be set in every `save_idea` call.
- `terms` carry resolved taxonomy **ids** (via `list_taxonomies` / the plan's target rows) — never codes, never invented ids. Series, stages, personas, and values come from the taxonomies and KB docs, not from remembered lists.
- References only the knowledge paths listed in Step 2. Do not call `get_knowledge` for any other path. **Every one of them is read live, none is restated in this file, and a missing path STOPS the run** (Step 2) — naming which document could not be read. Never proceed from prose in this skill, from memory, or from a cached copy.
- **The compliance rails are `rules/compliance`, `brand/proof-points`, `rules/person-rule` and `rules/food-placeholder`, read live (Step 2, audited by Step 4 checks 11–14).** A banned-word scan is not a compliance surface: it is a word table, and it catches neither a refused proof device, nor an untraceable claim, nor a grammatical person-rule violation. A refused device is **refused citing the rule that forbids it**, and an untraceable claim is **refused** — never rated down, never saved with a caveat in `comment`, never traded off against how strong the idea is. **No refusal, proof family, opening frame or legal reference is written into this file**; the stakes are why — the sanction that matters is suspension of the product's công bố, and the promoter is personally liable under the amended Advertising Law in force from 01/01/2026.
- The diversity thresholds in Step 4 are sourced from `rules/banned-words` and `channels/youtube` — those documents are the source of truth; the numeric guidance above is informational only.
- Operates only on the youtube channel (`channel='youtube'`); never reads or writes `post`/`ad` state.
- Requires `edit` capability (plus `view` for the reads).
