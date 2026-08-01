# Map: Ads doctrine rewrite

Label: `wayfinder:map`

## Destination

A **doctrine decision record** — the chosen ad/copy framework set, plus a per-layer
application table (strategy+plan → approaches → ideate → brief → writer) saying which
framework governs each layer and when. Free to propose redesigning any of it, including
the pipeline's stage structure, the brief model, and the monthly-plan head's shape.
Done when a later effort could rewrite the skills without re-deciding anything.

Decision-only: this map produces decisions, not rewritten skills, not KB docs, not
server changes.

> **Synthesis: [DOCTRINE.md](./DOCTRINE.md)** — the destination artifact, written from all 19
> resolved tickets (2026-07-30). The tickets remain the source of record; where the two differ,
> the ticket wins.

## Notes

- **Domain**: Cambridge Diet Vietnam (Sunshine Care) paid-social advertising, produced
  through the `ssc-content` Cowork plugin's ads pipeline
  (`ssc-ads-approaches` → `ssc-ads-ideate` → `ssc-ads-brief` → `ssc-ads-writer`,
  sharing `ssc-brief-core`, orchestrated by `ssc-ads-agent`).
- **Drivers**: ads don't perform; the skills invent their own structure instead of
  standing on proven ad doctrine; copy comes out bland and same-shaped.
- **Evidence admitted**: the published direct-response canon, and a teardown of the
  Vietnamese diet / weight-loss ad market. Nothing else grounds a decision.
- **Measurement is a design requirement, not an afterthought.** The doctrine is not specified
  by past performance — but the system it describes must **measure what it ships and adjust
  itself accordingly**. Every layer's decision on this map therefore has to answer: what does
  this choice record so a result can later be attributed to it, and what changes when the
  result comes back? A decision that cannot be measured is not finished. No efficacy evidence
  exists for any framework in this field, so the doctrine is a hypothesis set — and a
  hypothesis set with no read-back is just a preference.
- **Skills every session should consult**: `/grilling`, `/domain-modeling`; `/research`
  for the two research tickets.
- **Standing constraints to respect while deciding**: propose-only governance (no skill
  ever approves); persisted prose is Vietnamese; doctrine belongs in the KB and is read
  live, never hard-coded into a skill.
- **Governed shapes may be challenged, not quietly redrawn**: proposals that change the
  `monthly-plan-owns-the-month` spec or the BrandOS tool surface are in scope as
  *recommendations*; landing them is a separate effort in the `content` repo.
- **Delivery environment**: Meta permutes the uploaded copies, headlines, descriptions and
  images, so a produced "variation" has no stable identity as an ad. Every measurement decision
  on this map has to survive that. Precisely: there is **no "Advantage+ campaign" for
  messaging** — what runs is Advantage+ *audience*, *placements* and *creative* on an
  Engagement objective, and it is the platform **default**, not a choice made here.
- Findings from research tickets land at `.scratch/ads-doctrine/research/<name>.md`.

## Decisions so far

- [Market teardown](./issues/02-market-teardown.md) — the Vietnamese diet category runs on
  folk doctrine, not named frameworks; law and platform policy strip out its main proof
  devices (white-coat imagery is illegal, before/after is banned, KOL assertion is
  discredited and now personally liable); the funnel is ad → Messenger/Zalo inbox → consult
  on a *liệu trình*, not a checkout; the open gaps are maintenance/regain, Vietnamese-language
  clinical evidence, men, comorbidity, candour and visible compliance. **Findings are
  indirect — no live ad was ever reached**; that caveat is now **withdrawn** and two of its
  findings corrected by [Reach the actual ads](./issues/11-observe-real-ads.md).

- [Canon sweep](./issues/01-canon-sweep.md) — the canon is almost entirely *structures*;
  genuine *generators* are scarce (RMBC's research+mechanism, Five Objections, VOC mining,
  teardown, Star–Story–Solution), so blandness is a generator shortage that more skeletons
  won't fix. Schwartz routes to a **lead type**, not to a copy formula; the popular
  awareness→formula mapping is blog folklore. "3–5 variations per ad set" has **no
  first-party evidence** — the constraint is spend per creative, and Meta itself calls
  CTA/headline swaps *iteration, not diversification*. Meta's Personal Attributes policy
  forbids the literal opening move of most problem-led flows. **No independent efficacy
  evidence exists for any framework in the field.**

