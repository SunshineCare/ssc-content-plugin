# Reach the actual ads

Type: task
Status: resolved
Parent: ../map.md

## Question

[Market teardown](./02-market-teardown.md) never reached a single live ad — Meta Ad Library
(VN, `giảm cân`) hung up the socket, TikTok Creative Center rendered an empty JS shell. Its
whole creative-pattern picture is second-hand.

Get eyes on the real thing: drive a browser (Playwright is available in this session) through
the Meta Ad Library for Vietnamese weight-loss, meal-replacement and diet-coaching
advertisers, and capture a corpus worth reasoning about — the primary text, the hook line,
the format, the proof device, the CTA and the destination surface, for enough ads to see
what repeats.

Resolved when there is an observed-ads file alongside the indirect one, and the indirect
findings have been marked confirmed, contradicted, or still-unverified against it. If the
Ad Library cannot be driven either, say so plainly and record what was tried — the doctrine
then knowingly rests on indirect evidence, which is a fact later tickets must carry.

Write to `.scratch/ads-doctrine/research/ads-observed.md`.

## Answer

**The Ad Library is reachable with a real browser and needs no login.** The prior sweep's
`socket hang up` was a fetch-layer failure, not a block, so the "indirect evidence only"
position is withdrawn. ~45 live ads captured across two exact-phrase queries
(`"giảm cân"` ~11,000 active results; `"giảm cân khoa học"` ~230), impression-sorted.

Findings: [`research/ads-observed.md`](../research/ads-observed.md); raw primary text in
`research/adlib-batch1.json` / `adlib-batch2.json`.

Six things the observed corpus changes, three of which correct earlier tickets:

1. **Character obfuscation is the category's signature tactic** — `G.iảm C.ân`, `m.ỡ`,
   `gi.ả.m 3-5 kí`, `má.u`. Advertisers break banned words with punctuation to defeat string
   matching. The indirect sweep guessed at substitution; the reality is evasion. Add to the
   refused-devices list — a broken word is still the claim, and it would sit absurdly beside a
   brand whose differentiator is documentation.
2. **Meta's Personal Attributes policy is not enforced here in practice.** Live, active,
   high-impression ads open with exactly the forbidden second-person body assertion. So
   [14](./14-opening-beat-policy.md)'s constraint is a **risk position we choose**, not a wall
   everyone faces. The four frames stay — they carry no exposure and suit the voice — but the
   doctrine must say competitors do the forbidden thing unpunished, or the first person to open
   the Ad Library will think it misinformed.
3. **Numeric outcome claims are ubiquitous and equally unenforced** — *"BAY NGAY 5KG"*,
   *"72 xuống 64cm"*. Same reframing for [12](./12-proof-problem.md)'s no-numbers rule.
4. **Clinical citation is already present** — Unicity cites patents and the PDR; Vitabiotics
   cites a Pubmed-indexed study with asterisk-qualified footnotes. So the gap is **not**
   "clinical evidence in Vietnamese" as `market.md` claimed, but **independent third-party
   university trials** — a distinction `brand/positioning` already draws. Tighten the claim or it
   is refutable in one search.
5. **Mechanism-as-explanation is genuinely absent.** Plenty of ads say what a product does; none
   explains why previous attempts failed or why the body responds as it does. This confirms
   [the spine](./04-framework-spine.md)'s central bet from observation, not from the canon.
6. **The closest structural competitors are coached gyms, not supplement sellers** — they sell a
   1:1 personalised route in our exact vocabulary (*lộ trình cá nhân hóa*, *người đồng hành*,
   *không tăng cân trở lại*). Companionship is **not** unoccupied ground; documentation and
   independent evidence still are.

Format notes for the application table: video dominates the high-impression set; copy routinely
runs past 1,000 characters, so the category writes long and lets readers expand — consistent
with the per-lead fold diagnostic rather than a miniature-summary rule; stylised Unicode bold and
emoji-as-bullets are the emphasis conventions; discount/scarcity is the default close; and
Messenger is confirmed as the category's destination, alongside comment- and phone-solicitation
devices that `rules/organic-vs-paid-firewall` forbids us.
