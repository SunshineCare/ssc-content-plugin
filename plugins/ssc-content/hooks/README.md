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

   It covers **both directions of the approval gate**. The generic `edit` verb's
   capability check is *patch-dependent* (`editCapabilityFor()` in
   `mcp-server/lib/brandos/tools/mutation_tools.ts`): a patch that touches the
   entity's approval field — i.e. any demotion: un-approve, discard, reject —
   requires the `approve` capability, not `edit`, **even though demotion runs no
   gate check**. Agents hold `edit` and never `approve`, so a demoting `edit`
   from an agent is refused server-side with nothing written (not even the legal
   fields in the same patch). Promotion via `edit` is impossible at any
   capability (`promotion_forbidden`).

2. **This PreToolUse hook** (`approval-gate.mjs`, wired in `hooks.json`) — a
   harness backstop that enforces the propose-only rule where prose cannot,
   because it distinguishes *who is calling*:

   | Caller | `mcp__ssc__approve` (and any legacy `approve_*`/`unapprove_*`) | Why |
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
   `approve` (the single generic verb — the ONLY gated promotion) and no publish,
   in either direction; no `edit` used to demote/unapprove/discard/reject a row
   (demotion is now an `edit`, not a separate `unapprove_*` tool — and the prose
   says so as a statement of the **server-enforced** rule, not as a convention:
   the server refuses a demoting patch because it requires `approve`); and no
   editing/deleting operator-curated or approved rows. This is the
   model-behaviour layer; it is necessary but must never be the *only* thing —
   layers 1 and 2 exist because prose alone can be reasoned around.

   Note the division of labour this creates. The hook can hard-deny `approve` by
   NAME, but it **cannot** see inside an `edit` patch — so it can neither allow
   nor refuse a demoting `edit` on its merits, and it does not try. Both
   directions of the gate are therefore held by **layer 1**: the server refuses a
   *promoting* patch outright (`promotion_forbidden`, any capability) and refuses
   a *demoting* patch from an `edit`-only caller (an agent) on the capability
   check. **No gate-flip direction is held by prose alone.**

## What stays dashboard-only regardless

Reversible, low-stakes gates (curate/select drafts, per-idea approval) are fine
to do on the operator's explicit instruction via layer 2. **Consequential,
hard-to-reverse actions — publishing, ad spend (`update_budget` syncs to the
Facebook Marketing API) — are never agent-callable** and stay operator-only in
the dashboard.

## Tests

`approval-gate.test.mjs` pins **both** patterns — the `APPROVAL_TOOL` regex in
`approval-gate.mjs` **and** the PreToolUse `matcher` in `hooks.json` (the latter
decides whether the hook is even invoked, so it must agree with the former). Run
it from `plugins/ssc-content/`:

```bash
node --test "hooks/**/*.test.mjs"
```

Zero dependencies — plain `node:test` + `node:assert`. It reads each pattern **from
disk** rather than restating it (a test carrying its own copy of the regex would
keep passing while the real hook regressed), and asserts that the generic
`approve`/`unapprove` verbs and the legacy `approve_*`/`unapprove_*` names are
gated, that `edit`/`delete`/reads are not, and that adversarial near-misses
(`approval_status`, `approved_thing`, `disapprove`, `mcp__other__approve`) stay
ungated. This is load-bearing precisely because the gate is **default-allow**: a
name the matcher misses does not fail loudly — it is silently **allowed**.

## Deploy note

The matcher is covered by `approval-gate.test.mjs` (see **Tests** above). The
decision behaviour was verified against the Claude Code hooks spec by exercising
`approval-gate.mjs` directly (main→ask, subagent→deny, non-gate→defer). Confirm
once in the live Cowork runtime that (a)
the plugin PreToolUse hook fires for MCP tool calls and (b) an `ask` decision
surfaces a confirmation to the operator — Cowork is built on Claude Code but the
interactive-prompt surface should be eyeballed once after install.
