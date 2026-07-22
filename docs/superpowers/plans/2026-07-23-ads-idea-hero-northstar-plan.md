# Idea `hero` — north-star anchor for ad-brief and ad-produce — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `hero` field to Brand OS ideas — a single Vietnamese sentence naming the concrete
product/feature/pain-point this idea is essentially about — that `ssc-ads-brief` defines before
creating angles and both `ssc-ads-brief` and `ssc-ads-writer` bind their output to.

**Architecture:** A new nullable `ideas.hero` column, writable only through the existing narrow
`update_idea` tool (title/score/comment today) and readable through the existing `get_idea` /
`get_brief` read path (no new tool). Two downstream skill files in `ssc-content-plugin` read and
write it via that surface.

**Tech Stack:** Server — TypeScript, Drizzle ORM, Zod, Vitest (DB-bound integration tests against
a real local Postgres). Plugin — Markdown skill prose (no build, no test harness).

**Spec:** `docs/superpowers/specs/2026-07-23-ads-idea-hero-northstar-design.md`

## Global Constraints

- **`content` repo commits ONLY on explicit operator request.** That repo's CLAUDE.md: "Commit by
  request only — never auto-commit... this repo auto-pushes `master`, so every commit publishes
  immediately." Every Part 1 task below ends by **staging** changes (`git add`), never committing.
  Part 1 closes with a single explicit gate task (Task 5) that commits only after the operator
  says so.
- **`content`'s DB-bound tests need a real local Postgres.** Run them with
  `DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os'` (same convention
  `idea_tools.test.ts`'s own header documents). If that DB isn't reachable, stop and tell the
  operator rather than guessing at a different connection string.
- **`ssc-content-plugin` has no test harness** — Part 2 tasks are direct, exact prose edits to
  `SKILL.md` files, verified by re-reading the result for internal consistency (no `pytest`/`vitest`
  equivalent exists here). Commit each task normally, per this repo's established per-change
  commit cadence — but per the platform-wide rule ("only commit when requested"), the actual
  `git commit` in each Part 2 task still assumes the operator has asked this plan to run to
  completion; if executing task-by-task with review checkpoints (subagent-driven-development),
  hold each commit for the reviewing session's go-ahead exactly as this session has been doing.
- **Deploying the `content` backend is OUT OF SCOPE for this plan.** After Task 5's commit, the
  operator deploys separately per `content/CLAUDE.md`'s documented path (local `docker build` +
  push + config-repo image bump → ArgoCD) and applies the migration to the deployed `brand_os`
  Postgres BEFORE that deploy lands — "No automated schema migration" is a hard rule in that repo.
  Nothing in this plan does that automatically.
- All file paths below are absolute where they cross repos; commands assume the stated `cwd`.

---

## Part 1 — `content` repo (server)

### Task 1: Add the `hero` column — schema + migration

**Files:**
- Modify: `/Users/thang/dev/ssc/content/mcp-server/db/schema/creative.ts:25-55` (the `ideas` pgTable)
- Create: `/Users/thang/dev/ssc/content/mcp-server/db/migrations/2026-07-23-idea-hero.sql`

**Interfaces:**
- Produces: a `hero: text | null` column on `ideas`, and the Drizzle field `ideas.hero` other
  tasks select/patch by.

No test for this task — a bare `ALTER TABLE` has no independent unit-test surface in this
codebase's convention (existing migrations under `db/migrations/` don't carry one either). It is
exercised indirectly by Tasks 2–4's DB-bound tests, which is why the migration must be applied to
the local dev DB before those tasks' tests can pass.

- [ ] **Step 1: Add the column to the Drizzle schema**

In `db/schema/creative.ts`, inside `export const ideas = pgTable('ideas', { ... })`, add `hero`
right after `comment`:

