# Ads Persona-Late — Server Contract (Expand Phase) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **⚠ Execute in the `content/mcp-server` repo** — NOT in `ssc-content-plugin` (where this plan file lives). All paths below are relative to `/Users/thang/dev/ssc/content/mcp-server/`.

**Goal:** Additively expand the BrandOS server contract so the persona-late 3-level ad model (Idea = subject; Angle/brief = persona × route + declared media home; Copy = execution) becomes representable — **without breaking any current consumer**.

**Architecture:** Pure **Expand** phase of an expand→migrate→contract rollout. We ADD: a `route` taxonomy kind; five new nullable columns on `briefs` (`persona_term_id`, `route_term_id`, `target_layer_term_id`, `audience_intent`, `awareness_stage`); a `creative_target` jsonb column on `channel_plans`; and we RELAX the `frame` governance so an `ad` idea no longer requires a frame term. We DROP nothing and reject nothing new. The destructive **Contract** phase (removing `ad_idea_details.slot_id`, the `ad_plan_slots` creative-steering columns, and dropping `'ad'` from `applies_to` for persona/value/frame/campaign_layer/tonal_register) is a **separate later plan** that runs only after the plugin skills + dashboard have migrated.

**Tech Stack:** TypeScript, Drizzle ORM (0.45.2) over a private `brand_os` Postgres, single-writer repo pattern (`lib/brandos/repo/`), MCP tools (`lib/brandos/tools/`), Vitest. Hand-written dated SQL migrations applied manually.

## Global Constraints

- **Repo:** execute in `content/mcp-server`. This plan is Expand-phase, **additive only** — no `DROP COLUMN`, no `applies_to` removal, no new rejection.
- **Design source:** `ssc-content-plugin/docs/superpowers/specs/2026-07-21-ads-layer-responsibility-persona-late-design.md` (locked decisions D1–D9, OP1/OP2 locked). Brief carries `persona_term_id` + `route_term_id` + `target_layer_term_id` + `audience_intent` + `awareness_stage`. Framing dims (`value`/`frame`/`against`/`entry`/`experience`) do **not** get a brief home — they dissolve into subject/route/execution. So this plan adds **no** `brief_terms` join.
- **Migrations are hand-written + manual.** New file per change: `db/migrations/2026-07-21-<slug>.sql`, wrapped `BEGIN; … COMMIT;`. Per `content/mcp-server` CLAUDE.md there is **no auto-migrate**: apply the SQL to the target DB **before** deploying code that needs it. Keep the Drizzle schema module (`db/schema/*.ts`) and the SQL in lockstep, plus the read-layer projection (`read/*.ts`) and the repo input interface.
- **Taxonomy changes go through the idempotent seed** (`scripts/seed-taxonomies.ts`, keyed on `(kind, code)` via `upsertTaxonomy`) — re-running the seed IS the migration for taxonomy rows.
- **Propose-only is preserved.** `save_brief` still creates `draft` only and takes no `status`. `awareness_stage` is **derived-but-stored**: written by `save_brief`, kept OUT of the `edit` allowlist so agents can't hand-set it (like a promotion field).
- **No `test`/`migrate` npm script.** Run one Vitest file directly. DB-bound tests need a local `brand_os`: `DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os'`. Type-check: `pnpm type-check`.
- **Vietnamese** is the persisted creative prose language; not relevant to these schema/tool changes but keep tool `description` strings accurate.

## File Structure

| File | Responsibility | Tasks |
|---|---|---|
| `scripts/seed-taxonomies.ts` | add `route` kind; relax `frame` governance | A, B |
| `db/schema/briefs.ts` | 5 new brief columns (Drizzle) | C |
| `db/migrations/2026-07-21-brief-angle-fields.sql` | brief columns DDL | C |
| `lib/brandos/repo/brief.ts` | `SaveBriefInput` + `saveBrief` insert map; `BriefPatch` | C, E |
| `lib/brandos/read/ideas.ts` | `IdeaBrief` type + `briefRowColumns` projection | D |
| `lib/brandos/tools/brief_tools.ts` | `save_brief` input + forward | D |
| `lib/brandos/tools/mutation_registry.ts` | `brief` `edit.fields` allowlist | E |
| `db/schema/plan.ts` | `channel_plans.creative_target` (Drizzle) | F |
| `db/migrations/2026-07-21-channel-plan-creative-target.sql` | channel_plan column DDL | F |
| `lib/brandos/repo/channel-plan.ts` | `SaveChannelPlanInput` + `saveChannelPlan` map | F |
| `lib/brandos/tools/plan_tools.ts` | `save_channel_plan` input + `get_channel_plan` return | F |
| `lib/brandos/read/plans.ts` | `ChannelPlanAggregate` includes `creative_target` | F |
| `*.test.ts` alongside each | TDD | all |

