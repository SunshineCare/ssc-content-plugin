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
// And they CANNOT be policed here even in principle: a DEMOTION is now an `edit`
// patch (`{ status: 'draft' }`), and this hook sees a tool NAME, never a patch
// body. That half of the propose-only rule is held SERVER-SIDE instead — the
// generic `edit` requires the `approve` CAPABILITY for any patch touching an
// entity's approval field, and agents hold only `edit`. Do not try to teach this
// regex about demotion; it is structurally blind to it, and the server is not.
const APPROVAL_TOOL = /^mcp__ssc__(approve|unapprove)(_|$)/;

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
  if (!APPROVAL_TOOL.test(tool)) process.exit(0); // not a gate-flip tool

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
