# Observed ads — Meta Ad Library, Vietnam, 2026-07-30

Method: Playwright against `facebook.com/ads/library`, country=VN, `active_status=active`,
sorted by total impressions. Two exact-phrase queries: `"giảm cân"` (~11,000 active results)
and `"giảm cân khoa học"` (~230). Raw captures: `adlib-batch1.json`, `adlib-batch2.json`
(~45 distinct live ads, primary text as served).

**The Ad Library is reachable and needs no login.** The prior sweep's `socket hang up` was a
fetch-layer failure, not a block — the earlier conclusion that creative patterns could only be
reached indirectly is **withdrawn**. Everything below is observed primary text, not inference.

Caveat that remains: this is *what is running*, not *what works*. Impression-sorted ordering is
a proxy for spend, not for return, and the Library shows no performance data.

---

## 1. Character obfuscation is the category's signature tactic

Observed repeatedly, in unrelated advertisers: `G.iảm C.ân`, `m.ỡ`, `in.sulin`, `má.u`,
`gi.ả.m 3-5 kí`, `X.ÀI`, `CH.Ê`, `giảm bé*`, `L,trình`. Periods and asterisks inserted mid-word.

This is deliberate evasion of automated **text** detection — the advertisers plainly believe
string matching is what enforcement consists of. The indirect sweep guessed at a "euphemism
treadmill" (substituting *kiểm soát cân nặng* for *giảm cân*); the reality is cruder and more
widespread: they keep the banned word and break it with punctuation.

Directly relevant to us in one way only: it establishes that **the category's compliance
posture is evasion, not substitution**. Cambridge cannot use this — a broken word is still the
claim, `NĐ 15/2018` addresses content not spelling, and it would sit absurdly beside a brand
whose differentiator is documentation. Worth naming explicitly in the doctrine as a refused
device, because it is now demonstrably normal in the category and will be observed by anyone
studying competitors.

## 2. Meta's Personal Attributes policy is not enforced here in practice

Live, active, high-impression ads open with exactly the second-person body assertion the policy
forbids:

- *"Bạn đang mệt mỏi vì ăn kiêng khắc nghiệt mà cân vẫn không giảm?"*
- *"Vòng 1 nhỏ – kém săn chắc – thiếu tự tin khi mặc đồ ôm?"*
- *"TỦ ĐỒ ĐẦY ẮP NHƯNG BẠN VẪN LUÔN NÓI: 'ĐỂ KHI NÀO GIẢM CÂN RỒI MẶC!'"*