**Dependency order:** A, B independent. C → D → E (briefs). F independent (channel_plan). Recommended sequence: A, B, C, D, E, F.

---

### Task A: Add the `route` taxonomy kind

**Files:**
- Modify: `scripts/seed-taxonomies.ts` (add a `ROUTE` `SeedKind`, register it in the `KINDS` array)
- Test: `scripts/seed-taxonomies.test.ts` if present, else a repo assertion (see Step 2). Check `ls scripts/*.test.ts` and `lib/brandos/repo/taxonomy.test.ts` for the nearest existing pattern.

**Interfaces:**
- Produces: a taxonomy category row `kind='route'` with leaf terms `problem`/`solution`/`comparison`/`proof`/`curiosity`, `cardinality: 'single'`, `appliesTo: ['ad']`. Consumed by Task D (`route_term_id`) and later by `ssc-ads-brief`.

- [ ] **Step 1: Write the `ROUTE` seed kind**

In `scripts/seed-taxonomies.ts`, mirror the `TONAL_REGISTER` block (it is the closest single-cardinality, `appliesTo:['ad']` kind). Add after the `TONAL_REGISTER` definition (~line 446):

```ts
// route — the persuasion route / angle-type (awareness-framework §4).
// cardinality=single, appliesTo={ad}. Carried on the ANGLE (briefs.route_term_id),
// NOT on the idea — persona-late model (design 2026-07-21). The angle's awareness
// stage implies which routes work; the brief declares the route it takes.
const ROUTE: SeedKind = {
  kind: 'route',
  categoryLabel: 'Route — Kiểu Góc Thuyết Phục',
  categoryDescription: 'The persuasion route an angle takes on a subject. Chosen at the brief, with the persona.',
  cardinality: 'single',
  appliesTo: ['ad'],
  terms: [
    { code: 'problem', label: 'Vấn đề' },
    { code: 'solution', label: 'Giải pháp' },
    { code: 'comparison', label: 'So sánh' },
    { code: 'proof', label: 'Bằng chứng' },
    { code: 'curiosity', label: 'Tò mò' },
  ],
};
```

- [ ] **Step 2: Register `ROUTE` in the `KINDS` array**

Find the `const KINDS: SeedKind[] = [` array (~line 449) and add `ROUTE,` to it (order is display-only; place it after `TONAL_REGISTER`).

- [ ] **Step 3: Add a failing assertion for the new kind**

If `lib/brandos/repo/taxonomy.test.ts` exists, add a case there; otherwise add `scripts/seed-taxonomies.test.ts` mirroring the nearest DB-bound test (real `brand_os`). The assertion, after running the seed against the test DB:

```ts
import { getBrandOsDb } from '@/lib/db/client';
import { taxonomies } from '@db/schema/taxonomies';
import { eq } from 'drizzle-orm';

it('seeds the route kind with 5 single-cardinality ad leaf terms', async () => {
  const db = getBrandOsDb();
  const rows = await db.select().from(taxonomies).where(eq(taxonomies.kind, 'route'));
  const category = rows.find((r) => r.parentId === null);
  expect(category?.cardinality).toBe('single');
  expect(category?.appliesTo).toEqual(['ad']);
  const leafCodes = rows.filter((r) => r.parentId !== null).map((r) => r.code).sort();
  expect(leafCodes).toEqual(['comparison', 'curiosity', 'problem', 'proof', 'solution']);
});
```

- [ ] **Step 4: Run the seed against the local DB, then the test**