- [What is an ad's job](./issues/13-what-the-ad-is-for.md) — every ad's destination is a
  Messenger conversation with a consultant, no exceptions; the close must **qualify and
  pre-sell at once**, so the canon's terminal beats become a qualified invitation and
  click-maximising urgency/curiosity devices are off-doctrine. "Good" is a better-qualified
  conversation, not more of them — which the writer's current self-score does not measure.
  Whether the L1/L2/L3 layer taxonomy survives is deferred to
  [Is the layer taxonomy redundant?](./issues/15-layer-vs-spine.md).

- [The framework spine](./issues/04-framework-spine.md) — the spine is a chain, not a menu:
  **RMBC intake → Schwartz awareness → lead type (Masterson & Forde, the only primary-sourced
  mapping) → a varied toolkit**, with a **mandatory mechanism beat** in every ad. What is fixed
  is the floor law and the Messenger close impose (research, mechanism, compliant opening,
  qualifying close); what gets **varied and tested in delivery** is the lead, the structure,
  the proof device, the register and the length — no winning shape is declared in advance.
  Structures stay admitted tools carrying their own beat-count / proof-asset / length
  requirements, so a tool the available proof can't fill is unavailable for that ad. The
  awareness→AIDA/PAS/FAB-BAB/PASTOR mapping is rejected as blog folklore; SLAP is excluded;
  the 4 U's need a compliance gate; attribution corrected in five places. Adopted knowingly
  **without efficacy evidence** — chosen for what it forces the pipeline to do.

- [What Meta reports at asset level](./issues/18-meta-asset-reporting.md) — a text asset can be
  **counted but not attributed**: `body_asset`/`title_asset`/`description_asset` breakdowns
  exist but carry only impressions, clicks, spend, reach, actions, action_values — no
  results/cost-per-result — and the `messaging_referrals` webhook carries `ad_id` with **no
  asset identity**, so the **ad is the smallest attributable unit**. Delivery isn't randomised
  (divergent delivery documented by Meta's own researchers, present even inside Meta's A/B
  test), asset-breakdown interactions are invisible, and nothing Meta sanctions randomises
  below the ad. A copy row **cannot be pre-stamped** with the id it will be reported under —
  reconciliation is by exact text. Also: adding a creative to a live ad set **resets learning**;
  lift/holdout tests are unavailable to a messaging funnel; "3–5 per ad set" confirmed to have
  no first-party basis. **Its central verdict is OVERTURNED IN PART** by
  [the live probes](./issues/19-meta-api-probes.md) — see below.

- [What makes N variations different](./issues/08-variation-mechanics.md) — a batch is
  **coverage, not comparison**: dynamic creative stays, the ad is accepted as the smallest
  attributable unit, and the batch's job is to give the engine genuinely different options.
  Members must differ on **lead type, proof device, emotional register, and length/density** —
  varying wording alone is iteration, which teaches nothing. Per-item scoring becomes
  **pass/fail on the floor** (mechanism, compliant opening, proof, qualifying close) while the
  1–5 judgement moves **up to the set** and asks whether it spans the axes, with weak items
  regenerated *on their own axis* so coverage can't collapse. Count follows **spend per
  creative**, not a number — and topping up a live ad set resets learning. Reopens partially
  if [the probes](./issues/19-meta-api-probes.md) find variant identity on the referral webhook.

- [The proof problem](./issues/12-proof-problem.md) — four proof families adopted, and they are
  the pool the coverage axis draws from: **mechanism** (the mandatory floor), **institutional /
  clinical stated as existence-and-institution but never its numbers** (a kg or disease figure
  exceeds the công bố), **human proof without body imagery** (the founder's 20+ years as
  continuity, consultant spotlights, client journeys in words), and **documentation promoted to
  first-class** (the real công-bố / licence numbers in the paperwork's own wording — the gap
  nobody fills, and uncopyable by an unregistered competitor). Refused with their constraints:
  before/after, white-coat imagery, KOL assertion, guarantees, anything past the công bố. Every
  claim must trace to a live KB proof point, read live and never from memory.

- [The opening beat](./issues/14-opening-beat-policy.md) — the rule is **grammatical, not
  lexical**: address her (*chị* stays), never assert a personal attribute — a second-person
  sentence whose predicate is a body/health/failure state fails however gently phrased, which
  is what `rules/banned-words` cannot express. Four permitted opening frames, all adopted:
  **third-person story** (the compliant form of the pain-mirror), **first-person** (founder or
  consultant about herself), **situation not body**, **mechanism-first**. The ~125-char fold is
  a **per-lead diagnostic, not a template** — the only fixed check is that nothing essential is
  stranded below it.

- [Does the four-stage pipeline survive?](./issues/05-stage-structure.md) — yes, four stages,
  none added, persona-late split intact — but two get new jobs. **Approaches** becomes the
  period's voice-of-customer research + candidate-mechanism pass (RMBC's front half, in a stage
  that already existed). **Ideate** may no longer approve a subject without its **mechanism** —
  a topic with no mechanism cannot yield copy with one, which is where blandness starts.
  **Brief** keeps one-brief-=-one-persona×route and declares the awareness stage, **not** the
  lead. **Writer** owns the lead, spreading its batch across the leads that stage admits and
  **recording which lead each asset used**. Gates unchanged; propose-only untouched.
  **Amended 2026-07-30 — a FIFTH stage, Publish** — a **separate stage with its own entry point**,
  never a section the writer auto-picks (so publishing is entered on purpose, not drifted into): it
  assembles
  the `asset_feed_spec` from the approved set, re-runs the floor + set coverage, resolves **both
  linkage grains** (ad→brief FK; ad-asset→content many-to-many on exact text) and stops. **The push
  is a human dashboard click** — the agent never calls create/budget tools. This is what makes the
  measurement linkage hold by construction rather than by discipline.

