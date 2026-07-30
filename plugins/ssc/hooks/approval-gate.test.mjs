// Tests for the approval-gate PreToolUse matcher.
//
// WHY THIS FILE EXISTS: the gate is DEFAULT-ALLOW. `approval-gate.mjs` bails with
// `process.exit(0)` on any tool name its regex does not match, and `hooks.json`'s
// matcher decides whether the hook is even INVOKED. So a matcher that is too narrow
// is not a loud failure — it is a silent hole that hands agents the power to approve
// their own work. Both patterns are pinned here so a future edit cannot quietly
// reintroduce that hole (e.g. reverting the `(_|$)` tail to a bare `_`, which would
// let the generic `mcp__ssc__approve` verb sail straight through).
//
// Both patterns are READ FROM DISK — never retyped. A test that keeps its own copy
// of the regex proves only that the copy works; it would keep passing while the real
// hook regressed. `approval-gate.mjs` cannot simply be imported (it runs `main()` on
// load, reads stdin and exits), so its literal is extracted from the source text.
//
// Run: node --test hooks/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const HOOK_SRC = new URL('./approval-gate.mjs', import.meta.url);
const HOOKS_JSON = new URL('./hooks.json', import.meta.url);

/** Extract a named regex literal (`const <NAME> = /.../;`) from approval-gate.mjs. */
function readHookRegexNamed(name) {
  const src = readFileSync(HOOK_SRC, 'utf8');
  const m = src.match(new RegExp(`^const ${name} = /(.*)/([a-z]*);$`, 'm'));
  assert.ok(
    m,
    `could not find \`const ${name} = /.../;\` in approval-gate.mjs — ` +
      'the hook was restructured; update this extractor rather than hardcoding the pattern.',
  );
  return new RegExp(m[1], m[2]);
}

/** Extract the live `APPROVAL_TOOL` regex literal from approval-gate.mjs. */
function readHookRegex() {
  return readHookRegexNamed('APPROVAL_TOOL');
}

/** Extract the live `SPEND_TOOL` regex literal from approval-gate.mjs. */
function readSpendRegex() {
  return readHookRegexNamed('SPEND_TOOL');
}

/**
 * Extract every PreToolUse matcher that wires up approval-gate.mjs, as ONE
 * predicate. The gate may be wired by more than one entry (approval verbs and
 * money-moving tools are disjoint families with their own matchers); what
 * matters for "does the hook run at all" is the UNION of them.
 */
function readHooksJsonMatcher() {
  const cfg = JSON.parse(readFileSync(HOOKS_JSON, 'utf8'));
  const entries = (cfg.hooks?.PreToolUse ?? []).filter((e) =>
    e.hooks?.some((h) => typeof h.command === 'string' && h.command.includes('approval-gate.mjs')),
  );
  assert.ok(entries.length > 0, 'no PreToolUse entry in hooks.json wires up approval-gate.mjs');
  const patterns = entries.map((e) => {
    assert.equal(typeof e.matcher, 'string', 'an approval-gate PreToolUse entry has no string matcher');
    return new RegExp(e.matcher);
  });
  return { test: (tool) => patterns.some((re) => re.test(tool)) };
}

/** Run the hook for real: feed it a PreToolUse payload on stdin, parse its decision. */
function runHook(payload) {
  const out = execFileSync(process.execPath, [HOOK_SRC.pathname], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
  });
  if (out.trim() === '') return { decision: null, reason: null };
  const parsed = JSON.parse(out);
  return {
    decision: parsed.hookSpecificOutput?.permissionDecision ?? null,
    reason: parsed.hookSpecificOutput?.permissionDecisionReason ?? null,
  };
}

// Tool names that MUST be gated (hook invoked -> deny for subagents / ask in main).
const MUST_MATCH = [
  'mcp__ssc__approve', // the generic verb — the ONLY gated promotion
  'mcp__ssc__unapprove',
  'mcp__ssc__approve_content',
  'mcp__ssc__approve_idea',
  'mcp__ssc__unapprove_channel_plan',
];

// The money-moving, agent-callable Meta tools (ads-publish-stage-linkage D3 corollary).
// These spend real money and publish public claims, so they carry EXACTLY the approval
// posture: deny from a subagent, ask in the main conversation. Publishing is a human
// dashboard action.
const SPEND_MUST_MATCH = [
  'mcp__ssc__create_campaign',
  'mcp__ssc__create_adset',
  'mcp__ssc__create_ad',
  'mcp__ssc__update_budget',
];

// Tool names that MUST NOT be gated. The near-misses are adversarial: they contain
// "approve"-ish or "create_ad"-ish substrings but are not the gated verb, and an
// over-broad matcher would wrongly block or prompt on them.
const MUST_NOT_MATCH = [
  'mcp__ssc__edit', // every non-promotion mutation, incl. demotion (server-gated, not hook-gated)
  'mcp__ssc__delete',
  'mcp__ssc__save_content',
  'mcp__ssc__get_idea',
  'mcp__ssc__approval_status', // near-miss: "approval", not "approve"
  'mcp__ssc__approved_thing', // near-miss: "approved" — the `(_|$)` tail must reject this
  'mcp__ssc__disapprove', // near-miss: "approve" present, but not as the verb
  'mcp__other__approve', // near-miss: right verb, wrong MCP server
  'mcp__ssc__get_ad_performance', // near-miss: reads ad data, spends nothing
  'mcp__ssc__save_ad_plan_slots', // near-miss: planning row, not a Meta create
  'mcp__ssc__create_adset_template', // near-miss: the `$` tail must reject this
  'mcp__other__create_ad', // near-miss: right verb, wrong MCP server
];