```bash
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  npx tsx --tsconfig tsconfig.json scripts/seed-taxonomies.ts
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run <path/to/the/test/from/Step3>
```
Expected: seed prints the `route` upserts; test PASSES.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-taxonomies.ts <the test file>
git commit -m "feat(taxonomy): add route kind (problem/solution/comparison/proof/curiosity) for angle briefs"
```

> **Deploy note (record, do not skip at rollout):** run the same seed command against the deployed `brand_os` before shipping code that reads `route`.

---

### Task B: Relax `frame` governance so `ad` ideas no longer require a frame

**Why:** `validateIdeaTerms` currently rejects an `ad` `save_idea` with no `frame` term (`frame` category `metadata.required = true`, `appliesTo: ['post','ad']`). Persona-late ideas are subject-only, so an ad idea must be allowed with **no** frame. We relax `required` to a **per-channel** floor that keeps `post` requiring a frame but drops the `ad` requirement. We keep `'ad'` in `appliesTo` (Expand phase — a stray frame tag is still *accepted*; it is only *rejected* in the later Contract phase).

**Files:**
- Modify: `scripts/seed-taxonomies.ts` (the `FRAME` `SeedKind.categoryMetadata`)
- Test: `lib/brandos/domain/idea-terms.test.ts` (the `validateIdeaTerms` unit tests)

**Interfaces:**
- Consumes: `validateIdeaTerms` honoring `minCountByChannel` (confirmed present — `against` used `minCountByChannel.ad` historically). Verify in `lib/brandos/domain/idea-terms.ts` before relying on it (Step 1).

- [ ] **Step 1: Confirm the governance key `validateIdeaTerms` honors**

Read `lib/brandos/domain/idea-terms.ts` (~lines 98–172) and confirm it reads a per-channel minimum from governance meta (`minCountByChannel`) in addition to `required`. If the key name differs, use the actual key. Do not guess — this one line drives the whole task.

- [ ] **Step 2: Write the failing test**

In `lib/brandos/domain/idea-terms.test.ts`, add:

```ts
it('an ad idea with NO frame term passes (persona-late: subject-only ideas)', () => {
  const errors = validateIdeaTerms('ad', /* terms */ [], taxonomyIndexFixture);
  expect(errors.find((e) => e.field === 'frame')).toBeUndefined();
});

it('a post idea with NO frame term still fails (post keeps its required frame)', () => {
  const errors = validateIdeaTerms('post', /* terms */ [], taxonomyIndexFixture);
  expect(errors.find((e) => e.field === 'frame')).toBeDefined();
});
```
Use the file's existing fixture/builder for `taxonomyIndexFixture` (match how neighbouring tests construct the index; the fixture must carry the relaxed `frame` governance from Step 3).

- [ ] **Step 3: Relax the `FRAME` governance**

In `scripts/seed-taxonomies.ts`, change the `FRAME` block's `categoryMetadata` (currently `{ required: true }`, ~line 397) to a per-channel floor:

```ts
  // post keeps its required frame; ad drops the requirement (persona-late:
  // ideas are subject-only, framing lives at the brief). Expand phase — 'ad'
  // stays in appliesTo (a stray frame tag is still accepted, not rejected).
  categoryMetadata: { minCountByChannel: { post: 1 } },
```
Mirror the same governance shape into the test's `taxonomyIndexFixture` for `frame`.

- [ ] **Step 4: Run the domain test**

```bash
pnpm exec vitest run lib/brandos/domain/idea-terms.test.ts
```
Expected: both new cases PASS; existing frame cases still PASS.

- [ ] **Step 5: Re-seed local + commit**

```bash
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  npx tsx --tsconfig tsconfig.json scripts/seed-taxonomies.ts
git add scripts/seed-taxonomies.ts lib/brandos/domain/idea-terms.test.ts
git commit -m "feat(taxonomy): frame no longer required on ad ideas (persona-late subject-only ideas)"
```

> **Deploy note:** re-run the seed against the deployed `brand_os` before shipping.

---

### Task C: Add the five angle fields to `briefs` (schema + migration + repo)

**Files:**
- Modify: `db/schema/briefs.ts` (add 5 columns + import `taxonomies`)
- Create: `db/migrations/2026-07-21-brief-angle-fields.sql`
- Modify: `lib/brandos/repo/brief.ts` (`SaveBriefInput` + `saveBrief` insert values)
- Test: `lib/brandos/repo/brief.test.ts` (real-PG round-trip)

**Interfaces:**
- Produces: `briefs.personaTermId`, `briefs.routeTermId`, `briefs.targetLayerTermId`, `briefs.audienceIntent`, `briefs.awarenessStage` (all `text`, nullable); `SaveBriefInput` gains `personaTermId?`, `routeTermId?`, `targetLayerTermId?`, `audienceIntent?`, `awarenessStage?` (all `string | null`). `BriefRow` (Drizzle select row) auto-includes the columns.

- [ ] **Step 1: Add the columns to the Drizzle schema**

In `db/schema/briefs.ts`, add the import and the five columns after `cta` (line 46), before `status`:

```ts
import { taxonomies } from './taxonomies';
```
```ts
    cta: text('cta'),
    // Persona-late angle model (design 2026-07-21): the brief IS the angle —
    // persona (moved off the idea) × route, plus its declared media home.
    personaTermId: text('persona_term_id').references(() => taxonomies.id),
    routeTermId: text('route_term_id').references(() => taxonomies.id),
    targetLayerTermId: text('target_layer_term_id').references(() => taxonomies.id),
    audienceIntent: text('audience_intent'), // declared media-home intent (free text)
    awarenessStage: text('awareness_stage'), // derived-but-stored; NOT agent-editable
    status: text('status').notNull().default('draft'),
