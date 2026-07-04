# ssc-ads-image — ad-visual production skill (design spec)

> **SUPERSEDED (2026-07-05)** by
> [`2026-07-05-ssc-ads-image-component-composition-design.md`](2026-07-05-ssc-ads-image-component-composition-design.md).
> That spec replaces this whole-scene draft→refine pipeline with a component-based
> one (background → model-into-background → product upload → composite). The
> BrandOS/Go-`resource` architecture analysis below is carried forward; the
> pipeline and hard-paste-always rule are not. Kept for history.

Status: SUPERSEDED (was DRAFT / for review)
Date: 2026-07-03

## Goal

Add image production to the Cambridge Diet Vietnam ads pipeline. Today the ads
flow is **text-only** — `ssc-ads-writer` ends at `image_content` (the on-image
COPY as structured text). Nothing renders a picture. This skill produces the
**ad visual** to pair with that approved `image_content`, propose-only.

## Runs after

`image_content` is the LAST section in the ads-writer chain
(headline → copy → description → image_content). `ssc-ads-image` runs **after**
`image_content` is approved for a concept — it consumes the approved concept +
its `image_content` and produces a visual. Dispatched directly (mirroring
`/ssc.ads-produce` → `ssc-ads-writer`), not through the planning agent.

## Decided image stack — two-pass (draft → refine)

| Pass | Engine | Notes |
|---|---|---|
| 1. Draft composition | Flux **schnell** | rough WHOLE-scene layout (~$0.003 each); draft many, operator picks composition. Person/product pixels are throwaway placeholders — schnell decides *where*, not *how it looks* |
| 2. Refine | **Nano Banana** (Gemini 2.5 Flash Image) | takes the chosen schnell draft as BASE image → upgrades to photoreal, generates the synthetic person, places the REAL pack shot (as reference). Paid on the keeper only (~$0.039) |
| 3. Product fidelity lock | **masked hard-paste of real product PNG** | pixel-exact packaging over Nano's refined output — Nano's refine is a re-render, never the final word on the product. See Hard rules |
| 4. Text | existing `image_content`, overlaid separately | NOT rendered by any model |

Cost: ~$0.05–0.10 per finished concept (schnell drafts + one Nano refine), uncapped.

## Hard rules (invariants)

1. **Product packaging is never AI-generated.** Nano may *place and light* the
   real pack shot, but the skill's final step re-composites the **real product
   PNG** (masked) so label / logo / pack are pixel-exact. A paid ad must not
   ship a re-rendered (drifted) product.
2. **Text is never baked in by a model.** `image_content` is overlaid
   separately (existing workflow). The visual just leaves negative space for it.
3. **Propose-only.** The skill drafts visuals and STOPS for operator review at
   the dashboard. It never approves, publishes, or flips a gate. Never add
   `approve_*` / `update_status` / `update_budget` / publish tools.
4. **Persisted prose is Vietnamese** (prompts to the operator, any saved notes)
   — but image-model prompts are whatever the model renders best.

## Person branch

- **Synthetic person** → generate via Nano Banana into the schnell background.
  (Accepts: no commercial indemnity on AI humans — a conscious trade vs Firefly.)
- **Real brand model** → composite the real photo (Nano Banana / Kontext /
  manual); person is a real asset, same fidelity discipline as the product.

## Pipeline

```
1. Resolve approved concept + approved image_content
2. Draft     → Flux schnell: N rough whole-scene compositions (negative space for text)
               → operator picks the composition (propose-only checkpoint)
3. Refine    → Nano takes the chosen draft as BASE image →
                 photoreal upgrade + synthetic person (or composite real model)
                 + places the REAL pack shot as reference
4. Fidelity  → masked hard-paste of real product PNG (pulled from Go resource — see gap 2) over Nano output
5. Store     → PrepareMediaUpload → BrandOS PUTs bytes to presigned URL → RegisterMedia (Go resource) → mediaId
6. Save      → BrandOS draft creative record holds the mediaId / resource reference (not the blob)
7. STOP      → operator reviews / approves at the dashboard; text overlaid there
```

## Architecture decision: provider APIs live in BrandOS, exposed as MCP tools

DECIDED: the plugin does NOT wire third-party image MCPs (Replicate/Gemini) into
Cowork, and skills do NOT curl provider APIs. Instead:

```
Plugin skill --MCP--> BrandOS  (generate: Flux schnell + Nano refine + masked paste)
                        |
                        +-ConnectRPC--> Go ResourceService (feature/core/resource, proto core/resource/v1)
                        |    PrepareMediaUpload -> (BrandOS PUTs bytes to presigned URL) -> RegisterMedia
                        |                             +-> R2 (prod) / MinIO (dev)
                        |
                        +- draft creative record holds the mediaId / resource reference
```

- **Plugin <-> BrandOS: MCP** — keeps the single-server model (BrandOS is the
  only MCP the plugin connects to today).
- **BrandOS <-> Flux/Nano: direct REST API, server-side** — provider keys live
  on the server, never in operator Cowork config or a skill.