- [Is the layer taxonomy redundant?](./issues/15-layer-vs-spine.md) — no: the layer was never a
  copy taxonomy, it is a **funnel role with its own KPI** (L1 qualifier scored on
  cost-per-purchase, L2 feeder scored on reach/CPM and **never** on orders, L3 closer). The
  brief declares **both** layer and awareness stage — where the ad sits and how it's judged vs
  what the reader knows. **Corrects [13](./issues/13-what-the-ad-is-for.md)**: qualify-and-
  pre-sell is per layer — L1 qualifies hard, **L2 does neither** (soft engagement; scoring it
  by orders kills the wrong ad set), L3 pre-sells hardest. Flagged for the doctrine write-up:
  §4.3's in-batch diversity rule overlaps the four coverage axes and must be reconciled, and
  its "3–4 angles per ad set" is self-declared heuristic with no research record.

- [What a brief must carry](./issues/06-brief-model.md) — schema checked live: the **mechanism
  has no home** and the coverage axes are **unrecordable** (`save_content` has only
  body/score/comment/section/format). Decided: the mechanism lives on the **idea**, referenced
  by every brief beneath it; the axes (**lead type, opening frame, proof device, register,
  length band**) become **structured, queryable fields on content** — which makes a
  `content`-repo schema change a **precondition of the rewrite**, not a follow-up. Brief fields
  triaged into bearing vs informing; `cta` demoted to *direction only*, subordinate to the
  layer's rule. Set-level coverage scoring also has nowhere to live today.

- [What survives translation into Vietnamese](./issues/10-vietnamese-adaptation.md) — the
  adaptation layer **already largely exists in the KB**, and twice reached this map's conclusions
  independently (trait 2's approved example addresses her *situation*, never her body — the
  grammatical rule from [14](./issues/14-opening-beat-policy.md); trait 1's approved example *is*
  a mechanism sentence). **Urgency is implied — neither manufactured nor disclaimed**: pressure
  tactics are off-voice (which also kills the 4 U's *Urgent*), and explicitly saying she needn't
  decide today is equally refused — it raises the pressure to disclaim it. The reason to act
  rides in the situation the copy already describes, never in a sentence about timing.
  Authority transfers **only in the founder's first person** (she is the sole narrator; no brand
  voice exists), so even clinical proof is spoken by her. Social proof survives **as narrative
  only**. Lead *shapes* transfer, their 100–600-word budgets do not — long form lives on organic
  and in the consult. **Candour adopted, bounded**: name the real difficulty, not the product's
  limits or who shouldn't buy. The **register axis takes the KB's existing Confessor / Educator /
  Friend vocabulary** — the doctrine must not invent a parallel one.

