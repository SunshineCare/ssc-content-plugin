#!/usr/bin/env node
// build-chatgpt-bundle.mjs — compile the plugin's prose into ONE JSON bundle the
// BrandOS MCP server can serve to ChatGPT.
//
// WHY this exists. The 11 `/ssc-*` workflows are prose: commands dispatch
// agents, agents orchestrate skills, and Claude Code is what loads all three.
// ChatGPT has none of that machinery — no slash commands, no subagents, and it
// does not surface MCP prompts. Its only channel is TOOLS. So the prose has to
// travel to ChatGPT THROUGH the MCP server, which means it has to exist as data
// first. That is this file's output.
//
// The bundle is a MIRROR, exactly like `docs/contracts/` in the parent
// workspace: this repo is the source of truth, `publish-chatgpt-bundle.sh`
// copies the artifact into the server repo, and `--check` fails when the copy
// has drifted from the prose.
//
//   node scripts/build-chatgpt-bundle.mjs             # write chatgpt/workflows.json
//   node scripts/build-chatgpt-bundle.mjs --check     # exit 1 if it is stale
//   node scripts/build-chatgpt-bundle.mjs --out PATH  # write somewhere else
//
// No dependencies: this repo has no package.json and no build step, and adding
// one for a 200-line generator would be the tail wagging the dog. The YAML
// parsed here is the SUBSET the plugin's own frontmatter uses (see `parseYaml`),
// not general YAML — an unknown construct throws rather than guessing.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN = join(REPO, 'plugins', 'ssc');
const DEFAULT_OUT = join(REPO, 'chatgpt', 'workflows.json');

// ── frontmatter ─────────────────────────────────────────────────────────────

/**
 * Parse the frontmatter subset the plugin uses:
 *
 *   key: scalar            key: 'quoted scalar'      key: [a, b, c]
 *   key: >-                (folded block — the description of most agents)
 *     line one
 *     line two
 *   metadata:              (one nested map, 2-space indented, same value forms)
 *     section: ads
 *
 * Anything else throws: a silently mis-parsed `orchestrates` would drop a
 * pipeline step from the bundle without failing anything.
 */
export function parseYaml(text) {
  const out = {};
  const lines = text.split('\n');
  let i = 0;
  const scalar = (raw) => {
    const v = raw.trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      const inner = v.slice(1, -1).trim();
      return inner === '' ? [] : inner.split(',').map((s) => unquote(s.trim()));
    }
    return unquote(v);
  };
  const unquote = (v) =>
    (v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))
      ? v.slice(1, -1).replace(/''/g, "'")
      : v;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '' || line.trimStart().startsWith('#')) { i++; continue; }
    const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!m) throw new Error(`frontmatter: cannot parse line ${i + 1}: ${line}`);
    const [, key, rest] = m;
    if (rest === '>-' || rest === '>' || rest === '|' || rest === '|-') {
      const block = [];
      i++;
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
        block.push(lines[i].trim());
        i++;
      }
      out[key] = block.join(' ').trim();
      continue;
    }
    if (rest === '') {
      // nested map (only `metadata:` uses this) — or an empty scalar.
      const nested = {};
      i++;
      while (i < lines.length && (/^\s{2}\S/.test(lines[i]) || lines[i].trim() === '')) {
        if (lines[i].trim() === '' || lines[i].trimStart().startsWith('#')) { i++; continue; }
        const nm = /^\s{2}([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
        if (!nm) throw new Error(`frontmatter: cannot parse nested line ${i + 1}: ${lines[i]}`);
        nested[nm[1]] = scalar(nm[2]);
        i++;
      }
      out[key] = nested;
      continue;
    }
    out[key] = scalar(rest);
    i++;
  }
  return out;
}

/** Split a markdown file into `{ frontmatter, body }`. */
export function splitDoc(text, label) {
  const lines = text.split('\n');
  if (lines[0] !== '---') throw new Error(`${label}: no frontmatter`);
  const close = lines.indexOf('---', 1);
  if (close === -1) throw new Error(`${label}: unterminated frontmatter`);
  return {
    frontmatter: parseYaml(lines.slice(1, close).join('\n')),
    body: lines.slice(close + 1).join('\n').trim(),
  };
}

// ── loading ─────────────────────────────────────────────────────────────────

function loadDoc(path, kind, name) {
  const { frontmatter: fm, body } = splitDoc(readFileSync(path, 'utf8'), name);
  const meta = fm.metadata ?? {};
  const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  return {
    kind,
    name: fm.name ?? name,
    description: fm.description ?? '',
    argument_hint: fm['argument-hint'] ?? undefined,
    section: meta.section ?? undefined,
    capability: meta.capability ?? undefined,
    tools: asList(meta.tools),
    orchestrates: asList(meta.orchestrates),
    dispatches: asList(meta.dispatches),
    body,
  };
}

