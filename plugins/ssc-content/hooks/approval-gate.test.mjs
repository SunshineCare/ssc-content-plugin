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

const HOOK_SRC = new URL('./approval-gate.mjs', import.meta.url);
const HOOKS_JSON = new URL('./hooks.json', import.meta.url);

/** Extract the live `APPROVAL_TOOL` regex literal from approval-gate.mjs. */
function readHookRegex() {
  const src = readFileSync(HOOK_SRC, 'utf8');
  const m = src.match(/^const APPROVAL_TOOL = \/(.*)\/([a-z]*);$/m);
  assert.ok(
    m,
    'could not find `const APPROVAL_TOOL = /.../;` in approval-gate.mjs — ' +
      'the hook was restructured; update this extractor rather than hardcoding the pattern.',
  );
  return new RegExp(m[1], m[2]);
}

/** Extract the live PreToolUse matcher that gates whether the hook runs at all. */
function readHooksJsonMatcher() {
  const cfg = JSON.parse(readFileSync(HOOKS_JSON, 'utf8'));
  const entries = cfg.hooks?.PreToolUse ?? [];
  const entry = entries.find((e) =>
    e.hooks?.some((h) => typeof h.command === 'string' && h.command.includes('approval-gate.mjs')),
  );
  assert.ok(entry, 'no PreToolUse entry in hooks.json wires up approval-gate.mjs');
  assert.equal(typeof entry.matcher, 'string', 'the approval-gate PreToolUse entry has no string matcher');
  return new RegExp(entry.matcher);
}

// Tool names that MUST be gated (hook invoked -> deny for subagents / ask in main).
const MUST_MATCH = [
  'mcp__ssc__approve', // the generic verb — the ONLY gated promotion
  'mcp__ssc__unapprove',
  'mcp__ssc__approve_content',
  'mcp__ssc__approve_idea',
  'mcp__ssc__unapprove_channel_plan',
];

// Tool names that MUST NOT be gated. The last four are adversarial near-misses:
// they contain "approve"-ish substrings but are not the approval verb, and an
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

test('hooks.json matcher and APPROVAL_TOOL agree on every tool name', () => {
  // They are two independently-written patterns guarding one decision. If they ever
  // disagree, the narrower one silently wins and the gate is not what it reads like.
  const hookRe = readHookRegex();
  const jsonRe = readHooksJsonMatcher();
  for (const tool of [...MUST_MATCH, ...MUST_NOT_MATCH]) {
    assert.equal(
      jsonRe.test(tool),
      hookRe.test(tool),
      `hooks.json matcher and APPROVAL_TOOL disagree on ${tool} — ` +
        `hooks.json decides whether the hook runs, so the stricter .mjs regex would never be consulted`,
    );
  }
});
