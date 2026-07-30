# Canon sweep: which direct-response frameworks earn a place?

Type: research
Status: resolved
Parent: ../map.md

## Question

Survey the published direct-response and advertising canon and bring back the frameworks
that could plausibly govern a Cambridge Diet Vietnam ads pipeline — what each one claims,
what it demands as input, what it produces, and where practitioners say it breaks.

Cover at minimum: Schwartz's awareness + market-sophistication ladders, Ogilvy's
research-led doctrine, the classic copy skeletons (PAS, AIDA, BAB, 4Ps, FAB), the
lead-type taxonomy (Makepeace's six leads), hook/angle theory as used in modern paid
social, and whatever current Meta creative-strategy doctrine says about creative volume,
hook mechanics and testing structure.

For each: is it a *structure* (how a piece is assembled), a *diagnostic* (which structure
to pick), or a *generator* (how to find something to say)? That classification is what the
application table later hangs on.

### Required coverage (named by the operator, 2026-07-29)

Every flow below must appear in the writeup, verified against primary sources rather than
taken on trust — grouped by the job it does:

- **Problem-led**: PAS (Problem → Agitate → Solution); PASO (…→ Outcome); PASTOR
  (Problem → Amplify → Solution → Transformation → Offer → Response); Five Objections
  (no time / no money / won't work for me / don't believe you / don't need it).
- **Attention-led**: AIDA; AIDCA (Conviction before Action); ACCA (Awareness →
  Comprehension → Conviction → Action); SLAP (Stop → Look → Act → Purchase).
- **Transformation / story**: BAB (Before → After → Bridge); Star–Story–Solution;
  Hook–Story–Offer.
- **Feature translation**: FAB; FABV (adds Value/proof); 4 C's (Clear, Concise,
  Compelling, Credible — a filter, not a sequence).
- **Proof / persuasion**: 4 P's (Picture → Promise → Prove → Push); QUEST (Qualify →
  Understand → Educate → Stimulate → Transition); RMBC (Research → Mechanism → Brief →
  Copy — an intake process, not a copy shape); the 12-step VSL.
- **Headline-only**: 4 U's (Useful, Urgent, Unique, Ultra-specific).
- **The router above all of them**: Schwartz's awareness × sophistication grid — the
  operator's position is that this is the one that matters and the rest are largely
  interchangeable once the reader is placed. Test that claim, and report the canonical
  mapping (AIDA when problem-unaware, PAS when problem-aware/solution-unknown, FAB or BAB
  at solution comparison, PASTOR when warm) plus any source that disagrees with it.

Two operator claims to verify and source: that **layering beats picking** (one long piece
may open BAB, deepen with PAS, close with AIDA), and that frameworks guarantee structure
but not results — hence **3–5 variations per ad set, each on a different framework or
angle**, letting delivery sort it out. Report the evidence for the variation count
specifically; it feeds
[What makes N variations different](./08-variation-mechanics.md).

Also report the length/format constraint each flow implies for paid social — notably
whether PAS's fit for short-form Meta/IG really turns on the ~125-character primary-text
fold.

Do not choose the set — this ticket reports the field. The choice is
[Framework spine](./04-framework-spine.md).

Write findings to `.scratch/ads-doctrine/research/canon.md`.

## Answer

Findings: [`research/canon.md`](../research/canon.md) — ~900 lines. All required flows
covered with claims / inputs / output / failure modes / paid-social length fit / class.
Master table §9, disagreement register §10 (18 conflicts), attribution corrections §11,
gaps §12.

**The field is nearly all structure.** Genuine *generators* — things that find something to
say — are only RMBC (research + mechanism), Five Objections, FAB, Star–Story–Solution, VOC
mining, ad-library teardown, the Denney/Levinger taxonomies, and Ogilvy's homework →
big-idea. Genuine *diagnostics* are only the Schwartz grid, the Great Leads mapping,
ACCA/DAGMAR, Hook–Story–Offer as triage, Motion's metric triads, 4 U's, 4 C's, and Meta's
own A/B guidance. Everything else is a structure — which means adopting more structures
does nothing for the blandness problem; that is a generator shortage.

**The three claims, tested:**

1. **Schwartz as router — half-supported.** Primary sources (Masterson & Forde) map
   awareness to **lead type**, not to a copy formula. The AIDA / PAS / FAB-BAB / PASTOR
   mapping appears **only on low-tier SEO blogs**; a competing blog mapping puts BAB at
   retention and QUEST at decision. Palmer argues three axes, not one — format, audience
   temperature, offer complexity. And the flows are **not interchangeable**: they differ in
   beat count, required proof assets, and artifact length.
2. **Layering beats picking — true in general, not as stated.** The principle has
   practitioner support (long formulas are literally compositions), but the specific
   BAB → PAS → AIDA order **has no source**, and every layering source gives a different
   order. Every example is long-form, which yields the usable rule: **layer on the
   destination, pick on the ad.**
3. **3–5 variations per ad set — no first-party evidence, past or present.** Meta's old
   "6 or fewer creatives per ad set" line was **withdrawn** (removal documented, tied to
   Andromeda); Meta now says "creative diversification", and ASC tests up to 150
   combinations. The binding constraint is **spend per creative, not creative count**.
   Brkfst: ~2% of creatives win. The *qualitative* half survives and is first-party-backed —
   Meta itself calls CTA/headline swaps **iteration, not diversification**.

**The ~125-character fold is real but misused.** Meta's own guide gives primary text 50–150
and headline 27, truncating around 125 behind "See more". That argues for a **first-beat
rule**, not for choosing PAS.

**Attribution errors to not repeat**: the six leads are Masterson & Forde, **not Makepeace**;
the 12-step VSL is DigitalMarketer's (Edwards' own has 10); ACCA is Colley/DAGMAR 1961;
Star–Story–Solution is not Collier; FABV's V is *Value*, not Verification; SLAP and Five
Objections have no traceable originator — and SLAP's letters name funnel events rather than
writing beats, so it recommends excluding SLAP as a copy structure.

**Hard constraint surfaced.** Meta's Personal Attributes policy bans second-person
body/health assertions, with worked examples — which forbids the literal opening move of most
problem-led canon (PAS's *Problem*, BAB's *Before*, VSL steps 2–4) when applied to weight.
4 U's urgency + ultra-specificity systematically manufacture non-compliant headlines unless
gated. RMBC's **problem-mechanism** is the one high-leverage beat that persuades without an
outcome claim. Carried into [Opening beat vs Personal Attributes](./14-opening-beat-policy.md).

**No independent efficacy evidence exists for any copy framework** in the whole document.
The only third-party-auditable evidence in the field (Ehrenberg-Bass, Binet & Field) disputes
the direct-response tradition's premises outright.
