# Approval governance — the propose-only gate

The ssc-content skills and agents are **propose-only**: they draft and score
work, and the operator approves it. Approving (or un-approving) flips a
governance gate on the Brand OS record — it has real downstream consequences —
so it is an **operator action**, never something a pipeline step does on its own.

There are three layers holding that line, weakest last:

1. **Server-side capability** (authoritative). The Brand OS MCP server enforces
   the `approve` capability per operator (`requireCapability` in
   `mcp-server/lib/brandos/auth.ts`). This is the real gate and does not depend
   on anything in this plugin.

2. **This PreToolUse hook** (`approval-gate.mjs`, wired in `hooks.json`) — a
   harness backstop that enforces the propose-only rule where prose cannot,
   because it distinguishes *who is calling*:

   | Caller | `mcp__ssc__approve_*` / `unapprove_*` | Why |
   |---|---|---|
   | A **pipeline run** (any dispatched `ssc-*` agent / subagent) | **deny** | A propose-only step must never flip a gate as a side-effect of its run — even accidentally, even if the operator is watching. |
   | The **main operator conversation** ("Cowork, approve idea #3 for me") | **ask** (confirm prompt) | The operator is explicitly in the loop; the confirmation *is* the authorization. An autonomous/unattended approval can't get past a prompt nobody clicks. |
   | Anything else | defer | Not a gate-flip tool. |

   The hook keys off the `agent_id`/`agent_type` fields that Claude Code adds to
   PreToolUse input inside a subagent (absent in the main conversation). This is
   the sanctioned way to **approve on the operator's behalf**: ask Cowork
   directly in the main conversation and confirm the prompt — not by having a
   pipeline skill do it.

3. **Prose** (in every skill/agent). The propose-only hard rule states no
   `approve_*`/`unapprove_*`/`update_status`/publish, in either direction, and
   no editing/deleting operator-curated or approved rows. This is the
   model-behaviour layer; it is necessary but must never be the *only* thing —
   layers 1 and 2 exist because prose alone can be reasoned around.

## What stays dashboard-only regardless

Reversible, low-stakes gates (curate/select drafts, per-idea approval) are fine
to do on the operator's explicit instruction via layer 2. **Consequential,
hard-to-reverse actions — publishing, ad spend (`update_budget` syncs to the
Facebook Marketing API) — are never agent-callable** and stay operator-only in
the dashboard.

## Deploy note

Behaviour was verified against the Claude Code hooks spec and by exercising
`approval-gate.mjs` directly (main→ask, subagent→deny, non-gate→defer,
`get_approval_status`→defer). Confirm once in the live Cowork runtime that (a)
the plugin PreToolUse hook fires for MCP tool calls and (b) an `ask` decision
surfaces a confirmation to the operator — Cowork is built on Claude Code but the
interactive-prompt surface should be eyeballed once after install.
