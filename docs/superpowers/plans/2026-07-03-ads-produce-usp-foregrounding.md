# Foreground Cambridge USPs in ad production — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/ssc.ads-produce`'s two producers load and foreground Cambridge Diet Vietnam's differentiation + proof so drafted ads press the brand's advantage instead of a generic benefit.

**Architecture:** Prose-only edits to two Claude Code skill markdown files (`ssc-ads-writer`, `ssc-ads-creative`). Each producer gains two KB paths in its `get_knowledge` load list (`brand/positioning`, `brand/proof-points`), an explicit "Differentiation & proof" drafting requirement, one new Direct-Response quality-gate line, and a matching Governance allow-list update. No executable code, no new MCP tools, no upstream/pipeline changes.

**Tech Stack:** Markdown skill definitions (BrandOS MCP surface). Verification is `grep`/`git diff` structural assertions — this repo has no test runner.

## Global Constraints

Copied from the spec ([docs/superpowers/specs/2026-07-03-ads-produce-usp-foregrounding-design.md](../specs/2026-07-03-ads-produce-usp-foregrounding-design.md)). Every task's requirements implicitly include these:

- **Propose-only (hard rule).** Do NOT add `approve_*`, `unapprove_*`, `update_status`, `update_budget`, or any publish tool to either skill. The only new capability use is read-only `get_knowledge` on two more paths.
- **No `tools:` frontmatter change.** `get_knowledge` is already listed in both skills; neither `tools:` line changes.
- **KB is the single source of truth.** Do NOT hardcode a USP list into skill prose beyond illustrative examples — the advantages/proof live in the live docs so compliance + concrete-not-slogan guardrails travel with them.
- **Both new paths are live KB docs** — verified 2026-07-03: `brand/positioning` (v4), `brand/proof-points` (v6). No other KB path is added.
- **Only two files change.** Do NOT touch `commands/ssc.ads-produce.md`, `hooks/approval-gate.mjs`, any JSON manifest, or any upstream skill (`ssc-ads-ideate`, Focus/Approaches/Blueprint).
- **Compliance language preserved** wherever proof is mentioned: no fabricated number; **26** vi chất (never 25); spell out "nghiên cữu lâm sàng độc lập" — never the "RCT" acronym; no commercial drug-brand name; no income/business-opportunity (MLM) claim.
- The two tasks are **independent files** — either can land or be rejected without breaking the other.

---

### Task 1: `ssc-ads-writer` — load + foreground USPs in ad text

**Files:**
- Modify: `plugins/ssc-content/skills/ssc-ads-writer/SKILL.md` (Step 2 load list + bullets, Step 4 drafting, Step 5 gate, Governance)

**Interfaces:**
- Consumes: `brand/positioning` (v4), `brand/proof-points` (v6) — live KB docs read via the already-listed `get_knowledge` tool.
- Produces: nothing another task depends on. Task 2 is an independent file; it does not import anything from this task.

- [ ] **Step 1: Baseline — confirm the fix is absent (the "failing test")**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
F=plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
grep -c '"brand/positioning"' "$F"; grep -c '"brand/proof-points"' "$F"; grep -c 'Presses a real advantage' "$F"; grep -c 'Differentiation & proof' "$F"
```
Expected: `0`, `0`, `0`, `0` (none present yet). Then `Read` the file so the Edits below match verbatim.

- [ ] **Step 2: Add the two paths to the Step 2 `get_knowledge` load list**

Edit — old_string:
```
    "brand/woman-to-woman",
    "brand/angles",
    "ad/creative-guidelines",
```
new_string:
```
    "brand/woman-to-woman",
    "brand/angles",
    "brand/positioning",
    "brand/proof-points",
    "ad/creative-guidelines",