```typescript
  // Short rating rationale (free text, nullable) — e.g. "strong post-Tết hook,
  // clear persona fit". Set at create and revisable when re-rating.
  comment: text('comment'),
  // The idea's north-star anchor (idea-hero-northstar design, 2026-07-23): one
  // free Vietnamese sentence naming the single concrete product/feature/
  // pain-point this idea is essentially about. NULL until `ssc-ads-brief`
  // defines it (its Step 1a, before any angle is created). Idea-wide, not
  // per-angle — distinct from `briefs.core_message`, which is angle-scoped.
  // Written only via the `update_idea` tool/repo fn; never set at idea
  // creation (`save_idea`).
  hero: text('hero'),
  source: text('source'), // ai | manual
```

- [ ] **Step 2: Write the migration file**

Create `db/migrations/2026-07-23-idea-hero.sql`:

```sql
ALTER TABLE ideas ADD COLUMN hero text;
```

- [ ] **Step 3: Apply the migration to the local dev DB**

```bash
cd /Users/thang/dev/ssc/content/mcp-server
psql 'postgres://app:app@localhost:5432/brand_os' -f db/migrations/2026-07-23-idea-hero.sql
```

Expected: `ALTER TABLE`. If this fails to connect, STOP and confirm the operator's local
`brand_os` Postgres connection details rather than guessing.

- [ ] **Step 4: Type-check**

```bash
cd /Users/thang/dev/ssc/content/mcp-server
pnpm type-check
```

Expected: no new errors (the `hero` field is additive and optional everywhere it's used so far —
nothing else references it yet).

- [ ] **Step 5: Stage (do NOT commit)**

```bash
cd /Users/thang/dev/ssc/content
git add mcp-server/db/schema/creative.ts mcp-server/db/migrations/2026-07-23-idea-hero.sql
git status
```

---

### Task 2: `update_idea` accepts and persists `hero`

**Files:**
- Modify: `/Users/thang/dev/ssc/content/mcp-server/lib/brandos/repo/idea.ts:505-518` (`UpdateIdeaFields` + `EDITABLE_IDEA_COLUMNS`)
- Modify: `/Users/thang/dev/ssc/content/mcp-server/lib/brandos/tools/idea_tools.ts:113-175` (`update_idea` tool)
- Test: `/Users/thang/dev/ssc/content/mcp-server/lib/brandos/tools/idea_tools.test.ts`