```

- [ ] **Step 2: Write the migration SQL**

Create `db/migrations/2026-07-21-brief-angle-fields.sql`:

```sql
-- Persona-late angle fields on briefs. Additive, nullable — Expand phase.
BEGIN;
ALTER TABLE briefs
  ADD COLUMN persona_term_id       text REFERENCES taxonomies(id),
  ADD COLUMN route_term_id         text REFERENCES taxonomies(id),
  ADD COLUMN target_layer_term_id  text REFERENCES taxonomies(id),
  ADD COLUMN audience_intent       text,
  ADD COLUMN awareness_stage       text;
COMMIT;
```

- [ ] **Step 3: Apply the migration to the local DB**

```bash
psql 'postgres://app:app@localhost:5432/brand_os' -f db/migrations/2026-07-21-brief-angle-fields.sql
```
Expected: `ALTER TABLE`.

- [ ] **Step 4: Extend `SaveBriefInput` and the `saveBrief` insert**

In `lib/brandos/repo/brief.ts`, add to `SaveBriefInput` (after `comment?`, ~line 104):

```ts
  personaTermId?: string | null;
  routeTermId?: string | null;
  targetLayerTermId?: string | null;
  audienceIntent?: string | null;
  awarenessStage?: string | null;
```
And in `saveBrief`'s `.values({ … })` (after `comment: input.comment ?? null,`, ~line 134):

```ts
        personaTermId: input.personaTermId ?? null,
        routeTermId: input.routeTermId ?? null,
        targetLayerTermId: input.targetLayerTermId ?? null,
        audienceIntent: input.audienceIntent ?? null,
        awarenessStage: input.awarenessStage ?? null,
```

- [ ] **Step 5: Write the failing round-trip test**

In `lib/brandos/repo/brief.test.ts`, add (it already seeds a real idea + tracks ids for cleanup — match that harness). Seed the term ids from the taxonomy the seed created (query for a `persona`, a `route`, a `campaign_layer` leaf), or assert only the free-text fields if constructing valid term ids is heavy in that file:

```ts
it('round-trips the persona-late angle fields', async () => {
  const ideaId = /* existing helper that seeds a real idea */;
  const row = await saveBrief('op-brief-test', {
    ideaId,
    channel: 'ad',
    audienceIntent: 'phụ nữ U50 nguội lạnh với ăn kiêng',
    awarenessStage: 'problem-aware',
  });
  expect(row.audienceIntent).toBe('phụ nữ U50 nguội lạnh với ăn kiêng');
  expect(row.awarenessStage).toBe('problem-aware');
  expect(row.personaTermId).toBeNull();
});
```

- [ ] **Step 6: Type-check + run the test**

```bash
pnpm type-check
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run lib/brandos/repo/brief.test.ts
```
Expected: type-check clean; test PASSES.

- [ ] **Step 7: Commit**

```bash
git add db/schema/briefs.ts db/migrations/2026-07-21-brief-angle-fields.sql lib/brandos/repo/brief.ts lib/brandos/repo/brief.test.ts
git commit -m "feat(briefs): add persona-late angle fields (persona/route/target_layer/audience_intent/awareness_stage)"
```

> **Deploy note:** apply `2026-07-21-brief-angle-fields.sql` to the deployed `brand_os` before shipping code that reads/writes these columns.

---

### Task D: Expose the angle fields through the read layer + `save_brief`

**Files:**
- Modify: `lib/brandos/read/ideas.ts` (`IdeaBrief` interface + `briefRowColumns` map)
- Modify: `lib/brandos/tools/brief_tools.ts` (`save_brief` input schema + forwarded call)
- Test: `lib/brandos/tools/brief_tools.test.ts` (real-PG)

**Interfaces:**
- Consumes: `SaveBriefInput` fields from Task C; `briefs.*` columns from Task C.
- Produces: `save_brief` accepts `persona_term_id`, `route_term_id`, `target_layer_term_id`, `audience_intent`, `awareness_stage`; `get_brief`/`list_briefs` return them (snake_case) on every `IdeaBrief`.

- [ ] **Step 1: Add the fields to the `IdeaBrief` read type**

In `lib/brandos/read/ideas.ts`, add to `interface IdeaBrief` (after `cta`, line 54):

```ts
  persona_term_id: string | null;
  route_term_id: string | null;
  target_layer_term_id: string | null;
  audience_intent: string | null;
  awareness_stage: string | null;