function loadAll() {
  // Commands are keyed SEPARATELY from agents/skills: `/ssc-ads-brief` the
  // command and `ssc-ads-brief` the skill share a name by design (a thin entry
  // point named after the skill it dispatches), so one flat namespace would
  // collide and silently drop one of them.
  const commands = new Map();
  const docs = new Map();
  const put = (d) => {
    if (docs.has(d.name)) throw new Error(`duplicate document name: ${d.name}`);
    docs.set(d.name, d);
  };

  for (const f of readdirSync(join(PLUGIN, 'commands')).filter((f) => f.endsWith('.md')).sort()) {
    const name = f.replace(/\.md$/, '');
    commands.set(name, { ...loadDoc(join(PLUGIN, 'commands', f), 'command', name), name });
  }
  for (const f of readdirSync(join(PLUGIN, 'agents')).filter((f) => f.endsWith('.md')).sort()) {
    put(loadDoc(join(PLUGIN, 'agents', f), 'agent', f.replace(/\.md$/, '')));
  }
  for (const dir of readdirSync(join(PLUGIN, 'skills'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()) {
    const path = join(PLUGIN, 'skills', dir, 'SKILL.md');
    if (!existsSync(path)) throw new Error(`skill ${dir}: no SKILL.md`);
    const doc = loadDoc(path, 'skill', dir);
    // The convention CLAUDE.md states: directory name MUST match `name`.
    if (doc.name !== dir) throw new Error(`skill ${dir}: frontmatter name is '${doc.name}'`);
    put(doc);
  }
  return { commands, docs };
}

// ── the bundle ──────────────────────────────────────────────────────────────

export function buildBundle() {
  const { commands, docs } = loadAll();
  const version = JSON.parse(
    readFileSync(join(PLUGIN, '.claude-plugin', 'plugin.json'), 'utf8'),
  ).version;

  const workflows = [];
  for (const doc of commands.values()) {
    if (doc.dispatches.length !== 1) {
      throw new Error(`${doc.name}: expected exactly one metadata.dispatches entry`);
    }
    const entryName = doc.dispatches[0];
    const entry = docs.get(entryName);
    if (!entry) throw new Error(`${doc.name}: dispatches unknown document '${entryName}'`);

    // The steps a run can reach: an agent's orchestrated skills, or — for the
    // two commands that dispatch a skill directly (/ssc-ad, /ssc-ads-brief) —
    // that skill itself.
    const stepNames = entry.kind === 'agent' ? entry.orchestrates : [entry.name];
    const steps = stepNames.map((n) => {
      const s = docs.get(n);
      if (!s) throw new Error(`${entryName}: orchestrates unknown skill '${n}'`);
      return { name: s.name, description: s.description, tools: s.tools };
    });

    const tools = [...new Set([...entry.tools, ...steps.flatMap((s) => s.tools)])].sort();
    workflows.push({
      name: doc.name,
      command: `/${doc.name}`,
      argument_hint: doc.argument_hint ?? '',
      description: doc.description,
      section: doc.section ?? entry.section ?? '',
      entry: { kind: entry.kind, name: entry.name },
      steps: steps.map(({ name, description }) => ({ name, description })),
      tools,
      // The command's own body — the entry point's prose, which in Claude Code
      // is what the operator's `/ssc-*` invocation loads first.
      instructions: doc.body,
    });
  }
  workflows.sort((a, b) => a.name.localeCompare(b.name));

  const documents = {};
  for (const d of [...docs.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    documents[d.name] = {
      kind: d.kind,
      name: d.name,
      description: d.description,
      section: d.section ?? '',
      tools: d.tools,
      orchestrates: d.orchestrates,
      body: d.body,
    };
  }

  return {
    schema: 1,
    plugin: 'ssc',
    plugin_version: version,
    source: 'ssc-content-plugin/plugins/ssc',
    workflows,
    documents,
  };
}

// ── cli ─────────────────────────────────────────────────────────────────────

function main(argv) {
  const check = argv.includes('--check');
  const outFlag = argv.indexOf('--out');
  const out = outFlag === -1 ? DEFAULT_OUT : resolve(argv[outFlag + 1]);
  const json = `${JSON.stringify(buildBundle(), null, 2)}\n`;

  if (check) {
    const current = existsSync(out) ? readFileSync(out, 'utf8') : '';
    if (current !== json) {
      console.error(`STALE: ${out} does not match the prose. Run: node scripts/build-chatgpt-bundle.mjs`);
      process.exit(1);
    }
    console.log(`OK: ${out} is current.`);
    return;
  }

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, json);
  const b = JSON.parse(json);
  console.log(
    `wrote ${out} — ${b.workflows.length} workflows, ${Object.keys(b.documents).length} documents, ` +
      `${(json.length / 1024).toFixed(0)} KB (plugin ${b.plugin_version})`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