**Interfaces:**
- Consumes: `UpdateIdeaFields` (existing type, from Task 1's new column).
- Produces: `update_idea({ id, expected_version, hero })` — patches `ideas.hero`, leaves every
  other field untouched, same optimistic-concurrency contract as `title`/`score`/`comment`.

- [ ] **Step 1: Write the failing test**

Add to `idea_tools.test.ts`, inside the existing `describe('update_idea (cap edit) — generic
partial-patch', ...)` block (after the `'patches only the field provided (title)...'` test):

```typescript
  it('patches hero, leaving title/comment untouched', async () => {
    const { id, version } = await makeIdea({ title: 'orig title', comment: 'orig comment' });
    const updateIdeaTool = getUpdateIdeaTool(editor);

    const res = await updateIdeaTool({
      id,
      expected_version: version,
      hero: 'chuyên viên 1:1 nhắn tin chủ động khi cần điều chỉnh',
    });

    expect(res.structuredContent).toMatchObject({ id, version: version + 1 });

    const [row] = await db.select().from(ideas).where(eq(ideas.id, id));
    expect(row.hero).toBe('chuyên viên 1:1 nhắn tin chủ động khi cần điều chỉnh');
    expect(row.title).toBe('orig title');
    expect(row.comment).toBe('orig comment');
  });

  it('accepts hero through the real zod inputSchema (not stripped)', async () => {
    const { id, version } = await makeIdea();
    const updateIdeaTool = getUpdateIdeaToolThroughSchema(editor);

    await updateIdeaTool({ id, expected_version: version, hero: 'app theo dõi hằng ngày' });

    const [row] = await db.select().from(ideas).where(eq(ideas.id, id));
    expect(row.hero).toBe('app theo dõi hằng ngày');
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
cd /Users/thang/dev/ssc/content/mcp-server
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run lib/brandos/tools/idea_tools.test.ts -t hero
```

Expected: FAIL — `hero` is stripped by the zod schema (second test) and/or `row.hero` is
`undefined`/unset (first test), since neither `UpdateIdeaFields` nor the tool schema accepts it
yet.

- [ ] **Step 3: Add `hero` to the repo layer**

In `repo/idea.ts`, extend `UpdateIdeaFields` and `EDITABLE_IDEA_COLUMNS`:

```typescript
export interface UpdateIdeaFields {
  title?: string;
  score?: number | null;
  comment?: string | null;
  track?: string | null;
  confidence?: string | null;
  hero?: string | null;
}

const EDITABLE_IDEA_COLUMNS = [
  'title',
  'comment',
  'track',
  'confidence',
  'hero',
] as const;
```

(`updateIdea`'s existing loop over `EDITABLE_IDEA_COLUMNS` picks this up with no further change —
it already copies any whitelisted key present in `fields` into the patch.)

- [ ] **Step 4: Add `hero` to the `update_idea` tool**

In `idea_tools.ts`, extend the `inputSchema`:

```typescript
      inputSchema: {
        id: z.string(),
        expected_version: z.number().int(),
        title: z.string().optional(),
        score: z.number().optional(),
        comment: z.string().optional(),
        hero: z.string().optional(),
        // Declared ONLY so a caller sending them is rejected loudly (see below).
```

and the handler's `fields` construction:

```typescript
      const fields: UpdateIdeaFields = {
        ...(input.title !== undefined ? { title: input.title as string } : {}),
        ...(input.score !== undefined ? { score: input.score as number } : {}),
        ...(input.comment !== undefined ? { comment: input.comment as string } : {}),
        ...(input.hero !== undefined ? { hero: input.hero as string } : {}),
      };
```

and update the tool `description` string to add `, \`hero\`` after `` `comment` `` in the "Accepts
any of" sentence.

- [ ] **Step 5: Run the tests to verify they pass**

```bash
cd /Users/thang/dev/ssc/content/mcp-server
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run lib/brandos/tools/idea_tools.test.ts
```

Expected: PASS (all tests in the file, not just the new ones — confirms no regression).

- [ ] **Step 6: Stage (do NOT commit)**

```bash
cd /Users/thang/dev/ssc/content
git add mcp-server/lib/brandos/repo/idea.ts mcp-server/lib/brandos/tools/idea_tools.ts \
  mcp-server/lib/brandos/tools/idea_tools.test.ts
```

---

### Task 3: `get_idea` returns `hero`

**Files:**
- Modify: `/Users/thang/dev/ssc/content/mcp-server/lib/brandos/read/ideas.ts` (`IdeaDetailRow` interface + `getIdea`'s `select`)
- Test: `/Users/thang/dev/ssc/content/mcp-server/lib/brandos/tools/idea_tools.test.ts`

**Interfaces:**
- Consumes: `ideas.hero` (Task 1).
- Produces: `IdeaDetailRow.hero: string | null`, returned by both the `get_idea` tool and
  `getBrief`'s `idea` sub-object (which calls `getIdea` internally — no separate change needed
  there, verified in Task 4).

- [ ] **Step 1: Write the failing test**

Add to `idea_tools.test.ts` (a new `describe` block, since no test currently names `get_idea`):

```typescript
function getGetIdeaTool(auth: AuthContext): ToolHandler {
  const { server, handlers } = fakeServer();
  registerIdeaTools(server, auth);
  const handler = handlers.get('get_idea');
  if (!handler) throw new Error('get_idea not registered');
  return handler;
}

describe('get_idea (cap view) — returns hero', () => {
  it('returns hero when set, null when not', async () => {
    const { id } = await makeIdea();
    const getIdeaTool = getGetIdeaTool(editor);

    const before = await getIdeaTool({ id });
    expect(before.structuredContent.hero).toBeNull();

    await db.update(ideas).set({ hero: 'nỗi sợ chọn sai lần nữa' }).where(eq(ideas.id, id));

    const after = await getIdeaTool({ id });
    expect(after.structuredContent.hero).toBe('nỗi sợ chọn sai lần nữa');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd /Users/thang/dev/ssc/content/mcp-server
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run lib/brandos/tools/idea_tools.test.ts -t "get_idea"
```

Expected: FAIL — `structuredContent.hero` is `undefined` (not selected yet).

- [ ] **Step 3: Add `hero` to the read path**

In `read/ideas.ts`, extend `IdeaDetailRow`:

```typescript
export interface IdeaDetailRow {
  id: string;
  channel: string;
  title: string | null;
  status: string;
  score: string | null;
  comment: string | null;
  hero: string | null;
  source: string | null;
```

and `getIdea`'s `select({...})`:

```typescript
      title: ideas.title,
      status: ideas.status,
      score: sql<string | null>`${ideas.score}::text`,
      comment: ideas.comment,
      hero: ideas.hero,
      source: ideas.source,
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd /Users/thang/dev/ssc/content/mcp-server
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run lib/brandos/tools/idea_tools.test.ts
```

Expected: PASS (whole file).

- [ ] **Step 5: Stage (do NOT commit)**

```bash
cd /Users/thang/dev/ssc/content
git add mcp-server/lib/brandos/read/ideas.ts mcp-server/lib/brandos/tools/idea_tools.test.ts
```

---

### Task 4: `get_brief`'s returned idea includes `hero`

**Files:**
- Test only: `/Users/thang/dev/ssc/content/mcp-server/lib/brandos/tools/brief_tools.test.ts`

No production code change — `getBrief` (`read/ideas.ts:211-221`) already calls
`getIdea(brief.idea_id)` internally, so Task 3's change flows through automatically. This task is
a regression test proving that end-to-end, since it's the actual path `ssc-ads-brief` and
`ssc-ads-writer` (via `get_brief`) will read `hero` from.

**Interfaces:**
- Consumes: `getIdea` (Task 3).
- Produces: nothing new — confirms `get_brief`'s `idea.hero` is populated.

- [ ] **Step 1: Write the failing test**

Add to `brief_tools.test.ts`, inside `describe('get_brief (cap view) — one brief by id, with its
idea', ...)`, after the existing `'returns the brief (snake_case) AND its idea...'` test:

```typescript
  it("includes the idea's hero when set", async () => {
    const ideaId = await seedIdea();
    await db.update(ideas).set({ hero: 'app theo dõi hằng ngày' }).where(eq(ideas.id, ideaId));
    const brief = await seedBrief(ideaId);

    const get = getTool(approver, 'get_brief');
    const res = await get({ id: brief.id });

    expect(res.structuredContent.idea.hero).toBe('app theo dõi hằng ngày');
  });
```

(`ideas` and `eq` must be imported in this file already, given `seedIdea`/`seedBrief` use them —
confirm the existing imports cover both before adding the test; add them if missing.)

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd /Users/thang/dev/ssc/content/mcp-server
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run lib/brandos/tools/brief_tools.test.ts -t "includes the idea's hero"
```

Expected: FAIL before Task 3 lands, PASS after — if this task is done after Task 3 as ordered,
it should already PASS on the first run with no production code change. Run it anyway to prove
the claim rather than assume it.

- [ ] **Step 3: Confirm it passes (no code change expected)**

```bash
cd /Users/thang/dev/ssc/content/mcp-server
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run lib/brandos/tools/brief_tools.test.ts
```

Expected: PASS (whole file). If it does NOT pass, `getBrief` does not actually delegate to
`getIdea` the way Task 1–3 assumed — stop and re-examine `read/ideas.ts:211-221` before
proceeding; do not patch around it blindly.

- [ ] **Step 4: Stage (do NOT commit)**

```bash
cd /Users/thang/dev/ssc/content
git add mcp-server/lib/brandos/tools/brief_tools.test.ts
```

---

### Task 5: Commit gate (explicit operator go-ahead required)

**Files:** none (process step only).

- [ ] **Step 1: Show the operator the full staged diff**

```bash
cd /Users/thang/dev/ssc/content
git status
git diff --stat --cached
```

- [ ] **Step 2: STOP. Do not run `git commit` until the operator explicitly says to.**

This repo auto-pushes `master` on commit — there is no draft/review state after committing.
Once the operator confirms, commit with a message describing the `hero` column + `update_idea`/
`get_idea` support, then report back that the `content` repo still needs its own separate deploy
(docker build/push + config-repo bump) and the migration applied to the deployed `brand_os`
before Part 2's skill changes are live-verifiable — neither of those is part of this plan.

---

## Part 2 — `ssc-content-plugin` repo (skills)

No test harness exists for this repo's skill prose (`ssc-content-plugin/CLAUDE.md`: "There is no
automated test suite yet"). Each task below is a direct, exact prose edit; "verification" means
re-reading the edited section for internal consistency (no field/step reference left dangling),
the same way the layer→CTA revision earlier this session was verified.

### Task 6: `ssc-ads-brief` — resolve/define/revise hero, bind fields to it

**Files:**
- Modify: `plugins/ssc/skills/ssc-ads-brief/SKILL.md`

**Interfaces:**
- Consumes: `update_idea` (Task 2, once deployed), `idea.hero` via `get_idea`/the Step 1 `get_idea`
  call this skill already makes (Task 3, once deployed).
- Produces: every angle brief this skill saves is now bound to `idea.hero` as a fourth anchor,
  alongside persona/route/awareness_stage/layer.

- [ ] **Step 1: Add `update_idea` to the frontmatter `tools:` list**

`tools: [get_idea, get_channel_plan, get_knowledge, list_taxonomies, list_briefs, save_brief]` →
add `update_idea`.

- [ ] **Step 2: Add the `revise hero:` input**

In the `## Inputs` section, add a new optional entry:

```markdown
Optional (hero revision):

- a trailing `revise hero: <note>` instruction — recognized as free text, not a rigid flag
  (mirrors the `revise:`/`rewrite` convention `ssc-image-prompt-*` already uses). Present only
  when the operator explicitly wants to change an idea's already-defined hero; absent otherwise.
```

- [ ] **Step 3: Hold `idea.version` in Step 1 — Step 1a's `update_idea` call needs it**

Step 1's existing "Hold:" list (`idea.id` / `idea.title` / `idea.plan_id`) does not currently hold
the idea's `version` — nothing needed it before. Add a new bullet immediately after the existing
`idea.plan_id` one:

```markdown
- `idea.plan_id` — held for Step 1b's period derivation context only (`get_channel_plan` still takes `channel` + `period`, not a plan id).
- `idea.version` — held for Step 1a's `update_idea` call (optimistic-concurrency `expected_version`). Step 1a calls `update_idea` at most once per run, so this held value is never stale by the time it's used.
```

- [ ] **Step 4: Insert new Step 1a, between Step 1 and Step 1b**

```markdown
### Step 1a: Resolve or define the idea's hero — the north star

Every angle this run creates must stay recognizably about ONE thing: the idea's **hero** — a
single Vietnamese sentence naming the concrete product/feature/pain-point this idea is
essentially about. Resolve it BEFORE Step 1b, from the idea object already held from Step 1:

- **A `revise hero: <note>` instruction was given.** Derive a NEW hero, informed by the note and
  grounded in `idea.title` alone (never fabricated beyond what the title supports — same rule as
  every other narrative field in this skill). Call `update_idea(id, expected_version, hero=<new>)`
  (`expected_version` is the idea's own `version`, held from Step 1). Hold both the OLD hero text
  (what `idea.hero` was before this call) and the NEW one for the Step 7 summary.
- **`idea.hero` is empty and no revise was given.** Derive one now, the same way (distilled from
  `idea.title` alone), and `update_idea(...)` to persist it BEFORE any angle is created in Step 3.
  Hold it for Step 7.
- **`idea.hero` is already set and no revise was given.** Read-only — hold the existing value,
  make no write.

**When this step just wrote a hero** (either branch above), also note which of this idea's
EXISTING briefs (from the Step 2 `list_briefs` read — reuse it, do not call it again here) were
created before this write: they were derived under a different (or no) hero. Never edit, re-score,
or block them — Step 7 just names them so the operator can judge whether to re-brief.

Hold the resolved `hero` text forward — every angle's narrative fields (Step 4) and every copy
variation downstream (`ssc-ads-writer`) must stay faithful to it.
```

- [ ] **Step 5: Extend the Step 4 "must strictly follow" paragraph**

Find the paragraph beginning "**Every field below must strictly follow — never contradict — the
decisions already made for this angle: its persona (Step 1d), its diagnosed route /
`awareness_stage` / layer (Step 3), and its own `angle_label`.**" and extend it to a fifth anchor:

```markdown
**Every field below must strictly follow — never contradict — the decisions already made for
this angle: its persona (Step 1d), its diagnosed route / `awareness_stage` / layer (Step 3), its
own `angle_label`, and the idea's own `hero` (Step 1a).** [...existing sentence about route/stage
continues unchanged...] `hero` binds every angle derived from this idea alike — it is idea-wide,
not re-decided per angle — so a `core_message` that centers a different product/feature/pain-point
than the idea's hero names is exactly the same class of defect as one that centers the wrong
route or stage.
```

(Keep the rest of that paragraph's existing sentences about route/stage/label intact; this only
adds the `hero` clause.)

- [ ] **Step 6: Extend Step 5's "Decision fidelity" scoring criterion**

Find: `- **Decision fidelity** — do \`hook_direction\` / \`core_message\` / \`why_now\` plainly
read as the SAME route, stage, and anchor Step 3 diagnosed and Step 4 was supposed to write to —
and does \`angle_label\` name that same anchor?` and extend it:

```markdown
- **Decision fidelity** — do `hook_direction` / `core_message` / `why_now` plainly read as the
  SAME route, stage, and anchor Step 3 diagnosed and Step 4 was supposed to write to — does
  `angle_label` name that same anchor — and does the angle stay recognizably about the idea's own
  `hero` (Step 1a)? A field that quietly drifts to a different route/stage/anchor/hero than what
  was decided caps low here even if the drift reads well on its own.
```

- [ ] **Step 7: Extend the Step 7 summary template**

In the "otherwise, after appending" summary template, add a line (after the existing "Taken set"
line) that appears only when Step 1a wrote a hero this run:

```markdown
**Hero:** <the resolved hero text> — <"newly defined this run" | "revised this run (was: <old
hero text>)" | "already set, unchanged">. <If newly defined or revised:> existing briefs on this
idea predating it: <list angle_labels, or "none">.
```

- [ ] **Step 8: Extend Governance**

Add a new hard-rule bullet:

```markdown
- **Hero is idea-wide, defined once then read-only unless explicitly revised (hard rule).**
  `idea.hero` is resolved in Step 1a: derived from `idea.title` alone (never fabricated further)
  when empty, persisted via `update_idea` before any angle is created, and left untouched on
  every later run unless the operator gives an explicit `revise hero:` instruction. A revision
  never edits, re-scores, or blocks existing briefs/copy — Step 7 only discloses which existing
  briefs predate the current hero. Every angle's narrative fields (Step 4) and `angle_label` must
  stay faithful to it (Step 5's Decision fidelity criterion).
```

- [ ] **Step 9: Re-read the full file for internal consistency**

Confirm: `update_idea` appears in both the frontmatter `tools:` list and is actually called
somewhere in prose (Step 1a); every reference to "the angle's decisions" elsewhere in the file
that lists persona/route/awareness_stage/layer is either left as-is (still correct on its own
terms) or, where it would now read as an incomplete list next to the new Step 4 paragraph, is
consistent rather than contradictory. Do not mechanically add "hero" to every such list — only
where the design calls for it (Step 4, Step 5, Governance, Step 7 summary).

- [ ] **Step 10: Commit**

```bash
git add plugins/ssc/skills/ssc-ads-brief/SKILL.md
git commit -m "$(cat <<'EOF'
feat(ads-brief): define idea hero before angles, bind fields to it

ssc-ads-brief now resolves or defines each idea's hero (a single
Vietnamese north-star sentence, distilled from idea.title) before
creating any angle, via the new update_idea(hero=...) surface, and every
angle's narrative fields must stay faithful to it (revisable on explicit
operator request; a revision never touches existing briefs, only
discloses them).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `ssc-ads-writer` — read hero as a direct anchor, gate copy on it

**Files:**
- Modify: `plugins/ssc/skills/ssc-ads-writer/SKILL.md`

**Interfaces:**
- Consumes: `idea.hero`, already returned on the `idea` object `get_brief` gives this skill in
  Step 1 (Task 4, once deployed) — no new tool call needed.
- Produces: a new Step 7 hard-cap check gating every `copy` variation on hero fidelity.

- [ ] **Step 1: Hold `idea.hero` in Step 1c ("Confirm the angle anchor")**

Find the paragraph starting "The chosen angle brief — its `id`, `angle_label`, and five narrative
fields... — is already in hand from `get_brief` (Step 1), gated approved. It is the angle anchor
for every section this run..." and extend it:

```markdown
The chosen angle brief — its `id`, `angle_label`, and five narrative fields (`hook_direction` /
`core_message` / `why_now` / `story_moment` / `cta`) — is already in hand from `get_brief` (Step
1), gated approved. **So is the idea's own `hero`** — the same `get_brief` call's `idea` object
carries it (`idea.hero`, possibly `null` on an idea predating this field). Both are the angle
anchor for every section this run: `copy` is grounded in only this brief AND must stay faithful
to the idea's hero when one is set; `headline`/`description`/`image_content` lead from the
approved copy while holding the same brief and hero as anchors. Use only this brief; never pool
across the idea's other briefs. A `null` hero (legacy idea) is not an error — proceed on the
brief's own fields alone and don't fabricate a hero to fill the gap.
```

- [ ] **Step 2: Extend the Step 6 `copy` bullet's fidelity clause**

Find the sentence added in the prior revision: "**Every variation's hook must trace to THIS
brief's own `hook_direction` and core message must trace to its `core_message`** — not a fresh
take on the subject and not a different angle that happens to fit the same persona. If a drafted
line would fit a *different* trigger/objection/myth than the one `hook_direction`/`core_message`
names, rewrite it to match the brief, never the other way round." and extend it:

```markdown
**Every variation's hook must trace to THIS brief's own `hook_direction` and core message must
trace to its `core_message`, and — when `idea.hero` is set — the variation must stay recognizably
about that same hero** — not a fresh take on the subject, not a different angle that happens to
fit the same persona, and not a different product/feature/pain-point than the idea's hero names.
If a drafted line would fit a *different* trigger/objection/myth than the one
`hook_direction`/`core_message` names, or would center a different concrete thing than `idea.hero`
names, rewrite it to match the brief and the hero — never the other way round.
```

- [ ] **Step 3: Add Step 7 check (a4) — Hero fidelity**

Immediately after the existing **(a3) Layer-compliant CTA check** block, add:

```markdown
**(a4) Hero fidelity check (`copy` only, skip when `idea.hero` is null)** — the variation must
stay recognizably about the idea's `hero` (Step 1c) — the same concrete product/feature/
pain-point, not a different one that happens to fit the brief's persona/route. **Any** violation
caps that variation at **≤3** — same weight as the layer-CTA check (a3): defense-in-depth,
mirroring the existing double-gated `Tránh` check (brief-direction gate in `ssc-ads-brief` +
finished-sentence gate here) — a hero-faithful brief does not guarantee hero-faithful copy, since
drift can enter at the writing step. Name the hero text in the `comment` when you cap one.
```

- [ ] **Step 4: Extend the frontmatter description**

Find the clause added in the prior revision ("...tuning CTA + overall tone to the angle's
declared campaign layer per ad/creative-guidelines' Angle≠Layer split...") and add, immediately
after it:

```markdown
, and staying faithful to the idea's own `hero` when one is set (a single north-star sentence
`ssc-ads-brief` defines before any angle exists, read directly off the `idea` object `get_brief`
returns — never fabricated, never re-derived)
```

- [ ] **Step 5: Extend Governance**

Add a new hard-rule bullet, after the "Layer decides CTA + tone; angle decides hook + body" bullet
added in the prior revision:

```markdown
- **Copy also stays faithful to the idea's `hero`, when one is set (hard rule, defense-in-depth).**
  `idea.hero` (Step 1c) is a second, idea-wide anchor alongside the brief's own `hook_direction`/
  `core_message` — set once by `ssc-ads-brief` before any angle exists, revisable only there, never
  by this skill. A `null` hero (a legacy idea) is not an error; proceed on the brief's fields alone.
  Any `copy` variation that drifts to a different product/feature/pain-point than the hero names
  caps at ≤3 (Step 7(a4)), mirroring the same double-gate pattern already used for the persona
  `Tránh` list.
