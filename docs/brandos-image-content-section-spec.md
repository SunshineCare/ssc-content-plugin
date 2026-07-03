# Spec: `image_content` content section (BrandOS `/ad` dashboard)

**For:** BrandOS server + dashboard team
**Requested by:** `ssc-content` plugin — `ssc-ads-writer` (ads-produce)
**Status:** **save side confirmed working** (`section` is free text end-to-end) — the only remaining work is the `/ad` dashboard "Image content" stage
**Type:** additive (new `section` value; no MCP tool change; no save-side change)

## Background

`ssc-ads-writer` produces ad text as a state-driven, per-section stepper. It now adds a 4th step after **headline → copy → description**: **`image_content`** — the **on-image COPY as structured text** (a headline hook + a USP/proof subheadline + 3 USP/proof bullets), **not a rendered picture**.

It's written through the **existing** `save_post_content` MCP tool with a **new `section='image_content'`**, and read through the **existing** `list_post_content`.

**Confirmed:** `section` is **free text end-to-end**, so `save_post_content(section='image_content', …)` **persists today with no server change** — there is no enum/constraint to update. `list_post_content` and `approve_content` are section-agnostic and should already work. **The only build work is the `/ad` dashboard: a stage to render the new section.**

`image_content` is **distinct from the retired `image` section** (a rendered PNG stored as `creativeUrl` via `upload_creative`, now removed from the ads flow). `image_content` carries **no `creativeUrl`** — its content lives in `body` as text.

## The contract (exactly what the plugin already emits)

### Write
```js
save_post_content({
  channel: 'ad',
  idea_id: '<approved ad concept id>',
  section: 'image_content',   // ← any string is accepted (free text)
  body:    'HEADLINE: ...\nSUBHEADLINE: ...\nBULLETS:\n- ...\n- ...\n- ...',
  score:   4,                 // integer, always ≥4 when saved
  comment: '<one-line Vietnamese rationale>',
})
```
- Inserts a **DRAFT** row like the text sections: `status='draft'`, `compliance_status='passed'`.
- **No `creativeUrl`, no `upload_creative`.**

### `body` format (emitted verbatim; parse leniently)
```
HEADLINE: <strong hook — short>
SUBHEADLINE: <the key USP/proof, or the solution that pays off the headline>
BULLETS:
- <USP/proof point 1>
- <USP/proof point 2>
- <USP/proof point 3>
```
- `HEADLINE:` / `SUBHEADLINE:` / `BULLETS:` are **fixed ASCII structural markers**.
- Values are **Vietnamese**. Exactly **3** bullets. Tolerate minor whitespace / trailing newlines.

### Read
`list_post_content(idea_id)` returns `image_content` rows (with `section`, `status`, `score`, `comment`, `body`) alongside the other sections — the writer's state machine reads these to gate the chain (it produces `image_content` only after a `description` row is `approved`, and treats the concept "complete" once an `image_content` row is `approved`).

### Approve
`approve_content` on an `image_content` row behaves **identically** to the text sections (`draft → approved`; requires `compliance_status='passed'`).

## Server / API — confirmed working (verify only, nothing to build)

1. **Save — works today.** ✅ `content.section` is free text end-to-end; `save_post_content(section='image_content', …)` persists the DRAFT row now. No enum/`CHECK`/whitelist to change.
2. **Read — should already work.** `list_post_content(idea_id)` returns rows regardless of section value — just verify `image_content` rows come back (no serializer/query filter to the old four).
3. **Approve / compliance — should already work.** `approve_content` + `compliance_status` are section-agnostic — verify parity.

## Dashboard (`/ad/[id]`) — **the only build work**

4. **Add an "Image content" stage.** Group `section='image_content'` rows and render each row's **`body`** by parsing the `HEADLINE:` / `SUBHEADLINE:` / `BULLETS:` structure: headline prominent, subheadline beneath, the 3 bullets as a list. **There is no `creativeUrl`** — do **not** render an `<img>` / uploaded-image placeholder; render the text.
5. **Curation parity.** Select / approve / edit each `image_content` draft the same as headline/copy/description (`draft ↔ approved`, inline edit of `body`).

## Acceptance criteria
- `save_post_content(section='image_content', body=<structured>, …)` → saved DRAFT (2xx), section persisted as `image_content`, `compliance_status='passed'`. *(Confirmed working.)*
- `list_post_content(idea_id)` includes the row with its `section`, `status`, `body`.
- `approve_content` flips it `draft → approved`.
- `/ad/[id]` shows an Image-content stage rendering headline / subheadline / 3 bullets from `body` — no broken-image placeholder, no reliance on `creativeUrl`.
- E2E: with an approved headline + copy + description, ads-produce yields `image_content` drafts; approving one makes the writer report the concept complete.

## Out of scope
- No image rendering/generation server-side (the plugin produces text only; the visual is made downstream from this spec).
- No new MCP tool; no change to `save_post_content` / `list_post_content` signatures.
- The retired `image` (PNG / `creativeUrl`) section is not reinstated — keep it distinct (`image_content` uses `body`, not `creativeUrl`).