**This is a material correction to the premise behind
[the opening-beat decision](../issues/14-opening-beat-policy.md).** That ticket treated the
person rule as the binding constraint that made the category's pain-mirror hook unavailable.
The rule is real in policy, but the market shows it is not reliably enforced for
Vietnamese-language weight-loss ads — so the constraint is a **risk position we are choosing**,
not a wall everyone faces. The four permitted opening frames remain defensible (they carry no
rejection risk, no legal exposure, and they suit the brand's voice), but the doctrine should
say plainly that competitors do the forbidden thing and are not being stopped. Otherwise the
first person to look at the Ad Library will conclude the doctrine is misinformed.

## 3. Numeric outcome claims are ubiquitous and equally unenforced

*"BAY NGAY 5KG"*, *"giảm được 8-9KG"*, *"từ 72 xuống 64cm"*, *"cấp tốc gi.ả.m 3-5 kí"*,
*"1 tháng mà đã giảm đc 4KG"*. `NĐ 15/2018` forbids promising specific figures and
`rules/banned-words` bans the construction outright — the market ignores both.

Same conclusion as §2: our refusal to quote outcome numbers
([12](../issues/12-proof-problem.md)) is a deliberate position, not a level playing field. It is
also where the brand's actual advantage lies, since it holds real third-party numbers it
declines to shout.

## 4. Clinical citation IS present — the gap is narrower than reported

`market.md` listed "named clinical evidence in Vietnamese" as a gap nobody fills. Observed
otherwise:

- **Unicity / Feel Great**: *"được cấp bằng sáng chế quốc tế"*, *"được chứng minh lâm sàng"*,
  *"nằm trong dược điển thư PDR"*.
- **Vitabiotics**: *"Hiệu quả của sản phẩm được đánh giá trong nghiên cứu đăng tải trên thư
  viện y khoa Hoa Kỳ (Pubmed)"*, with `(*)` / `(**)` footnote markers qualifying the claim — a
  visibly compliance-shaped citation pattern worth copying structurally.

So the finer, still-true gap is **independent third-party university RCTs**: what is on offer
is patents, publisher-indexed studies and self-referenced trials. Cambridge's Glasgow/Newcastle
and Oxford evidence is a different class, and `brand/positioning` already draws exactly this
distinction against MLM "clinical" language. The gap claim in the doctrine should be tightened
from "clinical evidence" to "independent third-party trials" — otherwise it is refutable in one
Ad Library search.

## 5. Mechanism-as-explanation is still absent — the strongest finding for us

Plenty of ads list *what the product does* (appetite control, energy, fibre, personalised
route). None observed explains **why previous attempts failed** or **why the body responds as
it does**. The nearest approaches are ingredient lists and benefit bullets.

This confirms [the spine](../issues/04-framework-spine.md)'s central bet from observed evidence
rather than from the canon: the mandatory mechanism beat is genuinely unoccupied ground in this
category, and it is compliant precisely because it explains rather than promises.

## 6. Formats, CTAs and destinations

- **Destination is overwhelmingly Messenger** (`Send message` CTA on most cards), plus
  comment-solicitation (*"Comment 'QUAN TÂM'"*, *"Khách hàng Comment Nhanh Sớm Nhất"*) and bare
  hotline numbers in copy. Confirms [13](../issues/13-what-the-ad-is-for.md)'s conclusion as the
  category norm — and note the comment/phone solicitations are things
  `rules/organic-vs-paid-firewall` forbids us.
- **Video dominates** the high-impression set (visible `0:00 / 1:06`-style durations), 30s–3m,
  with several ads sharing one creative across 2–7 ads.
- **Stylised Unicode bold** (`𝐁𝐀𝐘 𝐍𝐆𝐀𝐘 𝟓𝐊𝐆`) is standard for emphasis, since Facebook offers no
  bold. Emoji density is high and functions as bullet structure.
- **Copy runs long** — many primary texts exceed 1,000 characters, well past the fold. So the
  category does not treat the ~125-char truncation as a hard budget; it writes long and lets
  interested readers expand. Consistent with the per-lead fold diagnostic in
  [07](../issues/07-copy-application-table.md) rather than with a miniature-summary rule.
- **Discount/scarcity is the default close**: *"SALE 50%"*, *"MUA 2 TẶNG 1"*, *"DUY NHẤT HÔM
  NAY"*, *"Dành TẶNG 20 Xuất Ưu Đãi Đặc Biệt Cho Khách hàng Comment Nhanh Sớm Nhất"*,
  *"Ưu đãi đầu xuân 2026 chỉ 99k"*.

## 7. The closest structural competitors are coached gyms, not supplement sellers

`TD FIT Private`, `Xnivifit` and similar sell a **1:1 coached, personalised route** — the same
shape as Cambridge's specialist model — and use the same vocabulary: *lộ trình cá nhân hóa*,
*kèm cặp từng buổi*, *người đồng hành lâu dài*, *không nhịn ăn tiêu cực*, *không tăng cân trở
lại*. One even runs a named client's month-one result as its story.

This matters for positioning: the *companionship* claim is **not** unoccupied, even though it is
absent from the supplement half of the category. What those competitors lack is the
documentation and the independent evidence, not the coach.

## 8. First-person affiliate testimonial is a heavily-run device

The `Mẹ Cốm` ads (7 and 5 ads on one creative) are written as a personal product review —
*"Mình đã đánh giá 5⭐️ ngayyy sau khi dùng…"* — by a page that is not the brand. Structurally
this is the Story lead in first person, which our doctrine permits; what makes it
non-transferable is that the speaker is an affiliate reviewer making outcome claims, which after
1 Jan 2026 carries personal liability. Kiều My's own 20-year continuity story occupies the same
*shape* legitimately.

---

## What this changes in the map

1. **Withdraw** the "no live ad was ever reached" caveat on
   [the market teardown](../issues/02-market-teardown.md).
2. **Tighten** the clinical-evidence gap claim to *independent third-party university trials*.
3. **Reframe** the person rule and the no-numbers rule as chosen risk positions, since the
   market violates both without visible consequence.
4. **Add** character obfuscation to the refused-devices list.
5. **Note** that companionship/coaching language is already occupied by coached gyms.
6. **Confirm** the mechanism beat as genuinely unoccupied — the doctrine's strongest bet.