```

- [ ] **Step 2: Add the fields to the shared `briefRowColumns` projection**

In the same file, add to `const briefRowColumns = { … }` (after `cta: briefs.cta,`, line 131):

```ts
  persona_term_id: briefs.personaTermId,
  route_term_id: briefs.routeTermId,
  target_layer_term_id: briefs.targetLayerTermId,
  audience_intent: briefs.audienceIntent,
  awareness_stage: briefs.awarenessStage,
```
Both `listBriefs` and `getBrief` select through this one map, so this single edit covers both reads.

- [ ] **Step 3: Add the input fields to `save_brief`**

In `lib/brandos/tools/brief_tools.ts`, add to the `inputSchema` (after `comment:` at line 55) — `awareness_stage` constrained to the five stages:

```ts
        persona_term_id: z.string().optional().describe('Persona taxonomy leaf id (chosen at the angle)'),
        route_term_id: z.string().optional().describe('Route taxonomy leaf id (problem|solution|comparison|proof|curiosity)'),
        target_layer_term_id: z.string().optional().describe('Declared media-home layer (campaign_layer leaf id)'),
        audience_intent: z.string().optional().describe('Declared media-home audience intent (free text, Vietnamese)'),
        awareness_stage: z.enum(['unaware', 'problem-aware', 'solution-aware', 'product-aware', 'most-aware']).optional().describe('Derived awareness stage the angle addresses'),
```
Add the five names to the handler destructure (line 68) and forward them in the `saveBrief(...)` call (after `comment,` at line 81):

```ts
        personaTermId: persona_term_id,
        routeTermId: route_term_id,
        targetLayerTermId: target_layer_term_id,
        audienceIntent: audience_intent,
        awarenessStage: awareness_stage,
```

- [ ] **Step 4: Write the failing tool test**

In `lib/brandos/tools/brief_tools.test.ts`, add inside the `save_brief` describe block (mirror the existing `inserts a DRAFT post brief` case — real DB, snake_case read-back):

```ts
it('persists the persona-late angle fields and returns them snake_case via get_brief', async () => {
  const ideaId = await seedIdea();
  const save = getTool(approver, 'save_brief');
  const res = await save({
    idea_id: ideaId,
    channel: 'ad',
    audience_intent: 'phụ nữ U50 sợ chùng da',
    awareness_stage: 'problem-aware',
  });
  seededBriefIds.push(res.structuredContent.id);

  const get = getTool(approver, 'get_brief');
  const got = await get({ id: res.structuredContent.id });
  expect(got.structuredContent.brief.audience_intent).toBe('phụ nữ U50 sợ chùng da');
  expect(got.structuredContent.brief.awareness_stage).toBe('problem-aware');
  expect(got.structuredContent.brief.persona_term_id).toBeNull();
  expect('audienceIntent' in got.structuredContent.brief).toBe(false); // snake_case only
});
```

- [ ] **Step 5: Type-check + run the test**

```bash
pnpm type-check
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run lib/brandos/tools/brief_tools.test.ts
```
Expected: clean; PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/brandos/read/ideas.ts lib/brandos/tools/brief_tools.ts lib/brandos/tools/brief_tools.test.ts
git commit -m "feat(brief tools): save_brief accepts + get_brief/list_briefs return the persona-late angle fields"
```

---

### Task E: Allow post-create edits of the angle fields (except `awareness_stage`)

**Files:**
- Modify: `lib/brandos/repo/brief.ts` (`BriefPatch` + `editBrief` mapping)
- Modify: `lib/brandos/tools/mutation_registry.ts` (the `brief` entity `edit.fields` allowlist, ~lines 734–762)
- Test: `lib/brandos/tools/mutation_registry.test.ts` (or the nearest generic-`edit` test)