- **Storage/resource is the Go `resource` domain, NOT BrandOS and NOT
  cloud-storage directly.** `feature/core/resource` (`ResourceService`, proto
  `core/resource/v1`) is the media-asset domain; `cloud-storage` is only the
  presign adapter underneath it (`StorageUploader.PresignUpload`). BrandOS calls
  `ResourceService` over ConnectRPC.

  Upload contract (presigned, client-driven — bytes do NOT stream through Go):
  1. `PrepareMediaUpload(entity_type, content_hash?, mime, file_size, folder…)`
     -> `UploadTicket{mediaId, path (private/…), uploadUrl, PUT, expiresAt}`
     (or `ExistingMedia{mediaId}` on a SHA-256 content-hash dedup hit — free dedup).
  2. BrandOS PUTs the composited bytes directly to `uploadUrl` (R2/MinIO).
  3. `RegisterMedia(id=mediaId, path, mime, fileSize, contentHash, caption, tags)`
     -> streamed `CommandStatus` (the CQRS command that records the media).
- **Product pack-shot PNGs are `resource` media too** — but see gap (2): there is
  no presigned-GET RPC yet, so fetching the product bytes for the paste is unsolved.

Rationale: the product hard-paste is real pixel compositing (mask a PNG onto
Nano's output) — it MUST run server-side with an image lib (sharp/canvas), not
in Cowork. BrandOS orchestrates schnell -> refine -> paste and holds the
provider keys; the Go `resource` domain owns durable storage + dedup + lifecycle.
Propose-only and governance stay in BrandOS.

### Go-side gaps confirmed in resource/api/service.go (BLOCKERS)

1. **Public serving.** Originals are `private/…` keys; the only public path is the
   thumbnail slot (`PrepareThumbnailUpload` -> `SetMediaThumbnail` -> `public/…`).
   An ad creative needs a public full-res URL — decide: new ad-creative
   entity_type that publishes public, or use the thumbnail slot as the render.
2. **No download RPC.** register/update/delete/prepare-upload/thumbnail exist, but
   no presigned-GET. Fetching the product PNG bytes for compositing needs a
   presign-download path that isn't in the service yet (reads via Hasura metadata
   + a presign-GET to be added/located).
3. **Identity.** Every write RPC does `RequireRole("member")` and prefixes private
   keys with `meta.MemberID`. BrandOS is a server, not a member — needs a
   system/service member identity or a dedicated non-member entity_type. Current
   `MediaPolicy` knows `MEMBER_LIBRARY` / `ORGANIZATION_LIBRARY` — neither fits a
   system-generated ad creative.

### New BrandOS tools required (server-side — not in this repo)

- `generate_ad_draft` — schnell composition drafts -> returns options.
- `refine_ad_visual` — Nano refine of the chosen draft + real-product placement
  + server-side masked paste -> saves a DRAFT creative (reuse the existing
  `upload_creative` / draft path).

These are BrandOS server changes (separate repo). Once they exist, add them to
`plugin.json` + `.mcp.json` is NOT needed for new servers — they are additional
tools on the SAME `ssc` BrandOS surface, so no MCP-config change; the skill just
references `mcp__ssc__generate_ad_draft` / `mcp__ssc__refine_ad_visual`. Every
referenced tool must exist on the server (recurring shipped-bug class — 8d4ded8).

## Frontmatter (draft)

```yaml
name: ssc-ads-image
description: >-
  Produces the ad VISUAL for one approved Cambridge Diet Vietnam ad concept —
  Flux-schnell background → Nano Banana person + real-product placement →
  masked hard-paste of the real product PNG for pixel-exact packaging. Leaves
  negative space for the separately-overlaid image_content text. Propose-only:
  drafts a visual and STOPS for operator review; never approves or publishes.
metadata:
  section: ads
  stage: produce
capability: edit
tools:
  # BrandOS
  - get_idea
  - list_post_content        # resolve approved image_content
  - upload_creative          # CONFIRM: save-back path
  # external image MCPs (names TBD once wired)
```

## Open questions

1. **Go resource: public serving** (gap 1) — ad-creative entity_type that
   publishes public, or use the thumbnail slot? Needs a `MediaPolicy` entry.
2. **Go resource: download path** (gap 2) — add a presigned-GET RPC (or locate
   the read path) so BrandOS can pull the product PNG bytes for compositing.
3. **Go resource: server identity** (gap 3) — system/service member identity or a
   non-member ad-creative entity_type, since write RPCs `RequireRole("member")`.
4. **Save-back**: does the BrandOS draft-creative record have a field for the Go
   `mediaId`, or does `upload_creative` need a new arg?
5. **Command surface**: new `/ssc.ads-image` command, or fold into
   `/ssc.ads-produce` as a post-`image_content` step?
6. **Which Flux + which Nano provider** BrandOS calls — a BrandOS-server config
   choice, invisible to the plugin.

## Resolved

- **Storage/resource** → Go `feature/core/resource` `ResourceService`
  (`PrepareMediaUpload` -> presigned PUT -> `RegisterMedia`); NOT BrandOS, NOT
  cloud-storage directly (cloud-storage is only resource's presign adapter).
- **Where product PNGs live** → Go `resource` media (blocked on gap 2 for fetch).
- **MCP vs direct API** → BrandOS calls provider APIs directly (server-side);
  plugin talks only to BrandOS MCP.
- **Free dedup** → resource does SHA-256 content-hash dedup on upload.
```
