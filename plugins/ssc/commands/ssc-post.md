---
argument-hint: '<brief_id|YYYY-MM-DD> [copy] [n]'
description: >-
  Produces post TEXT for ONE scheduled post (`<brief_id|YYYY-MM-DD> [copy] [n]`) — N
  Vietnamese variations of the post's one produced section, `copy` (the Facebook
  caption). Interactive: it self-scores, presents the set in chat for review, and saves
  drafts only on the operator's go-ahead — never autonomously. Propose-only.
metadata:
  dispatches: [ssc-post-writer-agent]
  brand: cambridge-diet-vn
  section: post
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs — **one of**:

- **Brief ID** (`brief_id`) — the id of the post's brief, targeting it directly. **The primary key, and the one the dashboard emits** (the `/post/[month]/[id]` workspace's Cowork button). It is resolved via `get_brief(brief_id)`, which returns the brief **AND its owning post idea** in one call — so a `brief_id` names the post and its brief at once, and no separate `idea_id` is needed.
- **Date** (`date`, format `YYYY-MM-DD` — a calendar day, e.g. `2026-07-14`). Resolved to the scheduled post idea(s) for that day on the post channel, and then to that idea's single brief.

**Why the brief, not the idea.** `content` rows are **brief-keyed** — `brief_id` is a saved row's sole lineage (there is no `idea_id` column), and it is what the ImageStudio's Text layer reads by (`list_content(brief=…)`). Keying the command on the brief means the id the operator passes is the id every read and write already uses, with nothing to re-derive. It also matches `/ssc-ad <brief_id>`, so both channels' production commands take the same kind of key. A post idea carries exactly **one** brief, so this is never ambiguous.

Optional:

- **Section** (`section`) — **`copy`** (`/ssc-post <brief_id> copy`), the one section this command produces. Naming it is accepted and redundant: the loop works `copy` whether or not it is given, **including when a copy is already approved**, which is how you get a fresh batch of copy variations after the first approval (the same re-invoke-an-approved-section pattern `/ssc-ad` uses; the write path only ever inserts new drafts, so it is non-destructive). An **unrecognized** value (a typo) is treated as omitted — it falls through to `copy`, never to undefined behavior.
- **`image_content` is a routing STOP, never a silent redirect.** It is a recognized value **solely so it can be refused**: named explicitly as the section, it is passed to the agent, which hands it to `ssc-post-authority` — whose Step 0 STOPs (Vietnamese) naming **`/ssc-image-prompt <brief_id> text`**, the ImageStudio's Text step that authors the on-image copy fitted to the visual it will sit on. Nothing is produced in its place and nothing is written.
- **N** (`n`) — the number of variations to produce for the target section. **Default 4.** Passed through to the writer and authority unchanged.

If neither `brief_id` nor `date` is given, ask the operator for one (one question) before dispatching. Do not invent one. A bare **idea id** is not a target — if the operator passes one, read its single brief (`list_briefs(idea=<idea_id>)` — the parameter is `idea`) and continue with that `brief_id` rather than refusing.

### The one produced section

This command produces exactly **one** text section — there is no `headline` and no `description` (those are ad-only):

| Section | What it is | Gate |
|---|---|---|
| **`copy`** | The Facebook post caption — N distinct Vietnamese variations, each a different angle/hook. Every saved variation is stamped **`section='copy'`**. | none |

**The `section` stamp is load-bearing, not cosmetic.** The workspace's Copy stage filters **strictly** on `section === 'copy'` — a variation saved with no section (or the wrong one) does **not** appear in the stage at all. Post content is not a single-value space (a post row may also carry `image_content` from the ImageStudio's Text step, or `storyboard` from the video pipeline), so every consumer matches positively on the exact section.

This command is the **production half** of the Posts pipeline. It runs **after** the planning pipeline's **Schedule** step — a post idea is only worked once it has been ideated, curated/approved, and placed on the calendar. It operates **per post idea**, never on a whole plan: it reads **no** `channel_plan`, no gate flags, and no `ads`/`youtube` state. There is **no** `/ssc-plan` or `/ssc-post-plan` precondition.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-post-writer-agent`**, passing the resolved target (`brief_id`, or the `date` to resolve it from), the `section` the operator named if they named one — the only two values it carries are `copy` and the refused `image_content`; an unrecognized one is passed as omitted — and `n` (if provided). The loop is **interactive**: it runs in the operator's conversation and **pauses at an in-chat review checkpoint before saving** — it does NOT save-and-stop autonomously. Across sessions it is also **state-driven**: on each invocation it works the resolved post's `copy` and stops at the next checkpoint / human gate:

