# KB revision proposal — persona-late ads (broad-vs-persona reconciliation)

- **Date:** 2026-07-21
- **Status:** proposal (propose-only) — **apply WITH the plugin-skills rewrite**, not before
- **Design:** `2026-07-21-ads-layer-responsibility-persona-late-design.md` (OP3)
- **Targets:** `content/knowledge/ad/strategy.md`, `content/knowledge/ad/campaign-architecture.md`
- **Apply via:** the propose-approve KB flow (`propose_knowledge_revision` → human approves), or an edit to the source markdown + re-ingest. Do **not** edit the live KB ahead of the plugin rewrite.

## Finding — the KB is already broad-aligned

Design OP3 assumed the KB encodes **persona-based ad-set audiences** that the persona-late (broad / creative-led) model would have to overturn. It largely does not. The current ad KB already:

- Buys a **broad** audience at L1: `ad/campaign-architecture.md:52` — `Targeting | Phụ nữ 42-55, broad | Phụ nữ 40-60, broad`.
- Treats **persona as a creative allocation over that broad audience**, not as targeting: `ad/strategy.md:52` — *"Universal hook ads **[không target persona cụ thể]** thường hiệu quả nhất ở L1 … Chị Lan không cần ít creative hơn khi dùng universal hook."*
- Names persona as a **creative choice per layer**, not an audience segment: `ad/strategy.md:42` — *"khi viết creative cho từng layer, ưu tiên persona nào."*

So the audience side is already broad. The gap is only in **how persona relates to the layer**: today the KB pairs persona with a layer (a per-layer persona allocation / quota); the persona-late model **decouples** persona from the layer — persona is chosen at the **angle (brief)**, and the layer is a deployment property.

## Proposed revisions (small, gated)

1. **`ad/strategy.md` — creative-allocation framing (≈ lines 28, 42–52, 160, 162, 168–169).**
   - Reframe *"creative strategy (persona × layer)"* and the per-layer persona allocation (the L1 `50/30/20` Hương/Mai/Lan quota; *"phân bổ persona"*) as a **plan-level coverage target** over `subject × persona × route`, decoupled from the layer. Persona is chosen at the **angle**; the layer follows from the angle's awareness-stage at deployment.
   - Keep the existing broad-audience + universal-hook guidance verbatim — it is already correct and reinforces the model.

2. **`ad/campaign-architecture.md` — steering source (≈ lines 24, 32, 52).**
   - Note that the per-ad-set creative steering (persona/value/frame/register on `ad_plan_slots`) is **retired**: ad sets are media-only (audience/objective/budget/placement); persona/route live on the **brief**. (Mirrors the plugin `ssc-ads-blueprint` dissolution.)
   - The L2 omnipresence model and the tier KPIs are unchanged.

3. **No change** to `brand/angles.md` value/frame/against/entry/experience vocabulary — those dimensions stay as KB reference vocabulary; they simply stop being welded onto ideas as structural tags (a skill change, not a KB change).

## Why gated (not applied now)

The live skills (`ssc-ads-ideate`, `ssc-ads-brief`, `ssc-ads-approaches`, …) read these docs **verbatim** every run. Revising them to the persona-late framing **before** those skills are rewritten would make the operators' current runs read new guidance their logic doesn't implement — the same desync hazard as the Contract phase. So these revisions ship **together with the plugin-skills rewrite (Deferred 2)**, through the normal propose-approve KB gate, and are owned by that cycle.