**Interfaces:**
- Consumes: `briefs.*` columns (Task C).
- Produces: generic `edit(entity='brief')` may patch `persona_term_id`, `route_term_id`, `target_layer_term_id`, `audience_intent`. It may **NOT** patch `awareness_stage` (derived-but-stored — set only by `save_brief`).

- [ ] **Step 1: Extend `BriefPatch`**

In `lib/brandos/repo/brief.ts`, add to `interface BriefPatch` (after `comment?`, ~line 256) — note: **no `awarenessStage`**:

```ts
  personaTermId?: string | null;
  routeTermId?: string | null;
  targetLayerTermId?: string | null;
  audienceIntent?: string | null;
```
Ensure `editBrief` writes these (follow how it maps the existing `BriefPatch` fields; if it maps the patch object directly to `optimisticUpdate`, no change is needed beyond the interface + the allowlist).

- [ ] **Step 2: Add the fields to the `brief` edit allowlist**

In `lib/brandos/tools/mutation_registry.ts`, find the `brief` entity descriptor's `edit.fields` allowlist (~lines 734–762, currently `angle_label`/`hook_direction`/`core_message`/`why_now`/`story_moment`/`cta`/`score`/`comment`) and add:

```ts
  'persona_term_id',
  'route_term_id',
  'target_layer_term_id',
  'audience_intent',
  // NOTE: deliberately NOT 'awareness_stage' — derived-but-stored, set only by
  // save_brief; agents (edit capability) must not hand-set it. Not 'status'
  // either (promotion is the approve verb).
```

- [ ] **Step 3: Write the failing test**

In the mutation-registry test (mirror an existing `edit(entity='brief')` case), add:

