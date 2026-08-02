#!/usr/bin/env node
// PreToolUse governance gate for the ssc MCP server (Brand OS).
//
// Enforces the propose-only rule at the harness layer, where prose cannot:
//   • approve_* / unapprove_* called from a dispatched SUBAGENT (a pipeline
//     run: ssc-*-agent orchestrating skills)            -> DENY.
//     A pipeline step must never flip an approval/lifecycle gate as a
//     side-effect of its run.
//   • approve_* / unapprove_* called from the MAIN operator conversation
//     ("Cowork, approve idea #3 for me")                -> ASK (confirm).
//     The operator is explicitly in the loop; the confirmation prompt is the
//     authorization. Autonomous/unattended approval cannot get past it.
//   • create_campaign / create_adset / create_ad / update_budget — the
//     money-moving Meta tools — carry EXACTLY the same posture: from a
//     SUBAGENT -> DENY, from the MAIN conversation -> ASK. They spend real
//     money and publish public claims; publishing is a human dashboard action
//     (ads-publish-stage-linkage, D3).
//   • the generic `edit` carrying an approval-bearing field (`status`,
//     `approved`, `<gate>_approved`, `gate`) — i.e. a DEMOTION, which has no
//     verb of its own — carries the same posture: SUBAGENT -> DENY, MAIN -> ASK.
//     An `edit` without such a field is ordinary draft authoring and defers.
//   • everything else                                   -> defer (exit 0).
//
// This is a backstop, not the primary control — the MCP server still enforces
// the `approve` capability server-side, in BOTH directions: promotion via `edit`
// is refused outright, and a DEMOTING `edit` (un-approve / discard / reject) is
// refused for an `edit`-only caller, i.e. for every agent. See hooks/README or
// the plugin governance note. Reasons are operator-facing English (chat/system
// text); only PERSISTED artifact prose is Vietnamese.

// Matches BOTH shapes of approval tool:
//   • legacy per-entity verbs — mcp__ssc__approve_content, mcp__ssc__unapprove_idea, …
//   • the generic verb itself — mcp__ssc__approve / mcp__ssc__unapprove (no suffix)
// The `(_|$)` tail is load-bearing. This gate is DEFAULT-ALLOW (a non-match falls
// through to `process.exit(0)`), so anything this regex misses is affirmatively
// ALLOWED. A trailing-underscore-only pattern would let the bare generic `approve`
// verb sail through and hand agents the power to approve their own work — the exact
// thing this hook exists to prevent. Anchor the tail, never leave it open.
// Non-approval generic verbs (mcp__ssc__edit, mcp__ssc__delete) must NOT match.
//
// A DEMOTION is not a distinct verb: it is an `edit` patch (`{ status: 'draft' }`,
// `{ narrative_approved: false }`, `{ gate, approved: false }`). Name-matching
// cannot see that, so demotion is handled by its own payload-inspecting branch
// below (STATUS_EDIT_TOOL) rather than by widening this regex. Keep
// `mcp__ssc__edit` OUT of this pattern: gating every edit would block the
// ordinary draft writes four skills legitimately make.
const APPROVAL_TOOL = /^mcp__ssc__(approve|unapprove)(_|$)/;

// The money-moving, agent-callable Meta tools. Same posture as approval, for the
// same reason: `create_campaign` / `create_adset` / `create_ad` / `update_budget`
// spend REAL money and publish PUBLIC claims, and both are effectively
// irreversible. Per ads-publish-stage-linkage D3, the Publish stage prepares a
// payload and STOPS — the create itself is a human dashboard action, so no
// skill, agent or automated step may call these.
//
// Exact-match tail (`$`, no `(_|$)`): unlike the approval family there is no
// per-entity suffix form here — these four names are the whole set. A looser tail
// would swallow unrelated future tools (`create_adset_template`, …) and turn a
// governance gate into a nuisance prompt. Server-side capability remains the real
// gate; this is the harness backstop.
const SPEND_TOOL = /^mcp__ssc__(create_campaign|create_adset|create_ad|update_budget)$/;

// The generic mutation verb. Matching the NAME is not a decision here — it only
// buys the right to look at the PATCH. An `edit` carrying no approval-bearing
// field is an ordinary draft write and falls through to normal permission flow;
// an `edit` that would flip a gate gets the approval posture (subagent -> deny,
// main -> ask). This is why `edit` must be wired in hooks.json even though most
// edits are allowed: a hook that is never invoked cannot inspect anything.
//
// `delete` is deliberately NOT here. It is destructive rather than gate-flipping,
// the server refuses it outright for approved rows, and gating it would prompt on
// every draft cleanup. That leaves a known blind spot — see hooks/README.md.
const STATUS_EDIT_TOOL = /^mcp__ssc__edit$/;