test('approval-gate.mjs APPROVAL_TOOL gates every approval verb', () => {
  const re = readHookRegex();
  for (const tool of MUST_MATCH) {
    assert.ok(re.test(tool), `APPROVAL_TOOL must match ${tool} (default-allow: a miss = silently ALLOWED)`);
  }
});

test('approval-gate.mjs APPROVAL_TOOL does not gate non-approval tools', () => {
  const re = readHookRegex();
  for (const tool of MUST_NOT_MATCH) {
    assert.ok(!re.test(tool), `APPROVAL_TOOL must NOT match ${tool}`);
  }
});

test('hooks.json matcher invokes the hook for every approval verb', () => {
  const re = readHooksJsonMatcher();
  for (const tool of MUST_MATCH) {
    assert.ok(re.test(tool), `hooks.json matcher must match ${tool} — otherwise the hook never even runs`);
  }
});

test('hooks.json matcher does not invoke the hook for non-approval tools', () => {
  const re = readHooksJsonMatcher();
  for (const tool of MUST_NOT_MATCH) {
    assert.ok(!re.test(tool), `hooks.json matcher must NOT match ${tool}`);
  }
});

test('approval-gate.mjs SPEND_TOOL gates every money-moving Meta tool', () => {
  const re = readSpendRegex();
  for (const tool of SPEND_MUST_MATCH) {
    assert.ok(re.test(tool), `SPEND_TOOL must match ${tool} (default-allow: a miss = silently ALLOWED)`);
  }
});

test('approval-gate.mjs SPEND_TOOL does not gate non-spending tools', () => {
  const re = readSpendRegex();
  for (const tool of [...MUST_NOT_MATCH, ...MUST_MATCH]) {
    assert.ok(!re.test(tool), `SPEND_TOOL must NOT match ${tool}`);
  }
});

test('hooks.json matcher invokes the hook for every money-moving Meta tool', () => {
  const re = readHooksJsonMatcher();
  for (const tool of SPEND_MUST_MATCH) {
    assert.ok(re.test(tool), `hooks.json matcher must match ${tool} — otherwise the hook never even runs`);
  }
});

test('hooks.json matcher and the hook regexes agree on every tool name', () => {
  // They are independently-written patterns guarding one decision. If they ever
  // disagree, the narrower one silently wins and the gate is not what it reads like.
  const hookRe = readHookRegex();
  const spendRe = readSpendRegex();
  const jsonRe = readHooksJsonMatcher();
  for (const tool of [...MUST_MATCH, ...SPEND_MUST_MATCH, ...MUST_NOT_MATCH]) {
    assert.equal(
      jsonRe.test(tool),
      hookRe.test(tool) || spendRe.test(tool),
      `hooks.json matcher and the hook regexes disagree on ${tool} — ` +
        `hooks.json decides whether the hook runs, so the stricter .mjs regex would never be consulted`,
    );
  }
});

// ---------------------------------------------------------------------------
// End-to-end: run the hook as the harness runs it (payload on stdin) and assert
// the DECISION, not just the pattern. A regex can match while the branch below
// it emits the wrong posture.
// ---------------------------------------------------------------------------

test('money-moving tools are DENIED from a subagent', () => {
  for (const tool of SPEND_MUST_MATCH) {
    const { decision, reason } = runHook({ tool_name: tool, agent_id: 'ssc-ads-agent' });
    assert.equal(decision, 'deny', `${tool} from a subagent must be denied, got ${decision}`);
    assert.match(reason ?? '', /money/i, `${tool} deny reason must say these spend real money`);
    assert.match(reason ?? '', /dashboard/i, `${tool} deny reason must point at the dashboard`);
  }
});

test('money-moving tools ASK in the main operator conversation', () => {
  for (const tool of SPEND_MUST_MATCH) {
    const { decision, reason } = runHook({ tool_name: tool });
    assert.equal(decision, 'ask', `${tool} in the main conversation must ask, got ${decision}`);
    assert.match(reason ?? '', /money/i, `${tool} ask reason must say these spend real money`);
  }
});

test('the approval posture is unchanged by the spend branch', () => {
  assert.equal(runHook({ tool_name: 'mcp__ssc__approve', agent_id: 'ssc-post-agent' }).decision, 'deny');
  assert.equal(runHook({ tool_name: 'mcp__ssc__approve' }).decision, 'ask');
});

test('non-gated tools are deferred (no decision emitted)', () => {
  for (const tool of MUST_NOT_MATCH) {
    assert.equal(runHook({ tool_name: tool }).decision, null, `${tool} must fall through to normal permission flow`);
  }
});