| Step | The agent does | Then the operator… |
|---|---|---|
| **Resolve** | Resolves a single scheduled post — by `brief_id` via `get_brief` (which returns the brief AND its owning idea), or by `date` via `get_content_by_date(channel='post')` → that idea's single brief. Works ONE post at a time (a date with several scheduled posts is handled one idea per run). | — |
| **Target section** | `ssc-post-authority` reads the post's existing `content` rows (`list_content(brief=<brief_id>)` — content is brief-keyed, so this is the exact row set) and targets **`copy`**, matching positively on that section and ignoring rows in any other one. | — |
| **Produce** | `ssc-post-produce` drafts N distinct Vietnamese Facebook copy variations — each a different angle/hook — **in-conversation, UNSAVED**, grounded in `voice/*` + `content/*` + `channels/facebook`. | — |
| **Authority (score + present)** | `ssc-post-authority` scores each candidate 1–5 with a Vietnamese rationale comment against `rules/*` + `voice/*` + `content/quick-checklist`, drops + regenerates any rated ≤3 until N are ≥4, then **PRESENTS the candidate set in chat** (numbered body + score + comment) and **PAUSES** — nothing saved yet. | Reviews the set in chat and either **requests revisions** to named variation(s) **or** gives the **go-ahead to save** as drafts. |
| **Revise loop** (on request) | `ssc-post-produce` regenerates the named variation(s) in-conversation, the authority re-scores (stays ≥4) and re-presents — still UNSAVED. Repeats until the operator says to save. | Keeps requesting revisions, or gives the go-ahead. |
| **Save (on go-ahead)** | `ssc-post-authority` persists the operator-approved set via `save_content` (one `content` draft per candidate, bound to the post's `brief_id`), **stamping `section='copy'`** on every row. Saving persists DRAFTS to curate — **not** a gate approval. | Opens the workspace → `/post/[month]/[id]` → the **Copy** stage → reviews the saved rows and **SELECTS + approves ONE** (`draft → approved`) — the only approval. |

**After a `copy` is approved**, the post's ImageStudio (**Images** stage) is open: the zero-credit `/ssc-image-prompt <brief_id>` works the visual chain, and its **Text** step authors the on-image copy fitted to the finished visual and then the prompt that places it — reading this post's rows by **brief** (`list_content(brief=…)`), which is why every saved row carries the post's `brief_id`.

The **primary revision path is pre-save, in chat**. Re-running the agent for the same post produces a **fresh** set of copy variations (the write path inserts new draft rows; existing drafts are untouched), so it is non-destructive — including once a copy is already approved (`/ssc-post <brief_id> copy` then yields a fresh copy batch). As a **secondary** path, to fix a single weak draft AFTER the save instead of regenerating the whole set, the authority can patch a row it created this run in place via `edit(entity='content', …)` or retire it via `delete(entity='content', …)`.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes, and **nothing is saved autonomously** — the authority presents the candidate set in chat and waits for the operator's go-ahead before persisting. Saving persists DRAFT `content` rows in `brand_os` to curate; it is **NOT** a gate approval — the operator still selects + approves ONE in the `/post/[month]/[id]` workspace. **The agent never flips a gate** — it never changes approval or lifecycle state in either direction (never `approve` — the ONLY gated promotion, and the approval hook denies it to agents; no publish/schedule tool; and never `edit` used to demote/unapprove a row, demotion being an `edit` the server gates on the `approve` capability) and never edits or deletes operator-curated or approved rows. The child skills own all writes: `ssc-post-produce` drafts (and revises on request) unsaved; `ssc-post-authority` inserts the operator-approved set only on the go-ahead. Every row lands as a DRAFT, and the loop never approves it, schedules it, or hands it to the image engine. All persisted prose (variation copy, rating comments) is in **Vietnamese**; the in-chat review dialogue may be in the operator's language. Producing requires `edit` (plus `view` for the resolve reads); approving a variation later requires `approve` in the workspace.

## After it runs

If the operator gave the go-ahead and the set was saved, point them to the **Posts workspace** → `/post/[month]/[id]` → the **Copy** stage to review the saved rows and select + approve one. If the loop is still at the in-chat review checkpoint, it resumes on the operator's revise/save instruction (nothing saved yet). If the resolved date had more than one scheduled post, the remaining post(s) for that date still need their own pass — re-invoke this command per post.

Then name the next step:

- `Next: approve ONE copy in /post/<month>/<id> → Copy, then run /ssc-image-prompt <brief_id> for the post's visual — its Text step writes the on-image copy onto the finished image and then the prompt that places it.` Re-run this command any time for a fresh batch of copy variations.