// Patch keys that mean "this edit moves an approval/lifecycle gate". Covers the
// three demotion shapes the server actually accepts: a `status` change
// (`edit(content, id, { status: 'draft' })`, `edit(knowledge_revision, id,
// { status: 'rejected' })`), a bare `approved` / `<gate>_approved` boolean
// (`{ narrative_approved: false }`), and the channel_plan pair
// (`{ gate: 'plan', approved: false }`). Anchored, so ordinary content fields
// (`status_note`, `approved_by_name`, …) do not trip it.
//
// Deliberately NOT here: `marked` (strategy findings) — the server declares it
// ungated curation with no approval state, so gating it would be a false prompt.
const GATE_FIELD = /^(status|approved|gate|[a-z0-9_]+_approved)$/i;

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    // If no stdin arrives, don't hang the tool call.
    setTimeout(() => resolve(data), 2000).unref?.();
  });
}

function emit(decision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: decision, // "deny" | "ask"
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

// Treat the call as a subagent call when any subagent-identity signal is
// present and is not the main session. Field names vary across harness
// versions, so check every plausible one — a false "subagent" only makes the
// gate STRICTER (deny), never weaker, so defaulting to subagent on ambiguity
// is the safe bias for a pipeline-heavy plugin.
function isSubagent(input) {
  const candidates = [
    input.agent_id,
    input.agentId,
    input.agent_type,
    input.agentType,
    input.subagent_type,
  ];
  return candidates.some(
    (v) => typeof v === 'string' && v.length > 0 && v !== 'main',
  );
}

// Find the approval-bearing keys in an `edit` payload. The patch may arrive as
// `tool_input.patch` (the documented shape) or flattened onto `tool_input` itself
// across harness/server versions, so check both — one level only, since every
// gate field the server declares is top-level. Returns the matching key names.
function gateFieldsInPatch(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return [];
  const bodies = [toolInput];
  if (toolInput.patch && typeof toolInput.patch === 'object') bodies.push(toolInput.patch);
  const hits = new Set();
  for (const body of bodies) {
    for (const key of Object.keys(body)) {
      if (GATE_FIELD.test(key)) hits.add(key);
    }
  }
  return [...hits];
}

async function main() {
  let input = {};
  try {
    input = JSON.parse((await readStdin()) || '{}');
  } catch {
    // Unparseable input: fail safe for approval tools is to ASK, but we can't
    // read the tool name, so defer and let normal permission flow handle it.
    process.exit(0);
  }

  const tool = input.tool_name ?? input.toolName ?? '';
  const isApproval = APPROVAL_TOOL.test(tool);
  const isSpend = SPEND_TOOL.test(tool);
  const isEdit = STATUS_EDIT_TOOL.test(tool);
  if (!isApproval && !isSpend && !isEdit) process.exit(0); // nothing this gate governs

  // The generic `edit`: gate ONLY when the patch would move an approval gate.
  // Everything else it does is ordinary draft authoring and must keep flowing.
  if (isEdit) {
    const fields = gateFieldsInPatch(input.tool_input ?? input.toolInput);
    if (fields.length === 0) process.exit(0); // an ordinary draft edit — defer

    const shown = fields.join(', ');
    if (isSubagent(input)) {
      emit(
        'deny',
        `Propose-only: a pipeline run (subagent) must not call ${tool} with an ` +
          `approval-bearing field (${shown}). Demotion — un-approving, discarding, ` +
          `rejecting — is an operator action: do it in the dashboard, or ask Cowork ` +
          `directly in the main conversation.`,
      );
    }

    emit(
      'ask',
      `${tool} carries an approval-bearing field (${shown}), so this edit moves an ` +
        `approval/lifecycle gate. Confirm you are doing this on the operator's ` +
        `explicit instruction (not autonomously).`,
    );
  }

  // Money-moving Meta tools — same deny/ask posture as approval, same identity
  // detection. Kept as its own branch only so the reasons can name the real
  // stakes (money + public claims) instead of talking about approval gates.
  if (isSpend) {
    if (isSubagent(input)) {
      emit(
        'deny',
        `Propose-only: a pipeline run (subagent) must not call ${tool}. ` +
          `These tools spend real money and publish public claims, and are effectively ` +
          `irreversible. Publishing is a human dashboard action — the Publish stage ` +
          `prepares the payload and stops.`,
      );
    }

    emit(
      'ask',
      `${tool} spends real money and publishes public claims in the live ad account. ` +
        `Publishing is normally a human dashboard action. Confirm you are doing this on ` +
        `the operator's explicit instruction (not autonomously).`,
    );
  }

  if (isSubagent(input)) {
    emit(
      'deny',
      `Propose-only: a pipeline run (subagent) must not call ${tool}. ` +
        `Approving/unapproving is an operator action — do it in the dashboard, ` +
        `or ask Cowork directly in the main conversation (you'll be asked to confirm).`,
    );
  }

  emit(
    'ask',
    `${tool} flips an approval/lifecycle gate. Confirm you are approving/` +
      `unapproving on the operator's explicit instruction (not autonomously).`,
  );
}

main();