```

- [ ] **Step 3: Add their entries to the "These paths are:" bullet list**

Edit — old_string:
```
- `brand/angles` — the full angle system (value / entry / against / experience dimensions, frame codes) — so the copy expresses the concept's tagged angle faithfully.
- `ad/creative-guidelines` — ad creative principles and what makes Cambridge Diet ad copy convert.
```
new_string:
```
- `brand/angles` — the full angle system (value / entry / against / experience dimensions, frame codes) — so the copy expresses the concept's tagged angle faithfully.
- `brand/positioning` — the competitive positioning: the "Cỗ Máy Bền Vững" (chuyên viên + app) and the "chúng mình hơn ở đâu" reasoning per competitor — so the copy can press the concept's `against` match-up.
- `brand/proof-points` — the credibility lookup table (real, compliant proof: 60 năm, DiRECT/DROPLET, chuẩn EU 2016/1413, 26 vi chất, chương trình 6 bước, chuyên viên 1:1, đồng hành trọn đời, app, Kiều My từ 2004) — each row names the competitor it beats.
- `ad/creative-guidelines` — ad creative principles and what makes Cambridge Diet ad copy convert.
```

- [ ] **Step 4: Add the "Differentiation & proof" drafting requirement in Step 4**

Edit — old_string:
```
Every variation is **finished Vietnamese ad text**, ready for the page to curate. Express the SAME concept (`idea.title` + its `value`/`frame`/`persona`/layer) — what varies is the hook/angle/wording, not the strategic spine.

**Authenticity guardrail — real people are real, never fabricated (read FIRST):**
```
new_string:
```
Every variation is **finished Vietnamese ad text**, ready for the page to curate. Express the SAME concept (`idea.title` + its `value`/`frame`/`persona`/layer) — what varies is the hook/angle/wording, not the strategic spine.

**Differentiation & proof — press the advantage, don't state a generic benefit (read FIRST):**

An ad that could run for any weight-loss brand wastes the impression. Every variation must lean on **≥1 concrete Cambridge advantage** drawn from `brand/proof-points` (e.g. 60 năm nghiên cứu, DiRECT/DROPLET, chuẩn EU 2016/1413, 26 vi chất, chương trình 6 bước, chuyên viên 1:1 đồng hành trọn đời, the app). When the concept carries an **`against`** tag, land *that specific* match-up using `brand/positioning`'s "chúng mình hơn ở đâu" for that competitor (e.g. `vs-eat-clean` → đủ vi chất chuẩn EU với calo kiểm soát; `vs-self-dieting` → accountability + chuyên viên đồng hành; `post-glp1` → giữ kết quả bằng thói quen + người đồng hành). Make it **concrete, not slogan** — the KB's own guardrail is that abstract "bền vững" copy underperforms; name the routine / the proof, not the adjective. This constrains *how* each variation is written; it does not add a section or change the counts. The Step 2 compliance rails still bind (no fabricated number, spell out "nghiên cứu lâm sàng độc lập" never "RCT", **26** not 25, no commercial drug-brand name, no income/business-opportunity claim).

