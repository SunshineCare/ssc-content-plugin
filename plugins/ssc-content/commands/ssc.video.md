---
description: >-
  Launch the reusable Brand OS video-production workflow (011-video-production) for ONE approved idea + channel (post/ad/youtube) — Brief → Script → Storyboard → Scene Assets → Assemble → Package → Voice. Thin entry point that dispatches ssc-video-agent, which is state-driven — it reads the production's current step state and works the single next open step it can actually produce (currently: Script, then Storyboard — both Cowork-native text steps), stopping at that step's human gate. Scene Assets/Assemble/Package/Voice need backend AI-generation MCP tools (US3/US6) not yet built; the agent reports this plainly rather than working around it. Propose-only; nothing auto-approves.
metadata:
  brand: cambridge-diet-vn
  section: video
---

## User Input

```text
$ARGUMENTS
```

Consider the user input above before proceeding (if not empty). Expected inputs — **one of**:

- **Idea ID** (`idea_id`) — the id of ONE approved idea (an `ideas` row, `status='approved'`) to produce a video for. This is the key the dispatched agent resolves/starts a production against.
- **Production ID** (`production_id`) — an existing video production's id, to resume it directly without re-resolving the idea.

If neither is given, ask the operator for one (one question) before dispatching. Do not invent one.

Optional:

- **Channel** (`channel`) — one of `post` | `ad` | `youtube`. Defaults to the idea's own channel (FR-006). Only pass this to repurpose the idea onto a different channel's production — at most one production per (idea, channel).

This command runs **after** an idea has been approved (via any of the Posts/Ads/YouTube planning pipelines). It operates **per production**, never on a whole plan — there is no `/ssc.plan` or per-channel plan precondition beyond an approved idea.

## What to do

This command is a thin entry point — it holds **no** orchestration logic. Dispatch **`ssc-video-agent`**, passing `idea_id` (or `production_id`) and the optional `channel`.

The agent is a **state-driven stepper**: it reads the production's current step states via `get_production` and works exactly the **next open step**, then stops at that step's human gate.

| The agent does | Then the operator… |
|---|---|
| **Script** (Cowork-native, no AI-provider call): drafts the Vietnamese spoken narration and saves it as a draft. | Reviews/edits/approves the Script in the video-production workspace (`/video/<production_id>`), then re-runs this command. |
| **Storyboard** (Cowork-native, no AI-provider call): breaks the approved Script into an ordered scene list and saves it as a draft. | Reviews/reorders/edits/approves the Storyboard, then re-runs this command. |
| **Scene Assets / Assemble / Package / Voice**: **not yet producible by Cowork** — these need backend AI-generation tools (011-video-production US3/US6) that haven't shipped. | Fills these steps by hand (upload) in the workspace for now; re-run this command later once those tools ship. |

Re-run this command (same `idea_id`/`production_id`) after each gate to advance.

## Governance

Nothing auto-approves, auto-applies, or auto-publishes. `ssc-video-agent` and its dispatched skills (`ssc-video-script`, `ssc-video-storyboard`) **save DRAFT values** to the server and stop; the operator reviews/edits/approves each step in the video-production workspace. Propose-only (hard rule): neither the agent nor its skills ever call any tool that changes approval or lifecycle state in either direction — never `approve` (the ONLY gated promotion, denied to agents by the approval hook; any entity, incl. `production_step`, any gate — and they do not hold the `approve` capability), and never publish. Demotion is no longer a separate `unapprove_step` tool — it is an `edit`, so the ban lives here: never use `edit` to demote, unapprove, discard, or reject a step — the MCP server refuses such a patch on the capability check and writes nothing. Never `set_consistency_profile`, and never call an AI provider directly outside the governed MCP write path. Producing requires `edit` (plus `view` for the resolve reads); approving a draft later requires `approve` in the workspace.

## After it runs

Point the operator to the video-production workspace (`/video/<production_id>`) to review/edit/approve the step the agent just drafted, then re-run `/ssc.video <idea_id or production_id> [channel]` to advance to the next step. Re-invoke per production — it works ONE production at a time.
