# Where the doctrine lives

Type: grilling
Status: resolved
Parent: ../map.md

## Question

Once a framework set is chosen, where does it physically live so the pipeline can act on
it — BrandOS knowledge docs read live, prose baked into the skills, or a split?

The repo's standing rule says doctrine belongs in the KB and skills reference it live,
because the KB is revised on its own cadence and a baked-in copy silently goes stale.
But a framework is not persona content: some of it is *structural* (which stage does
what), and structure that lives in a doc a skill merely reads may not actually bind.

Decide the boundary: what must be skill prose (structure, stage contracts, gates), what
must be a live-read KB doc (the frameworks themselves, hook mechanics, proof types,
register rules), and what the skill is obliged to say about reading it. The answer sets
the shape every later decision on this map is written in.

## Answer

**Split: skills hold structure, the KB holds all judgement — and the doctrine lands as one new
doc for the spine plus edits to the docs that already own each operational surface.**

### The boundary

**Skill / agent prose keeps only what the pipeline *is*:** stage order and each stage's
consumed/emitted contract; which MCP tools it calls; where the human gates sit; the
propose-only invariant; and the instruction to **read named KB docs live every run**. This is
structure — it changes when the pipeline changes, which is exactly when a skill is edited
anyway.

**The KB holds everything that is a judgement**, because it is revised on its own cadence and a
baked-in copy goes stale silently *and* overrides the live doc it was meant to mirror: the lead
taxonomy and its awareness mapping, the floor, the four proof families and their refusals, the
permitted opening frames, the register vocabulary, the coverage axes, the mechanism.

The floor is **not** duplicated into skill prose as a safety net, despite the temptation. Two
sources of truth for a compliance rule is precisely the drift this repo has already been burned
by, and `ad/creative-guidelines` §4.3 vs `brand/angles` §5 is a live example of what it costs.
The existing convention holds instead: **a failed KB read stops the run** — it never falls back
to a remembered version.

### Where each piece lands

| Doctrine element | Home | Why there |
|---|---|---|
| The spine, its rationale, and the honest statement that no efficacy evidence exists | **new doc** (`ad/copy-doctrine` or similar) | Nothing owns this ground; it is the one genuinely new artefact |
| Lead taxonomy + awareness→lead mapping | `craft/awareness-framework` | It already holds the Schwartz grid the leads hang off |
| The six-item floor | `craft/copy-floor` | It is already the checklist the writer runs |
| Permitted opening frames + the **person rule** | `rules/banned-words` or a sibling in `rules/` | It is a compliance constraint, not a craft preference — though the doc is a word-substitution table and this rule is grammatical, so a sibling may be cleaner than stretching it |
| Coverage axes | `ad/creative-guidelines` §4.3, **reconciled** | §4.3 already mandates in-batch diversity in different words; two overlapping statements is the failure mode to avoid |
| Proof families, adopted and refused | `brand/proof-points` (families) + `rules/compliance` (the refusals and their legal basis) | Each already owns its half |
| Register values | `voice/founder-voice` — **unchanged** | The three registers already exist; the doctrine cites them and invents nothing |
| Per-layer close job | `ad/layer-tones` / `ad/creative-guidelines` §3 | They already hold the layer→CTA/tone rule; it is restated as a *job*, not a phrasing table |
| The mechanism as a named required element | **new doc**, with `craft/copy-floor` enforcing it | It has no home anywhere today |

### Consequences to carry forward

- **This is a KB-write effort as much as a skill-rewrite effort.** Several docs change, and KB
  revisions are propose-only — a human approves each in the Knowledge dashboard. The rewrite
  therefore cannot be sequenced as "edit skills, done": the doc edits must land and be approved
  **first**, or the skills will read live docs that contradict them.
- **Sequencing is now fully determined**: `content`-repo schema fields
  ([06](./06-brief-model.md)) → KB doc edits approved → skill/agent rewrite → republish the
  ChatGPT bundle. Each step has a dependency on the one before it.
- **Two pre-existing inconsistencies should be fixed while in there**, since the doctrine touches
  both docs anyway: `ad/creative-guidelines` §4.3 vs `brand/angles` §5, and the KB-sync note that
  says creative-guidelines wins until angles is updated.
