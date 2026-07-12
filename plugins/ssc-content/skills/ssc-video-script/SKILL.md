---
name: ssc-video-script
description: Produces the SCRIPT step of the reusable Brand OS video-production workflow (011-video-production) for ONE approved idea + channel (post/ad/youtube). Resolves the idea (by idea_id, or by date via the idea's schedule), starts/resumes its production via start_production, reads the idea's creative brief + strategic tags, loads the channel-appropriate voice/brand/content knowledge base, and drafts the Vietnamese spoken narration (hook → body → soft CTA) — pure narration, no inline shot/on-screen-text cues (a separate future storyboard skill owns those). Self-checks the draft against a quality checklist (proof points, banned words, pronoun register, authenticity guardrail) and revises in place before saving. Saves the narration as the Script step's current value via save_step_value(section='script') and STOPS. Cowork-native — Claude writes the narration directly; no AI-provider tool call. Propose-only: saves a DRAFT slot value only, never calls approve (entity production_step), never uses edit to demote a step, never flips a gate.
metadata:
  type: skill
  stage: video-production
  brand: cambridge-diet-vn
  section: video
  capability: edit
  tools: [get_idea, start_production, get_production, get_knowledge, save_step_value]
---

# Video Script (`ssc-video-script`)

You are the **Script** step producer of the reusable Brand OS video-production workflow (spec `011-video-production`, FR-002/FR-017). You take **ONE approved idea**, resolve (or start) its video **production** for a target channel, and draft the **spoken Vietnamese narration** — the words a host/Kiều My would say on camera — grounded in that channel's voice and brand knowledge. You save the narration as the Script step's single current value and **stop**. You do **not** storyboard, generate images/video, assemble, package, or produce voiceover audio — those are separate steps (separate future skills) in the same production.

This is step 2 of the production's step order (**Brief → Script → Storyboard → Scene Assets → Assemble → Package → Voice**). Brief is read-only (the idea itself); this skill produces the first writable step.

## Inputs

- `idea_id` — the approved idea this production is for. **Required.**
- `channel` — `post` | `ad` | `youtube`. **Optional** — defaults to the idea's own `channel` (an idea may be produced for a different channel than it originated on, per FR-006; only pass this to repurpose across channels).

## Procedure

### Step 1: Resolve the idea

```
Call: get_idea
  id: <idea_id>
```

**Gate-check:** If `idea` is null, STOP and tell the operator the idea id was not found. If `idea.status` is not `approved`, STOP and tell the operator only approved ideas can enter production.

Hold `idea.channel` as the default target channel when the `channel` input is omitted.

### Step 2: Start or resume the production

```
Call: start_production
  idea_id: <idea_id>
  channel: <channel — the input, or idea.channel if omitted>
```

This is idempotent — it returns the existing `(idea, channel)` production if one already exists (FR-006). Hold `production_id`.

### Step 3: Read the production state

```
Call: get_production
  production_id: <production_id>
```

From the result, find the **`script`** step's current entry. Hold, if present: its `content_id` and `version` (you need `version` as `expected_version` to override an existing value — omit `expected_version` entirely if no script value exists yet, i.e. this is the first save). Note its `status`:

- If `status` is `approved`, this run will **re-open it to draft and re-run compliance** (FR-011) — a legitimate revision, not an error. Say so plainly in the Step 6 summary; do not silently overwrite without mentioning it.
- Any other status (`empty`/`draft`/`in_review`) — proceed normally.

Also note the channel's production template if surfaced (target duration/aspect) — use it to judge how long the spoken narration should run (a `post`/`reel` short vertical video reads far shorter than a `youtube` long-form video).

### Step 4: Read the idea's brief + strategic tags

From the Step 1 `idea`, hold the **brief**:

- `hook_direction` — the opening-hook direction (a starting point, not verbatim copy)
- `core_message` — the strategic argument/transformation the video carries (the spine of the narration)
- `why_now` — why this topic is timely; keep the narration month-specific, not evergreen
- `story_moment` — the concrete scene/moment that anchors the video
- `cta` — the intended call-to-action direction (soft, authentic)
- `theme` — the month theme this idea belongs to (may be null)
- `title` — the idea's working title

And from `tags_by_kind`: the **persona** (audience archetype), **pillar** (content pillar), and any **frame**/**value**/**entry**/**against**/**experience**/**campaign_layer** tags present. The brief is the strategic frame — do not drift off its message, persona, or pillar.

**Resolve the persona's detail-doc path.** The persona tag's taxonomy `code` maps to a knowledge-base detail doc by a fixed, mechanical rule: `brand/persona-<slug>`, where `<slug>` is the code with the leading `chi-` prefix removed (e.g. `code = 'chi-huong'` → `brand/persona-huong`; `chi-lan` → `brand/persona-lan`; `chi-mai` → `brand/persona-mai`; `chi-thao` → `brand/persona-thao`). Do not hardcode a persona-name-to-path lookup table — derive the path from the code each run, so a new persona added to `brand/personas` later resolves correctly with no procedural change. Hold this resolved path forward into Step 5's knowledge-base load.

### Step 5: Load the knowledge base (channel-conditional)

Always load this **common** set:

```
Call: get_knowledge
  paths: [
    "voice/tone", "voice/pronouns", "voice/pronoun-guide", "voice/vietnamese-rules",
    "voice/vocabulary", "voice/founder-voice",
    "brand/woman-to-woman", "brand/positioning", "brand/proof-points",
    "programme/kieu-my-story",
    "rules/banned-words", "content/quick-checklist"
  ]
```

Plus `brand/persona-<slug>` — the resolved persona's detail doc from Step 4 (ranked trigger points with content guidance, objections + how to dismantle them, real vocabulary to echo/avoid, myths to debunk, and channel/trust behaviour for that one persona). Load this single detail doc, never all four — this skill resolves one idea with one known persona per run. It loads regardless of target channel — persona grounding is not channel-specific; only the channel-specific set below varies by channel.

Then load the **channel-specific** set on top, by the target channel (Step 2):

- **`post`**: `content/reels` (Reels pacing/hook structure — the closest existing guidance for short vertical video), `channels/facebook`, `content/cta-guidelines`, `content/pillars`
- **`ad`**: `ad/creative-guidelines`, `ad/copy-checklist`, `ad/formats`, `ad/platform-constraints`, `ad/cta-catalog`, `brand/angles`, `rules/compliance` (the ad channel is dual-policy — category + Meta — at the approval gate; this skill does not run that check, but the copy should already be compliant)
- **`youtube`**: `channels/youtube`, `brand/personas`, `brand/journey-stages`

If unsure a path exists, `list_knowledge(category=...)` first. Read everything before drafting a single line.

### Step 6: Draft the spoken narration (do not save yet)

Draft **one** definitive narration — the actual words spoken on camera — as continuous Vietnamese prose, structured in three natural beats:

1. **Hook** (first ~3 seconds) — earns the watch: a direct question, a confession-style opener, or a bold/surprising claim. Ground it in `hook_direction` and `story_moment`, but don't recite them verbatim — write it as something a person actually says out loud.
2. **Body** — develops `core_message`, anchored in `story_moment`, honouring `why_now` so it doesn't read evergreen. Weave in concrete Cambridge proof points from `brand/proof-points` (aim for ≥3 distinct on a long-form/ad narration; a short Reel narration may naturally carry 1–2 — do not force a bare list).
3. **Close** — a soft, authentic spoken call-to-action per `cta` and (for `ad`) `ad/cta-catalog`.

**Ground the narration in the persona detail doc** (`brand/persona-<slug>`, Step 5): pick the hook from her ranked trigger points, echo her real vocabulary (and avoid what it flags to avoid), and pre-empt the objections it names rather than let them surface unaddressed in the body.

**Pure narration only — no inline production cues.** Do not add `[B-roll: ...]`, `[on-screen text: ...]`, timestamps, or scene markers; that structuring belongs to the future Storyboard skill, which will read this script and break it into scenes. Write flowing spoken sentences, not a bulleted outline.

**Length/pacing** — let the target channel's duration guide length: a `post`/reel narration reads in roughly the Reel's runtime (short, tight, no wasted words); a `youtube` long-form narration can develop the argument more fully; an `ad` narration matches the ad format's typical spot length (per `ad/formats`). When in doubt, err short — a video script that's too long is easier to notice than one that's too short.

**Authenticity guardrail (read FIRST, same as post/ad production):**

1. **Kiều My (real founder).** Her voice/opinions/educational framing are yours to write. Her personal story, anecdotes, results, or quotes are **NOT** — ground any of those only in `programme/kieu-my-story` + `voice/founder-voice`; never invent a biographical specific.
2. **Other real people.** Use a testimonial/result only if the brief hands you a real, consented one. Never invent a named customer or a "Chị X giảm Ykg" result.
3. **Personas and the general viewer.** Illustrative scenarios are fine, framed as representative ("nhiều chị ở tuổi 45 thấy…") — never as a specific named real testimonial.

A fabricated real-person story is a compliance failure waiting to happen at the approval gate.

### Step 7: Self-check before saving

Run this checklist against your draft. Fix any failure by revising the narration in place (do not save a version that fails a check):

1. **Hook lands in the opening line** — not a throat-clear, not a brand intro first.
2. **Spoken, not written** — reads naturally out loud in Vietnamese; no translated-English rhythm (`voice/vietnamese-rules`), no hashtags/emoji baked into the narration text.
3. **Pronoun register correct** for the channel/persona (`voice/pronouns`/`voice/pronoun-guide`).
4. **Proof points woven naturally**, not listed — and no fabricated number (`brand/proof-points`).
5. **No banned words** (`rules/banned-words`) — zero tolerance.
6. **Authenticity guardrail honoured** (Step 6) — no fabricated real-person story.
7. **CTA is soft and authentic**, matches `cta`/the channel's CTA guidance.
8. **No inline production cues** — pure narration (Step 6 rule).
9. **On brief** — still carries `core_message`, persona, and pillar; not generic enough to fit any idea.

If a check fails twice on the same issue after revision, save the best version anyway and name the unresolved concern in the Step 9 summary rather than looping indefinitely — the operator reviews every draft regardless.

### Step 8: Save the narration

```
Call: save_step_value
  production_id: <production_id>
  section: script
  body: <the final Vietnamese narration, plain prose>
  source_model: claude-sonnet-5
  generation_prompt: <one line: which brief fields + KB paths grounded this draft>
  expected_version: <the script step's current version — ONLY if Step 3 found an existing script value; omit entirely on first save>
```

This call returns `{ content_id, version, status: 'draft' }`. The value is a **draft** regardless of whether it overrode an approved one (FR-011/FR-012) — nothing here approves it.

### Step 9: Output summary

```
## Video Script — <idea title>

**Production:** <production_id> (idea <idea_id> · channel <channel>)
**Script saved:** content <content_id>, version <version>, status draft

**Brief honoured:** core_message, persona (<persona>), pillar (<pillar>) held; hook/story_moment/why_now/cta reflected in the narration.

### Narration

<the full Vietnamese narration>

### Self-check
| Check | Result |
|---|---|
| Hook lands immediately | PASS/FAIL |
| Spoken Vietnamese, correct pronouns | PASS/FAIL |
| ≥1 proof point woven (target ≥3 for long-form/ad) | PASS (n=<count>) |
| No banned words | PASS |
| Authenticity guardrail | PASS |
| Soft, on-brief CTA | PASS |
| No inline production cues | PASS |

---
<Note if this reopened a previously-approved script to draft.>
Next: review/edit the narration in the video-production workspace (/video/<production_id>), then approve it there (requires the `approve` capability — compliance runs automatically first). Approving Script unblocks Storyboard.
```

## Output

- The production's **`script`** step holds exactly one current value: the drafted Vietnamese narration, saved via `save_step_value(production_id, section='script', body, source_model, generation_prompt, expected_version?)` — status `draft`.
- No gate flipped. No `approve(entity='production_step', …)` call, and no `edit` used to demote a step. No compliance override.
- If the idea's production did not yet exist, one was started (`start_production`) — this alone is not a content write.

## Governance

- Propose-only (hard rule): never call `approve` (the ONLY gated promotion — any entity, incl. `production_step`; the approval hook denies it to agents), never use `edit` to demote/unapprove a step (demotion is an `edit` now, not a separate `unapprove_step` tool — so the ban lives here), and never call any other tool that changes approval/lifecycle state. Never call `set_consistency_profile` (a separate concern, not this skill's job) or any generation/asset tool — Script is text-only and Cowork-native.
- **Cowork-native.** You (Claude) write the narration directly. There is no AI-provider/generation tool call in this skill — `save_step_value` is a direct write, not a wrapped generation call. `source_model` records that Claude authored it directly.
- **Single track.** There is exactly one current script value per production. Re-invoking this skill overrides it (FR-007/FR-009); the prior value's history is retained server-side for audit, not by this skill.
- **Pure narration only.** Never add shot/scene/on-screen-text cues to the script body — that is the Storyboard step's job (a separate skill, built after this one).
- **All persisted prose in Vietnamese** (FR-028). Chat-side reasoning may stay English.
- References only the knowledge paths in Step 5 (the common set + the resolved channel's set). Do not call `get_knowledge` for unrelated paths.
- One idea/production at a time — never batch across ideas in a single run.
- Requires the `edit` capability (plus `view` for the `get_idea`/`get_production`/`get_knowledge` reads). Approving the saved draft later requires `approve`, in the video-production workspace.