```ts
it('edit(brief) may patch audience_intent but NOT awareness_stage', async () => {
  // audience_intent is allowed:
  expect(briefEditAllowlist).toContain('audience_intent');
  expect(briefEditAllowlist).toContain('persona_term_id');
  // awareness_stage is forbidden (derived-but-stored):
  expect(briefEditAllowlist).not.toContain('awareness_stage');
});
```
Resolve `briefEditAllowlist` the way the existing tests read the registry descriptor (match the file's helper).

- [ ] **Step 4: Type-check + run the test**

```bash
pnpm type-check
pnpm exec vitest run lib/brandos/tools/mutation_registry.test.ts
```
Expected: clean; PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/brandos/repo/brief.ts lib/brandos/tools/mutation_registry.ts lib/brandos/tools/mutation_registry.test.ts
git commit -m "feat(brief edit): allow editing persona/route/target_layer/audience_intent; keep awareness_stage un-editable"
```

---

### Task F: Add `creative_target` to `channel_plans` (schema + migration + repo + tool)

**Files:**
- Modify: `db/schema/plan.ts` (`channelPlans` gains `creativeTarget` jsonb)
- Create: `db/migrations/2026-07-21-channel-plan-creative-target.sql`
- Modify: `lib/brandos/repo/channel-plan.ts` (`SaveChannelPlanInput` + `saveChannelPlan` map)
- Modify: `lib/brandos/tools/plan_tools.ts` (`save_channel_plan` input + `get_channel_plan` passthrough)
- Modify: `lib/brandos/read/plans.ts` (`ChannelPlanAggregate` includes `creative_target`)
- Test: `lib/brandos/tools/plan_tools.test.ts`

**Interfaces:**
- Produces: `channel_plans.creative_target` jsonb (nullable) holding `Array<{ persona: string; route: string; count: number }>`; `save_channel_plan` accepts `creative_target`; `get_channel_plan` returns it. Set at the Focus step by the plugin `ssc-ads-focus` skill.

- [ ] **Step 1: Add the column to the Drizzle schema**

In `db/schema/plan.ts`, in the `channelPlans` `pgTable` (after `retrospective`, ~line 40), add:

```ts
  // Persona-late coverage/volume target set at Focus (design OP1, 2026-07-21):
  // Array<{ persona, route, count }>. Not a media plan — the creative-strategy target.
  creativeTarget: jsonb('creative_target'),
```
Ensure `jsonb` is imported in the file's `drizzle-orm/pg-core` import (it already imports jsonb for `buildSpec`; confirm).

- [ ] **Step 2: Write the migration SQL**

Create `db/migrations/2026-07-21-channel-plan-creative-target.sql`:

```sql
-- Focus-step creative coverage/volume target on channel_plans. Additive, nullable.
BEGIN;
ALTER TABLE channel_plans ADD COLUMN creative_target jsonb;
COMMIT;
```

- [ ] **Step 3: Apply to local DB**

```bash
psql 'postgres://app:app@localhost:5432/brand_os' -f db/migrations/2026-07-21-channel-plan-creative-target.sql
```
Expected: `ALTER TABLE`.

- [ ] **Step 4: Thread it through repo + read + tool**

- In `lib/brandos/repo/channel-plan.ts`: add `creativeTarget?: unknown | null;` to `SaveChannelPlanInput` (~lines 123–134), and in `saveChannelPlan`'s upsert values set `creativeTarget: input.creativeTarget ?? <preserve-existing>` following the file's "omitted fields preserved" idiom (mirror how `context`/`tactics` are conditionally set).
- In `lib/brandos/read/plans.ts`: add `creative_target` to `ChannelPlanAggregate` (~lines 127–133) and its select projection (map `channelPlans.creativeTarget`).
- In `lib/brandos/tools/plan_tools.ts`: add to `save_channel_plan`'s `inputSchema` (~lines 77–90):

```ts
        creative_target: z.array(z.object({
          persona: z.string(),
          route: z.string(),
          count: z.number().int(),
        })).optional().describe('Focus-step coverage/volume target: persona × route × count'),
```
and forward `creativeTarget: creative_target` into the `saveChannelPlan(...)` call. `get_channel_plan` returns the aggregate, so `creative_target` rides along once it is in `ChannelPlanAggregate`.

- [ ] **Step 5: Write the failing round-trip test**

In `lib/brandos/tools/plan_tools.test.ts` (match its DB/mock setup — check its header), add:

```ts
it('round-trips creative_target on save_channel_plan → get_channel_plan', async () => {
  const target = [{ persona: 'chi-huong', route: 'problem', count: 3 }];
  await callSaveChannelPlan({ channel: 'ad', period: '2026-08', creative_target: target });
  const plan = await callGetChannelPlan({ channel: 'ad', period: '2026-08' });
  expect(plan.creative_target).toEqual(target);
});
```
Use the file's existing invocation helpers (`callSaveChannelPlan`/`callGetChannelPlan` or the inline equivalent).

- [ ] **Step 6: Type-check + run the test**

```bash
pnpm type-check
DATABASE_URL_BRANDOS='postgres://app:app@localhost:5432/brand_os' \
  pnpm exec vitest run lib/brandos/tools/plan_tools.test.ts
```
Expected: clean; PASS.

- [ ] **Step 7: Commit**

```bash
git add db/schema/plan.ts db/migrations/2026-07-21-channel-plan-creative-target.sql lib/brandos/repo/channel-plan.ts lib/brandos/read/plans.ts lib/brandos/tools/plan_tools.ts lib/brandos/tools/plan_tools.test.ts
git commit -m "feat(channel_plan): add creative_target (Focus coverage/volume target) end-to-end"
```

> **Deploy note:** apply `2026-07-21-channel-plan-creative-target.sql` to the deployed `brand_os` before shipping.

---

## Deferred to later plans (NOT this Expand phase)

1. **Migrate (backfill) — the data migration (locked: backfill existing, spec OP4).** Runs in the Migrate step — *after* the plugin skills write the new fields for new briefs, *before* the Contract phase drops `slot_id`. Its own plan when we reach it; the shape is fixed:

   **(a) Deterministic SQL** — `db/migrations/<date>-backfill-angle-fields.sql`:
   ```sql
   BEGIN;
   -- persona ← the owning idea's single persona idea_term
   UPDATE briefs b SET persona_term_id = it.term_id
     FROM idea_terms it JOIN taxonomies tx ON tx.id = it.term_id AND tx.kind = 'persona'
     WHERE it.idea_id = b.idea_id AND b.persona_term_id IS NULL;
   -- target_layer ← idea → ad_idea_details.slot_id → ad_plan_slots.layer_term_id
   UPDATE briefs b SET target_layer_term_id = s.layer_term_id
     FROM ad_idea_details d JOIN ad_plan_slots s ON s.id = d.slot_id
     WHERE d.idea_id = b.idea_id AND d.slot_id IS NOT NULL AND b.target_layer_term_id IS NULL;
   COMMIT;
   ```

   **(b) Content-driven classification** — `scripts/backfill-angle-fields.ts` (standalone tsx, modelled on the existing `scripts/backfill-briefs.ts`). The three net-new fields have **no columnar source**, so they are derived by **reading each brief's content individually**. For every existing brief: load its `content` rows (the finished `copy`/`headline`/`description`/`image_content`), then classify — grounded in `ad/awareness-framework` §4 + the persona doc:
   - `route_term_id` ← the Problem/Solution/Comparison/Proof/Curiosity the copy actually takes → the matching `route` taxonomy leaf.
   - `awareness_stage` ← the stage the copy addresses (`unaware`…`most-aware`).
   - `audience_intent` ← a short Vietnamese phrase for who the copy speaks to (from the copy + the brief's persona).

   Classification is an **LLM judgment per brief** (the script calls the model, or an operator runs a Cowork agent pass over the set). The script **writes the three fields directly** — bypassing the `edit` tool, because `awareness_stage` is deliberately not in the edit allowlist (Task E). A brief with **no** content rows leaves the three NULL (nothing to read) and is reported.

   **(c) Orphan-guard before Contract** — no brief whose idea had a slot may be left without a `target_layer_term_id`:
   ```sql
   DO $$ DECLARE lost int; BEGIN
     SELECT count(*) INTO lost FROM briefs b
       JOIN ad_idea_details d ON d.idea_id = b.idea_id AND d.slot_id IS NOT NULL
       WHERE b.target_layer_term_id IS NULL;
     IF lost > 0 THEN RAISE EXCEPTION 'briefs with a legacy slot but no target_layer: %', lost; END IF;
   END $$;
   ```

2. **Contract phase (destructive).** Drop `ad_idea_details.slot_id` (+ FK + read projections in `read/ideas.ts:216,282,360,417,458` + the `AdIdeaDetailInput.slotId` allowlist in `repo/idea.ts` + the `deleteAdPlanSlot` referential guard in `repo/channel-plan.ts:963-968`); drop the `ad_plan_slots` creative-steering columns (`layer_term_id`/`primary_persona_term_id`/`value_term_id`/`frame_term_id`/`tonal_register_term_id`/`peak_window`/`format_pref`) across `db/schema/plan.ts`, `tools/plan_tools.ts`, `repo/channel-plan.ts`, `read/plans.ts`; drop `'ad'` from `applies_to` for `persona`/`value`/`frame`/`campaign_layer`/`tonal_register` so a stray creative tag on an ad idea is rejected. Runs **only after** the Migrate backfill (item 1) and after the plugin skills + dashboard stop reading/writing these.
3. **Brief term-kind validation (hardening).** A `validateBriefTerms` backstop asserting `persona_term_id`→kind `persona`, `route_term_id`→kind `route`, `target_layer_term_id`→kind `campaign_layer` (mirroring `validateIdeaTerms` + `loadTaxonomyIndex`). Deferred: FK already guarantees the term exists; strict kind-checking is a safety net, not contract-blocking. Read `loadTaxonomyIndex` before writing it.
4. **Plugin skills** (`ssc-content-plugin` repo): rewrite Ideate/Brief/Writer/Approaches/Focus + agent + commands against this contract — its own plan.
5. **Dashboard + KB** (BrandOS dashboard; `content/` KB): deployment `create_ad` from the angle's declared home; coverage/gaps view; broad-vs-persona KB revisions — their own plans.

## Self-Review

- **Spec coverage:** brief carries persona/route/target_layer/audience_intent/awareness_stage → Tasks C/D/E ✓; `route` vocabulary → Task A ✓; persona-late (frame-free) ideas → Task B ✓; `creative_target` at Focus (OP1) → Task F ✓; media-home is a *declared intent* not an ad-set id (OP2) → `target_layer_term_id` + `audience_intent` free text, no ad-set FK ✓; awareness_stage derived-but-stored + un-editable (D9 propose-only) → Task E excludes it ✓; `ad_slot_id` / steering-column drops → correctly deferred to Contract phase ✓.
- **Placeholder scan:** the two spots that reference "match the file's existing helper" (test harness fixtures in Tasks B/E/F) point at real, named neighbouring tests rather than inventing an API — acceptable, since the exact fixture builder is local to each test file and must be reused, not re-created.
- **Type consistency:** camelCase Drizzle columns (`personaTermId`…) ↔ snake_case read/tool fields (`persona_term_id`…) are mapped once each (schema → repo input `SaveBriefInput` → read `briefRowColumns`/`IdeaBrief` → tool input). Names match across Tasks C→D→E. `awareness_stage` appears in save/read but is intentionally absent from the edit allowlist (Task E) and `BriefPatch`.
```