**Authenticity guardrail — real people are real, never fabricated (read FIRST):**
```

- [ ] **Step 5: Add the Direct-Response quality-gate line in Step 5 (a)**

Edit — old_string:
```
- [ ] **Emotional resonance** — activates at least one emotional trigger true to the concept's `value`/`frame`.
```
new_string:
```
- [ ] **Emotional resonance** — activates at least one emotional trigger true to the concept's `value`/`frame`.
- [ ] **Presses a real advantage** — leans on ≥1 concrete Cambridge USP / proof point from `brand/proof-points` (not a generic benefit any brand could claim); if the concept has an `against` tag, it lands that specific match-up (`brand/positioning`). A flat, undifferentiated variation cannot score ≥4.
```

- [ ] **Step 6: Extend the Governance knowledge-path allow-list**

Edit — old_string:
```
- References only the knowledge paths in Step 2 (voice/*, brand/woman-to-woman, brand/angles, ad/creative-guidelines, ad/headline-formulas, ad/cta-catalog, content/quick-checklist, rules/{banned-words,compliance,food-placeholder}, programme/kieu-my-story). Do not call `get_knowledge` for unrelated paths.
```
new_string:
```
- References only the knowledge paths in Step 2 (voice/*, brand/woman-to-woman, brand/positioning, brand/proof-points, brand/angles, ad/creative-guidelines, ad/headline-formulas, ad/cta-catalog, content/quick-checklist, rules/{banned-words,compliance,food-placeholder}, programme/kieu-my-story). Do not call `get_knowledge` for unrelated paths.
```

- [ ] **Step 7: Verify the fix is present (the "passing test")**

Run:
```bash
F=plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
grep -c '"brand/positioning"' "$F"; grep -c '"brand/proof-points"' "$F"; grep -c 'Presses a real advantage' "$F"; grep -c 'Differentiation & proof' "$F"
echo "--- consistency: each path in array + bullet + governance ---"
grep -n 'brand/positioning' "$F"; grep -n 'brand/proof-points' "$F"
```
Expected: `1`, `1`, `1`, `1`. `brand/positioning` appears on ≥3 lines (load-list array, bullet, governance); `brand/proof-points` appears on ≥4 (those three + the pre-existing Step 3 reference).

- [ ] **Step 8: Propose-only + `tools:` guard**

Run:
```bash
F=plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
git diff -- "$F" | grep '^+' | grep -iE 'approve_|unapprove_|update_status|update_budget|\bpublish\b' || echo "OK: no mutation tool added"
git diff -- "$F" | grep -E '^[+-].*tools:' || echo "OK: tools: frontmatter unchanged"
```
Expected: both print their `OK:` line (no forbidden tool token added; `tools:` line untouched).

- [ ] **Step 9: Commit**

```bash
git add plugins/ssc-content/skills/ssc-ads-writer/SKILL.md
git commit -m "feat(ads-writer): load + foreground brand/positioning + proof-points

Ad text now presses ≥1 concrete Cambridge advantage and lands the
concept's against match-up; adds the two docs to the Step 2 load list
(fixes the Step 3 reference to proof-points that was never loaded), a
Direct-Response gate line, and the Governance allow-list. Propose-only;
no new tools.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `ssc-ads-creative` — load + foreground USPs in ad imagery

**Files:**
- Modify: `plugins/ssc-content/skills/ssc-ads-creative/SKILL.md` (description frontmatter, Step 2 note + load list + bullets, Step 3 build, Step 5 gate, Governance)

**Interfaces:**
- Consumes: `brand/positioning` (v4), `brand/proof-points` (v6) — same live KB docs, via the already-listed `get_knowledge` tool.
- Produces: nothing other tasks depend on. Independent of Task 1 (chained run reuses whatever the writer already loaded; standalone run fetches its own).

- [ ] **Step 1: Baseline — confirm the fix is absent**

Run:
```bash
cd /Users/thang/dev/ssc/ssc-content-plugin
F=plugins/ssc-content/skills/ssc-ads-creative/SKILL.md
grep -c '"brand/positioning"' "$F"; grep -c '"brand/proof-points"' "$F"; grep -c 'Presses a real advantage' "$F"; grep -c 'Differentiation & proof' "$F"
```
Expected: `0`, `0`, `0`, `0`. Then `Read` the file so the Edits below match verbatim.

- [ ] **Step 2: Add both paths to the description frontmatter's path enumeration**

Edit — old_string:
```
+ brand/visual-identity + rules/{banned-words,compliance,food-placeholder}, then builds
```
new_string:
```
+ brand/visual-identity + brand/positioning + brand/proof-points + rules/{banned-words,compliance,food-placeholder}, then builds
```

- [ ] **Step 3: Add both paths to the "already in context when run after the writer" note**

Edit — old_string:
```
most of these paths (`brand/angles`, `ad/{creative-guidelines,headline-formulas,platform-constraints}`, `voice/founder-voice`, `content/quick-checklist`, `rules/{banned-words,compliance,food-placeholder}`, `programme/kieu-my-story`) are already in context
```
new_string:
```
most of these paths (`brand/positioning`, `brand/proof-points`, `brand/angles`, `ad/{creative-guidelines,headline-formulas,platform-constraints}`, `voice/founder-voice`, `content/quick-checklist`, `rules/{banned-words,compliance,food-placeholder}`, `programme/kieu-my-story`) are already in context
```

- [ ] **Step 4: Add the two paths to the Step 2 `get_knowledge` load list**

Edit — old_string:
```
    "brand/visual-identity",
    "brand/angles",
    "ad/creative-guidelines",
```
new_string:
```
    "brand/visual-identity",
    "brand/angles",
    "brand/positioning",
    "brand/proof-points",
    "ad/creative-guidelines",
```

- [ ] **Step 5: Add their entries to the "These paths are:" bullet list**

Edit — old_string:
```
- `brand/angles` — the angle system, so the visual expresses the concept's tagged `value`+`frame` faithfully.
- `ad/creative-guidelines` — ad creative principles + the headline-on-image legibility bar.
```
new_string:
```
- `brand/angles` — the angle system, so the visual expresses the concept's tagged `value`+`frame` faithfully.
- `brand/positioning` — the competitive positioning + "chúng mình hơn ở đâu" per competitor — so the creative can press the concept's `against` contrast.
- `brand/proof-points` — the credibility lookup table (60 năm, DiRECT/DROPLET, chuẩn EU, 26 vi chất, chuyên viên 1:1, …) — the source for the branded style's real proof line and any on-image stat.
- `ad/creative-guidelines` — ad creative principles + the headline-on-image legibility bar.
```

- [ ] **Step 6: Add the "Differentiation & proof" build requirement in Step 3**

Edit — old_string:
```
Write each HTML file descriptively: `ad-<idea-slug>-<style>.html` (idea slug = kebab-cased title, truncated). Apply the headline-font-size discipline from `ad/headline-formulas` / `ad/creative-guidelines` (shorter headline → larger; if it needs explaining it's too complex). Keep every word that appears on the image legible at 50% zoom (mobile bar).

**Authenticity guardrail (read FIRST — same three lanes as the writer):**
```
new_string:
```
Write each HTML file descriptively: `ad-<idea-slug>-<style>.html` (idea slug = kebab-cased title, truncated). Apply the headline-font-size discipline from `ad/headline-formulas` / `ad/creative-guidelines` (shorter headline → larger; if it needs explaining it's too complex). Keep every word that appears on the image legible at 50% zoom (mobile bar).

**Differentiation & proof — the creative must press an advantage:** a creative that could run for any weight-loss brand wastes the impression. Each creative leans on **≥1 concrete Cambridge advantage** from `brand/proof-points`, and when the concept carries an **`against`** tag the layout expresses *that* contrast — most naturally the **branded** style (a real proof line: "60 năm", "nghiên cứu lâm sàng độc lập", "chuẩn EU", "26 vi chất") and the **meme** style (old-way → Cambridge-way = the competitor contrast from `brand/positioning`'s "chúng mình hơn ở đâu"). Concrete, not slogan. All on-image proof stays inside the compliance rails in Step 5 (no fabricated number, **26** not 25, spell out "nghiên cứu lâm sàng độc lập" never "RCT", no commercial drug-brand name, no income/business-opportunity claim).

**Authenticity guardrail (read FIRST — same three lanes as the writer):**
```

- [ ] **Step 7: Add the Direct-Response quality-gate line in Step 5 (a)**

Edit — old_string:
```
- [ ] **Emotional resonance** — true to the concept's `value`/`frame`.
```
new_string:
```
- [ ] **Emotional resonance** — true to the concept's `value`/`frame`.
- [ ] **Presses a real advantage** — the creative leans on ≥1 concrete Cambridge USP / proof point (not a generic benefit any brand could claim); if the concept has an `against` tag, the layout lands that specific match-up. A flat, undifferentiated creative cannot score ≥4.
```

- [ ] **Step 8: Extend the Governance knowledge-path allow-list**

Edit — old_string:
```
- References only the knowledge paths in Step 2 (brand/visual-identity, brand/angles, ad/{creative-guidelines,headline-formulas,platform-constraints}, voice/founder-voice, content/quick-checklist, rules/{banned-words,compliance,food-placeholder}, programme/kieu-my-story). Do not call `get_knowledge` for unrelated paths.
```
new_string:
```
- References only the knowledge paths in Step 2 (brand/visual-identity, brand/positioning, brand/proof-points, brand/angles, ad/{creative-guidelines,headline-formulas,platform-constraints}, voice/founder-voice, content/quick-checklist, rules/{banned-words,compliance,food-placeholder}, programme/kieu-my-story). Do not call `get_knowledge` for unrelated paths.
```

- [ ] **Step 9: Verify the fix is present**

Run:
```bash
F=plugins/ssc-content/skills/ssc-ads-creative/SKILL.md
grep -c '"brand/positioning"' "$F"; grep -c '"brand/proof-points"' "$F"; grep -c 'Presses a real advantage' "$F"; grep -c 'Differentiation & proof' "$F"
echo "--- description frontmatter carries both paths ---"
sed -n '3p' "$F" | grep -c 'brand/positioning + brand/proof-points'
```
Expected: `1`, `1`, `1`, `1`, then `1` (the description enumeration includes both). Note `grep -c '"brand/..."'` counts only the double-quoted load-list occurrence; the description/bullet/governance mentions are unquoted, so the count of `1` is correct and expected.

- [ ] **Step 10: Propose-only + `tools:` guard**

Run:
```bash
F=plugins/ssc-content/skills/ssc-ads-creative/SKILL.md
git diff -- "$F" | grep '^+' | grep -iE 'approve_|unapprove_|update_status|update_budget|\bpublish\b' || echo "OK: no mutation tool added"
git diff -- "$F" | grep -E '^[+-].*tools:' || echo "OK: tools: frontmatter unchanged"
```
Expected: both print their `OK:` line.

- [ ] **Step 11: Commit**

```bash
git add plugins/ssc-content/skills/ssc-ads-creative/SKILL.md
git commit -m "feat(ads-creative): load + foreground brand/positioning + proof-points

Creatives now press ≥1 concrete Cambridge advantage and express the
concept's against contrast (branded proof line / meme old-vs-new); adds
the two docs to the Step 2 load list + note + description, a
Direct-Response gate line, and the Governance allow-list. Propose-only;
no new tools.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage** — every spec item maps to a task:

| Spec Goal / Design item | Task · Step |
|---|---|
| Producers LOAD `brand/positioning` + `brand/proof-points` | T1 S2 (writer array), T2 S4 (creative array) |
| FOREGROUND a concrete advantage; press the `against` match-up | T1 S4 (writer draft), T2 S6 (creative build) |
| Quality gate CATCHES a flat variation | T1 S5, T2 S7 (Direct-Response line, "cannot score ≥4") |
| Governance allow-list stays consistent | T1 S6, T2 S8 |
| Creative note + description enumeration consistent | T2 S2, S3 |
| Propose-only, no new tools, `tools:` unchanged | T1 S8, T2 S10 (guards) |
| KB paths are live (verified) | Global Constraints; confirmed 2026-07-03 |
| No upstream / command / hook / manifest change | Global Constraints (out of scope; no task touches them) |
| Compliance language preserved | Baked into T1 S4 / T2 S6 new prose + existing Step 5 (b) scan |

No gaps.

**2. Placeholder scan** — no `TBD`/`TODO`/"handle appropriately"; every edit shows exact old/new text and every check shows an exact command + expected output.

**3. Type consistency** — the two new path strings (`"brand/positioning"`, `"brand/proof-points"`), the gate-line marker ("Presses a real advantage"), and the block heading ("Differentiation & proof") are spelled identically across both tasks and the verification greps that assert them.