- [The copy application table](./issues/07-copy-application-table.md) — a **six-item pass/fail
  floor** (mechanism present; opening asserts nothing about the reader; every claim names its
  trace; close matches the layer's job; urgency implied, neither manufactured nor disclaimed;
  footer/banned-words clear) — a failure is a reject, not a low score. Per section: **`copy`
  carries all four coverage axes**, `headline` varies hook mechanic + proof device only (a lead
  structure doesn't fit ~27 chars), `description` varies proof + beat, `image_content` varies
  density + hook. Coverage applies per section because **Meta permutes sections independently** —
  a single-flavour headline pool bottlenecks everything. The fold is a **per-lead diagnostic**;
  the only check is that nothing essential is stranded below it. **Batch size left deliberately
  unset** — no data to fix a cadence; the invariant is that whatever N is asked for must span
  that section's axes. Self-score becomes floor pass/fail per item + coverage per set; the old
  1–5 brand-fit judgement is demoted to a secondary signal and may never be why a set ships.

- [Where the doctrine lives](./issues/03-doctrine-home.md) — **skills hold structure, the KB holds
  all judgement.** Skill prose keeps stage order/contracts, tools, gates, propose-only, and the
  instruction to read named docs live; every revisable rule lives in the KB. The floor is
  deliberately **not** duplicated into skill prose — a failed KB read stops the run instead.
  Landing shape: **one new doc for the spine + the mechanism**, edits into the docs that already
  own each surface (`craft/awareness-framework` ← leads, `craft/copy-floor` ← floor, `rules/` ←
  person rule, `ad/creative-guidelines` §4.3 ← coverage *reconciled*, `brand/proof-points` +
  `rules/compliance` ← proof, `ad/layer-tones` ← per-layer close job); `voice/founder-voice`
  unchanged. **Sequencing now fully determined**: content-repo schema → KB edits approved → skill
  rewrite → republish the ChatGPT bundle. This is a KB-write effort as much as a skill rewrite,
  and KB revisions are propose-only, so the doc edits must be **approved first**.

- [How the system measures what it ships](./issues/17-testing-loop.md) — **the loop already
  exists**: `get_term_performance` attributes both sides to taxonomy terms by `kind` and is
  already the monthly Review's input. So the coverage axes land as **new taxonomy KINDS** (lead
  type, opening frame, proof device, register, length band) — **superseding 06's "columns"** —
  because terms are read the day they're populated, validate on write, and keep the rosters open;
  a JSON blob is invisible to that reader and swallows typos silently. Cadence splits: **monthly
  Review ranks, doctrine changes only quarterly** (~2% of creatives win and delivery isn't
  randomised, so a month's ranking is mostly noise). The honesty fields are part of the doctrine —
  when `complete` is false the degradation is stated, page and ads sides may never be merged, and
  no frequency may be derived from `reach_day_sum`. **Precondition nobody owns yet: the
  ad→content linkage** — without it every axis tag is written and never read. **Checked live
  2026-07-30: it is entirely unpopulated** — 138 ads / 1.37M impressions / 144.4M VND / 882
  conversations over 90 days, all `no_content_link`, `no_term: 0`, coverage complete. So this is
  **Step 0 of implementation**, not a risk to monitor.

- [Does evidence-based marketing get a say?](./issues/16-evidence-based-counter-tradition.md) —
  yes, as **three checkable rules**, not a philosophy or a spend ratio (the account already
  implements the tradition unnamed: L2 is a reach/CPM feeder, person-led creative wins cheap
  reach, creative does the targeting under Advantage+ broad). **(1) Distinctive-asset
  consistency** — the brand's identifiers recur; **coverage varies the argument, never the
  identifiers** — the necessary counterweight to [08](./issues/08-variation-mechanics.md).
  **(2) Never score a feeder by conversion**, promoted from layer note to doctrine — the most
  consequential misreading available. **(3) Reach breadth over narrow targeting** — persona lives
  in the creative, not the audience; it also explains why L1 ad sets hold one persona for signal
  consistency. Not adopted: the 60/40 spend split (FMCG-derived) or any anti-persuasion claim.

- [Reach the actual ads](./issues/11-observe-real-ads.md) — the Ad Library **is** reachable
  (browser, no login; the earlier failure was fetch-layer). ~45 live ads captured. Corrects three
  earlier conclusions: **Personal Attributes is not enforced** for VN weight-loss ads and neither
  is the ban on numeric outcome claims — so [14](./issues/14-opening-beat-policy.md)'s and
  [12](./issues/12-proof-problem.md)'s rules are **chosen risk positions**, which the doctrine
  must say out loud; and **clinical citation already exists** in the category, so the gap is
  *independent third-party university trials*, not "clinical evidence". Adds **character
  obfuscation** (`G.iảm C.ân`) to the refused devices. Confirms **mechanism-as-explanation is
  genuinely absent** — the doctrine's strongest bet, now observed rather than argued. Warns that
  **companionship language is already occupied** by 1:1 coached gyms using our exact vocabulary.

- [Probe the Meta API](./issues/19-meta-api-probes.md) — run read-only against the live account
  (`act_2474848802833161`, confirmed as Cambridge; Graph v24.0; token from `content/.env`).
  **Messaging conversions DO survive the text-asset breakdowns**, with `cost_per_action_type`
  per asset — 748 conversations started across 98 distinct body assets in 90 days. So
  **copy-level outcome attribution is available today** and
  [08](./issues/08-variation-mechanics.md)'s conditional has fired: a batch stays *coverage* at
  production time (delivery isn't randomised, so nothing is causal) but its members can now be
  **scored after the fact**. Aggregate by **exact text, not asset id** — 77 texts minted 98 ids.
  `adlabels` unnecessary. P4 (webhook variant) still open but demoted. Write-probes (P2 create,
  P5) deliberately not run — real spend. Incidentally: the account's two best-delivering copies
  already sit inside [14](./issues/14-opening-beat-policy.md)'s permitted frames.

- [What strategy and the month owe ads](./issues/09-strategy-plan-layer.md) — the line is
  **volume/budget = head (`detail`, refused from the channel), creative coverage shape = channel**:
  `creative_target` (persona × route × count) is authored by the repurposed **Approaches** step,
  which also repairs a live defect — Ideate consumes that field and nothing has written it since
  Focus was retired. Handed down: the **market-sophistication read** from the *quarterly* cycle
  (it sets how indirect a lead must be, and re-deriving it monthly would churn); the **proof
  inventory** and the **offer/promotion state** from the month (the writer can't verify either, and
  without the latter there is no legitimate timeliness at all); themes already arrive via
  `tactics`. Head keeps its four steps and its single gate — the additions are **fields, not
  steps**. Review still the only look-back, now ranking the coverage-axis kinds too.

## Not yet specified

- How the doctrine gets validated before anyone rewrites skills against it — a test set
  of past concepts run through the new structure? a bakeoff? Can't phrase this sharply
  until the structure exists.
- What happens to briefs and copy already approved under the old model when the structure
  changes — carry-over, re-brief, or leave the past alone.
- Whether the agent-level orchestration and its human gates change shape once the stage
  structure is settled.
- Whether the image-prompt chain's grounding (it reads the brief + approved copy) needs
  anything different from a redesigned brief.
- Whether compliance becomes a pipeline step of its own rather than a rule the writer
  carries — the claim/disclaimer/công-bố constraints are now known to be hard, checkable,
  and penalised by suspension, but where they get enforced can't be placed until the stage
  structure is settled.
- Whether the doctrine should deliberately take one of the market's open gaps as a position
  (maintenance, men, candour, visible compliance) or stay neutral on positioning — this is
  strategy's call and may belong to the quarterly cycle rather than to ads doctrine.

## Out of scope

- **Mining our own Facebook performance history to *choose* the doctrine.** Ruled out as an
  evidence source for the decisions on this map — they stand on canon + market teardown alone.
  **This is not a ruling against measurement**: designing measurement into the system is a
  requirement of the destination (see Notes), and [How the toolkit learns from what
  ships](./issues/17-testing-loop.md) owns it. What is out of scope is letting past numbers
  pick the frameworks now.
- **Implementing the rewrite** — editing skills, authoring KB docs, changing the BrandOS
  server or its data shape. This map decides; a later effort builds.