```

- [ ] **Step 6: Re-read the full file for internal consistency**

Confirm the (a3)/(a4) numbering reads correctly in sequence, the frontmatter description clause
doesn't duplicate the Step 1c prose verbatim (paraphrase is fine, contradiction is not), and no
other place in the file claims copy is grounded "only" in the brief's five narrative fields
without qualification (the "only" framing predates this change — where it appears, either it
still holds for that specific claim, e.g. brief-vs-approved-copy divergence handling, which is
unrelated to hero, or it needs the same "and the idea's hero" qualifier added).

- [ ] **Step 7: Commit**

```bash
git add plugins/ssc/skills/ssc-ads-writer/SKILL.md
git commit -m "$(cat <<'EOF'
feat(ads-writer): bind copy to the idea's hero, defense-in-depth

Reads idea.hero (now returned by get_brief once the server change ships)
as a second anchor alongside the brief's own hook_direction/core_message,
and adds a Step 7 hard-cap check (a4) so a copy variation that drifts to
a different product/feature/pain-point than the idea's hero cannot score
≥4 — mirrors the existing double-gated Tránh check pattern.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## After this plan

1. **Deploy `content`'s backend** (docker build/push + config-repo image bump → ArgoCD) per
   `content/CLAUDE.md`'s documented path, applying the `2026-07-23-idea-hero.sql` migration to the
   deployed `brand_os` Postgres BEFORE the new code ships (that repo's own hard rule).
2. Only after that deploy is live can `ssc-ads-brief`/`ssc-ads-writer` actually exercise
   `update_idea(hero=...)` and see `hero` come back through `get_brief` for real — verify with one
   live run of `/ssc.ads-brief <idea_id>` on an idea with no hero yet, confirming Step 1a's
   summary line appears and a subsequent `/ssc.ads-produce <brief_id>` run's copy references it.
3. Neither of the above is a task in this plan — both are manual, operator-driven steps.
