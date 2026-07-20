---
description: >-
  Launch the standalone Cambridge Diet Vietnam post-writer production loop — resolve a scheduled post (by brief id, or by date) → produce N Vietnamese variations for ONE section → self-score + drop/regenerate to brand → PRESENT the set in chat for the operator's review (revise loop) → save as idea-linked drafts only on the operator's go-ahead. Produces TWO sections: `copy` (the mandatory cold start; every saved variation is stamped `section='copy'`) and `image_content` (the structured on-image copy the ImageStudio's Text layer renders), which is GATED on an approved copy — either named via an optional section argument — BOTH `copy` and `image_content` are valid explicit values (`/ssc.post-writer <brief_id> copy` / `… image_content`), and an explicit name always wins over the auto-pick, so naming `copy` after a copy is approved yields a FRESH copy batch — or auto-picked as the next open section when omitted. Interactive: waits for the operator's review before saving; does not save autonomously. Runs after the planning pipeline's Schedule. Propose-only; no /ssc.plan or /ssc.post-plan dependency.
metadata:
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

**Why the brief, not the idea.** `content` rows are **brief-keyed** — `brief_id` is a saved row's sole lineage (there is no `idea_id` column), and it is what the ImageStudio's Text layer reads by (`list_content(brief=…)`). Keying the command on the brief means the id the operator passes is the id every read and write already uses, with nothing to re-derive. It also matches `/ssc.ads-produce <brief_id>`, so both channels' production commands take the same kind of key. A post idea carries exactly **one** brief, so this is never ambiguous.

Optional:

- **Section** (`section`) — **`copy` or `image_content`** (`/ssc.post-writer <brief_id> copy` / `/ssc.post-writer <brief_id> image_content`). Names what to produce this invocation. **Both are valid explicit values and an explicit name always wins over the auto-pick.** Naming **`copy`** targets `copy` — **including when a copy is already approved**, which is how you get a fresh batch of copy variations after the first approval (the same re-invoke-an-approved-section pattern `/ssc.ads-produce` uses; the write path only ever inserts new drafts, so it is non-destructive). **Omit it to work the next open section** — `copy` on a cold start, `image_content` once at least one copy is approved. Only an **unrecognized** value (a typo) is treated as omitted — it falls through to the auto-pick, never to undefined behavior.
- **N** (`n`) — the number of variations to produce for the target section. **Default 4.** Passed through to the writer and authority unchanged.

If neither `brief_id` nor `date` is given, ask the operator for one (one question) before dispatching. Do not invent one. A bare **idea id** is not a target — if the operator passes one, read its single brief (`list_briefs(idea_id)`) and continue with that `brief_id` rather than refusing.

### The two sections

A post carries exactly **two** produced text sections — there is no `headline` and no `description` (those are ad-only):

| Section | What it is | Gate |
|---|---|---|
| **`copy`** | The Facebook post caption — N distinct Vietnamese variations, each a different angle/hook. The **mandatory cold start**. Every saved variation is stamped **`section='copy'`**. | none (produced first) |
| **`image_content`** | The **on-image copy** the ImageStudio's **Text layer** renders over the finished visual — a structured `HEADLINE:` / `SUBHEADLINE:` / `BULLETS:` block, saved as TEXT (it renders no picture). | **≥1 approved `copy`** |

**The `section` stamp is load-bearing, not cosmetic.** The workspace's Copy stage filters **strictly** on `section === 'copy'` and the Image Content stage on `section === 'image_content'` — a variation saved with no section (or the wrong one) does **not** appear in either stage at all. Post content is not a two-value space (a post row may also carry `storyboard` from the video pipeline), so every consumer matches positively on the exact section.

This command is the **production half** of the Posts pipeline. It runs **after** the planning pipeline's **Schedule** step — a post idea is only worked once it has been ideated, curated/approved, and placed on the calendar. It operates **per post idea**, never on a whole plan: it reads **no** `channel_plan`, no gate flags, and no `ads`/`youtube` state. There is **no** `/ssc.plan` or `/ssc.post-plan` precondition.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch the **`ssc-post-writer-agent`**, passing the resolved target (`brief_id`, or the `date` to resolve it from), the `section` (if given), and `n` (if provided). The loop is **interactive**: it runs in the operator's conversation and **pauses at an in-chat review checkpoint before saving** — it does NOT save-and-stop autonomously. Across sessions it is also **state-driven**: on each invocation it works **ONE section** for the resolved post and stops at the next checkpoint / human gate:

| Step | The agent does | Then the operator… |
|---|---|---|
| **Resolve** | Resolves a single scheduled post — by `brief_id` via `get_brief` (which returns the brief AND its owning idea), or by `date` via `get_content_by_date(channel='post')` → that idea's single brief. Works ONE post at a time (a date with several scheduled posts is handled one idea per run). | — |
| **Target section** | `ssc-post-authority` reads the post's existing `content` rows (`list_content(brief=<brief_id>)` — content is brief-keyed, so this is the exact row set) and picks the target section: the named `section` if given, else the **next open** one — `copy` while no copy is approved, `image_content` once one is. `image_content` is **gated on an approved copy**: asked for before then, the loop STOPS, says so, and writes nothing. | Approves ≥1 copy in the **Copy** stage to free `image_content`. |
| **Produce** | For **`copy`**: `ssc-post-produce` drafts N distinct Vietnamese Facebook copy variations — each a different angle/hook — **in-conversation, UNSAVED**, grounded in `voice/*` + `content/*` + `channels/facebook`. For **`image_content`**: `ssc-post-authority` drafts the N on-image versions itself (there is no separate writer step for on-image copy), grounded in the post's **live approved copies** + the brand proof points. | — |
| **Authority (score + present)** | `ssc-post-authority` scores each candidate 1–5 with a Vietnamese rationale comment against `rules/*` + `voice/*` + `content/quick-checklist`, drops + regenerates any rated ≤3 until N are ≥4, then **PRESENTS the candidate set in chat** (numbered body + score + comment) and **PAUSES** — nothing saved yet. Identical discipline in both sections. | Reviews the set in chat and either **requests revisions** to named variation(s) **or** gives the **go-ahead to save** as drafts. |
| **Revise loop** (on request) | The writer (`copy`) or the authority itself (`image_content`) regenerates the named variation(s) in-conversation, the authority re-scores (stays ≥4) and re-presents — still UNSAVED. Repeats until the operator says to save. | Keeps requesting revisions, or gives the go-ahead. |
| **Save (on go-ahead)** | `ssc-post-authority` persists the operator-approved set via `save_content` (one `content` draft per candidate, bound to the post's `brief_id`), **stamping the target `section`** — `'copy'` or `'image_content'` — on every row. Saving persists DRAFTS to curate — **not** a gate approval. | Opens the workspace → `/post/[month]/[id]` → the matching stage (**Copy** or **Image Content**) → reviews the saved rows and **SELECTS + approves ONE** (`draft → approved`) — the only approval. |

**After `image_content` is approved**, the post's ImageStudio (**Images** stage) can run its **Text** layer — it renders the approved `image_content` verbatim over the finished visual, reading it by **brief** (`list_content(brief=…)`), which is why every saved row carries the post's `brief_id`. The prompts for that studio are authored by the separate zero-credit `/ssc.image-prompt <brief_id>`.

The **primary revision path is now pre-save, in chat**. Re-running the agent for the same post produces a **fresh** set of variations (the write path inserts new draft rows; existing drafts are untouched), so it is non-destructive — **name the section explicitly** to choose which set you get back, including a section whose row is already approved (`/ssc.post-writer <brief_id> copy` after a copy is approved yields a fresh copy batch, exactly as `image_content` does). As a **secondary** path, to fix a single weak draft AFTER the save instead of regenerating the whole set, the authority can patch a row it created this run in place via `edit(entity='content', …)` or retire it via `delete(entity='content', …)`.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes, and **nothing is saved autonomously** — the authority presents the candidate set in chat and waits for the operator's go-ahead before persisting. Saving persists DRAFT `content` rows in `brand_os` to curate; it is **NOT** a gate approval — the operator still selects + approves ONE in the `/post/[month]/[id]` workspace. **The agent never flips a gate** — it never changes approval or lifecycle state in either direction (never `approve` — the ONLY gated promotion, and the approval hook denies it to agents; no publish/schedule tool; and never `edit` used to demote/unapprove a row, demotion being an `edit` now rather than a separate `unapprove_*` tool) and never edits or deletes operator-curated or approved rows. The child skills own all writes: `ssc-post-produce` drafts (and revises on request) unsaved; `ssc-post-authority` inserts the operator-approved set only on the go-ahead. This holds in **both** sections — an `image_content` row is saved as a DRAFT exactly like a copy variation, and the loop never approves it, schedules it, or hands it to the image engine. All persisted prose (variation copy, on-image `image_content` bodies, rating comments) is in **Vietnamese**; the in-chat review dialogue may be in the operator's language. Producing requires `edit` (plus `view` for the resolve reads); approving a variation later requires `approve` in the workspace.

## After it runs

If the operator gave the go-ahead and the set was saved, point them to the **Posts workspace** → `/post/[month]/[id]` → the stage matching the section just produced — **Copy** for `copy`, **Image Content** for `image_content` — to review the saved rows and select + approve one. If the loop is still at the in-chat review checkpoint, it resumes on the operator's revise/save instruction (nothing saved yet). If the resolved date had more than one scheduled post, the remaining post(s) for that date still need their own pass — re-invoke this command per post.

Then name the next step for the section just produced:

- after **`copy`** → `Next: approve ONE copy in /post/<month>/<id> → Copy, then run /ssc.post-writer <brief_id> image_content for the on-image copy.`
- after **`image_content`** → `Next: approve ONE image_content row in /post/<month>/<id> → Image Content. The Images stage's Text layer then renders it; author the studio prompts with /ssc.image-prompt <brief_id>.` Re-run this command with `image_content` any time for a fresh revision.
