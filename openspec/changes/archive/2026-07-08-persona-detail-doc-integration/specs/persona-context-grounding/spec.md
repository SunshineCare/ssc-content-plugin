## ADDED Requirements

### Requirement: Persona detail-doc path resolution

Any skill that resolves a specific persona (via a `kind='persona'` tag's `code`, or via a name looked up in `brand/personas`) SHALL derive that persona's KB detail-doc path mechanically as `brand/persona-<slug>`, where `<slug>` is the persona's taxonomy `code` with the `chi-` prefix removed. No skill SHALL hardcode a literal mapping table of persona name → doc path; the rule SHALL be stated as the derivation above so it holds for any persona present in `brand/personas`, including ones added after this change ships.

#### Scenario: Resolving a known persona code

- **WHEN** a skill holds a persona tag with `code = 'chi-huong'`
- **THEN** it resolves the detail-doc path as `brand/persona-huong`

#### Scenario: A persona not yet coded

- **WHEN** `brand/personas` lists a persona with no corresponding taxonomy term yet (e.g. Chị Thảo before her `chi-thao` term exists)
- **THEN** skills that tag ideas MUST NOT invent a placeholder code or id for her, and MUST surface to the operator that she cannot be tagged yet

### Requirement: Single-target skills load exactly one persona detail doc

Skills that resolve ONE idea or concept already carrying a known persona tag (`ssc-post-produce`, `ssc-ads-writer`, `ssc-ads-brief`, `ssc-video-script`) SHALL, after reading that persona tag, add the ONE resolved `brand/persona-<slug>` path to their knowledge-base load step, in addition to `brand/personas`. They SHALL NOT load all four persona detail docs when only one persona is in play for the run.

#### Scenario: Writing copy for a resolved idea

- **WHEN** `ssc-ads-writer` resolves an approved ad concept tagged `persona = chi-mai`
- **THEN** its knowledge-base load includes `brand/persona-mai` (not `brand/persona-huong`, `-lan`, or `-thao`) alongside `brand/personas`

### Requirement: Batch skills load all four persona detail docs

Skills that generate or research content across every persona within a single run (`ssc-post-ideate`, `ssc-ads-ideate`, `ssc-youtube-ideate`, `ssc-strategy-audience-intelligence`, `ssc-strategy-kol-discovery`, `ssc-strategy-territory-explorer`, `ssc-ads-blueprint`, `ssc-ads-approaches`) SHALL add all currently-documented persona detail-doc paths to their knowledge-base load step, resolved from whatever `brand/personas` currently lists — not a fixed count of four hardcoded into the procedure.

#### Scenario: Generating the month's post ideas

- **WHEN** `ssc-post-ideate` loads its knowledge base for a new ideation run
- **THEN** it loads `brand/persona-huong`, `brand/persona-lan`, `brand/persona-mai`, and `brand/persona-thao` (every detail doc `brand/personas` currently points to), alongside `brand/personas` itself

### Requirement: No hardcoded persona name or count

No skill or agent SHALL hardcode the number of personas (e.g. "3 archetypes")
or a literal enum of persona names (e.g. `'Chị Lan' | 'Chị Hương' | 'Chị Mai'`).
Every reference to "the personas" or "the archetypes" SHALL defer to
`brand/personas` as the live source of truth for both the count and the names.

#### Scenario: Archetype-presence check no longer assumes a fixed count

- **WHEN** `ssc-ads-ideate` checks archetype presence across L1 slots
- **THEN** it checks against the personas currently listed in `brand/personas`, not against a hardcoded list of 3 named archetypes

#### Scenario: Idea tagging field accepts any current persona

- **WHEN** `ssc-post-ideate` sets an idea's target persona
- **THEN** it picks from the personas currently listed in `brand/personas` rather than a hardcoded three-value enum

### Requirement: Priority-tier-aware persona balance, not symmetric treatment

Skills that enforce persona balance or exclusivity across a plan/slot set (`ssc-ads-blueprint`'s `primary_persona` assignment, `ssc-ads-ideate`'s archetype-presence check) SHALL read each persona's stated priority tier from `brand/personas` (e.g. "cao nhất" / "cao" / "trung bình" / "chọn lọc") and apply balance rules proportional to that tier, rather than requiring equal presence/selection across all listed personas.

#### Scenario: A selectively-eligible persona is not forced into every L1 slot

- **WHEN** `ssc-ads-ideate` evaluates archetype presence in L1 and one listed persona is marked "chọn lọc" (selective priority) in `brand/personas`
- **THEN** the check does not require that persona's presence in L1 on the same basis as a "cao nhất" (top-priority) persona
