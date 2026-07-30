# Market teardown: the Vietnamese weight-loss / meal-replacement / diet-coaching ad field

Research ticket: `../issues/02-market-teardown.md` · Map: `../map.md`
Date of research: 2026-07-29. Reporting only — no recommendations.

---

## 0. Evidence quality — read this first

**I could not reach the ads themselves.** Both primary ad-observation surfaces refused
programmatic access from this environment:

| Surface | Attempt | Result |
|---|---|---|
| Meta Ad Library (`facebook.com/ads/library`, `country=VN`, `q=giảm cân`) | 2 fetches, both keyword-search URLs | `socket hang up` — connection dropped, no HTML returned. The Library is a client-rendered React app behind bot mitigation; it cannot be read without a browser. |
| TikTok Creative Center Top Ads (`region=VN`, health) | 1 fetch | Returned the JS shell only: *"No search results found."* No ad rows in the served HTML. |

So **no claim below is grounded in a specific live ad creative that I read.** Everything is
one of four indirect evidence classes, and each finding is tagged:

- **[POLICY]** — first-party platform or statutory text. Highest trust. What the field is
  *allowed* to do, which shapes what it does.
- **[PRACTITIONER]** — Vietnamese agency/copywriting template libraries and ad-service
  pages written *for* people running these exact ads. These are the closest available
  proxy for the creative conventions: they are artifacts produced by the field, describing
  what the field does, but they are **prescriptive, self-selecting, and SEO-motivated** —
  treat as "what the category's practitioners teach", not "what is measurably running".
- **[REGULATOR/PRESS]** — Vietnamese state agency warnings, enforcement actions, and
  mainstream press reporting. Trustworthy on what the category *did* (because it was
  punished for it) and on the trust climate.
- **[MARKET]** — commercial market research and social-listening summaries. Directional;
  several are paywalled and only their public abstracts were reachable.

An agent with browser automation (Playwright is available in this workspace) could close
the biggest gap by driving the Meta Ad Library UI directly. That was out of scope here.

---

## 1. The field, in one paragraph

Vietnamese weight loss is a **large, still-growing, low-trust, heavily-policed category**.
Weight management and wellbeing was ~USD 805m in 2025 with supplement nutrition drinks
holding ~60% of value, and weight-loss supplements the fastest-growing line
([Euromonitor](https://www.euromonitor.com/weight-management-and-wellbeing-in-vietnam/report),
[IMARC, 8.55% CAGR 2025–33](https://www.imarcgroup.com/vietnam-weight-loss-market)) **[MARKET]**.
Adult overweight/obesity roughly doubled 2010–2020 to over 20%, with ~20 million adults
affected by 2025 ([Bộ Y tế](https://moh.gov.vn/en/chuong-trinh-muc-tieu-quoc-gia/-/asset_publisher/7ng11fEWgASC/content/viet-nam-ty-le-nguoi-truong-thanh-bi-thua-can-beo-phi-chiem-khoang-25-dan-so),
[VnExpress](https://vnexpress.net/viet-nam-den-nam-2025-kiem-soat-beo-phi-4466065.html)) **[REGULATOR/PRESS]**.
Direct-selling incumbents (Herbalife, Amway, Nu Skin) remain strong performers **[MARKET]**.
Against that demand, the advertising itself is squeezed from three sides at once —
Vietnamese food-advertising law, Meta/TikTok appearance policy, and a 2025 collapse in
influencer credibility after criminal prosecutions. **Most of what the category rewards is
downstream of that squeeze.**

---

## 2. The regulatory line on health claims — get this right

This is the hardest constraint in the category and it is statutory, not platform policy.

### 2.1 Pre-clearance is mandatory **[POLICY]**

Under **Nghị định 15/2018/NĐ-CP** (implementing the Food Safety Law):

- **Điều 26** — *thực phẩm bảo vệ sức khỏe*, *thực phẩm dinh dưỡng y học*, *thực phẩm dùng
  cho chế độ ăn đặc biệt*, and nutrition products for children under 36 months **must
  register advertising content before it runs**.
- **Điều 27** — registration goes to the body that issued the product's
  *Giấy tiếp nhận đăng ký bản công bố sản phẩm*; for thực phẩm bảo vệ sức khỏe that is the
  Ministry of Health / Cục An toàn thực phẩm. Statutory turnaround is 10 working days from
  a complete dossier. The output is a **Giấy xác nhận nội dung quảng cáo**.
- **The advertisement may not exceed the registered/published content.** Sources:
  [full text, vbpl.vn](https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=128513),
  [Điều 26–27 reproduction, VNRAS](https://vnras.com/nghi-dinh-15-2018-nd-cp-quy-dinh-chi-tiet-thi-hanh-mot-dieu-cua-luat-toan-thuc-pham/),
  [Thư viện pháp luật](https://thuvienphapluat.vn/phap-luat/ho-tro-phap-luat/cac-thuc-pham-nao-can-phai-dang-ky-noi-dung-truoc-khi-quang-cao-chuan-bi-ho-so-va-thu-tuc-dang-ky-q-583910-220754.html).

> **Category placement matters and I could not verify Cambridge's.** Whether a
> meal-replacement product sits under *thực phẩm bảo vệ sức khỏe*, *thực phẩm dùng cho chế
> độ ăn đặc biệt*, *thực phẩm dinh dưỡng y học*, or plain *thực phẩm bổ sung* changes which
> Điều 26 branch applies — but **all four of the first three require pre-clearance**. This
> is a fact about the specific product's công bố record, not something research can settle.

### 2.2 Two hard content rules **[POLICY]**

1. **The mandatory disclaimer.** Every ad for thực phẩm bảo vệ sức khỏe must carry
   *"Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh"*,
   in legible, contrasting text; on radio/TV it must be **read aloud** unless the spot is
   under 15 seconds. Omitting or garbling it is fined **5–10 triệu đồng**
   ([Điều 27 NĐ 15/2018](https://vnras.com/nghi-dinh-15-2018-nd-cp-quy-dinh-chi-tiet-thi-hanh-mot-dieu-cua-luat-toan-thuc-pham/);
   [penalty](https://thuvienphapluat.vn/phap-luat/quang-cao-thuc-pham-chuc-nang-nhung-khong-khuyen-cao-thuc-pham-nay-khong-phai-la-thuoc-va-khong-co--5142.html)).

2. **No medical-authority borrowing.** Khoản 2 Điều 27 NĐ 15/2018 forbids using the
   *images, equipment, uniforms, names, or letters* of health facilities, **doctors,
   pharmacists, or health workers**, and forbids **patient thank-you letters** and
   **articles written by doctors/pharmacists/health staff** to advertise food. Vietnamese
   press states plainly that a doctor or pharmacist appearing in a TPCN ad is itself a legal
   violation ([Báo Đồng Nai](https://baodongnai.com.vn/tin-moi/202504/bac-si-duoc-si-nhan-vien-y-te-quang-cao-thuc-pham-chuc-nang-la-vi-pham-phap-luat-56b1640/)).
   **This is the single most consequential rule for a "clinical credibility" ad strategy in
   this market: the white-coat proof device that works in the UK/AU for the same product is
   illegal here.**

### 2.3 Penalties **[POLICY]**

**Nghị định 38/2021/NĐ-CP** (văn hóa & quảng cáo). Advertising a functional food so as to
create the impression it works like medicine: **20–30 triệu đồng** for an individual,
**40–60 triệu đồng** for an organisation, plus **suspension of the product's
Giấy tiếp nhận đăng ký bản công bố sản phẩm for 3–5 months** (6 months on a second
offence) ([Thư viện pháp luật](https://thuvienphapluat.vn/phap-luat/quang-cao-thuc-pham-chuc-nang-gay-hieu-nham-co-tac-dung-nhu-thuoc-chua-benh-thi-to-chuc-bi-phat-552644-135850.html),
[VFA announcement of NĐ 38/2021](https://vfa.gov.vn/chi-dao-dieu-hanh/chinh-phu-ban-hanh-nghi-dinh-so-382021nd-cp-ngay-2932021-quy-dinh-xu-phat-vi-pham-hanh-chinh-trong-linh-vuc-van-hoa-va-quang-cao.html)).
The licence suspension is the real deterrent — the fine is rounding error against media
spend, the suspension stops the product being sold.

Enforcement is active and publicised: 675 triệu đồng in TPCN advertising fines reported in
one round-up ([VOV2](https://vov2.vov.vn/phap-luat/675-trieu-dong-xu-phat-hanh-chinh-vi-pham-ve-quang-cao-thuc-pham-chuc-nang-45624.vov2)),
and Cục An toàn thực phẩm issues repeated public warnings about *"thổi phồng công dụng"*
— naming the red-flag claim shapes as **"chữa khỏi bệnh"**, **"hiệu quả sau vài ngày"**,
and **"100% thảo dược/bài thuốc gia truyền"**
([Báo Văn hóa](https://baovanhoa.vn/doi-song/cuc-an-toan-thuc-pham-canh-bao-quang-cao-thoi-phong-cong-dung-thuc-pham-chuc-nang-123178.html),
[VTV Sức khỏe](https://suckhoe.vtv.vn/suc-khoe/cuc-an-toan-thuc-pham-can-trong-voi-quang-cao-thoi-phong-cong-dung-thuc-pham-20250307235112794.htm)) **[REGULATOR/PRESS]**.

### 2.4 The 2026 shift: the endorser is now personally liable **[POLICY]**

The **amended Luật Quảng cáo, passed 2025, in force 1 January 2026**, writes influencer
obligations into statute:

- A *người chuyển tải sản phẩm quảng cáo* must **verify the product** and **may not
  advertise a product they have not personally used or do not genuinely understand** (its
  features, origin, quality).
- **Sponsorship must be disclosed** — undisclosed paid promotion is now a legal breach, not
  an ethics lapse.
- False advertising exposes the endorser personally to fines, forced public correction, and
  damages.

Sources: [Thanh Niên](https://thanhnien.vn/cu-the-hoa-trach-nhiem-cua-nguoi-noi-tieng-trong-hoat-dong-quang-cao-185250908224637071.htm),
[Pháp Luật TP.HCM (a KOL/KOC handbook is promised for 2026)](https://plo.vn/luat-quang-cao-2025-se-co-cam-nang-cho-kol-koc-trong-nam-2026-post880999.html),
[The Influencer](https://theinfluencer.vn/luat-quang-cao-2025-co-hieu-luc-tu-2026-cu-hich-phap-ly-manh-me-cho-thi-truong-influencer-marketing),
[Soha](https://soha.vn/tu-1-1-2026-nguoi-noi-tieng-het-cua-nham-mat-nhan-tien-ti-198251231091703798.htm).

**Consequence for the field:** the cheapest historical proof device in this category — rent
a famous face, let them assert the result — carries personal criminal/administrative risk
for the face as of seven months ago. Expect supply-side reluctance and heavier paperwork,
not a ban.

---

## 3. Platform policy — the second, tighter constraint

Statute limits *what you may claim*. Meta and TikTok limit *how you may depict the body*,
and their line is stricter than Vietnamese law on imagery.

### 3.1 Meta **[POLICY, secondary]**

I could not fetch Meta's own policy page (`transparency.meta.com/...` 404;
`facebook.com/business/help/2489235377779939` served title-only). The following is
consistently reported across independent policy-tracking sources and is stable enough to
state, but **is secondary evidence, not Meta's text**:

- **No before/after images** used to display idealised results — enforced hardest on weight
  loss.
- **No content generating negative self-perception** — no ad that makes someone feel bad
  about their body or figure.
- **No idealised body held up as desirable**; no close-ups of body parts that reinforce
  insecurity; the tape-measure-around-the-waist device is called out as non-compliant.
- Weight-loss/supplement ads carry **age restrictions** (18+ commonly reported).

Sources: [Zappush](https://www.zappush.com/blog/why-meta-doesnt-allow-before-and-after-images-in-health-ads),
[AuditSocials 2026 write-up](https://www.auditsocials.com/blog/meta-beauty-cosmetic-ads-before-after-photos-body-image-policy-2026),
[The Graygency](https://thegraygency.com/the-health-and-wellness-advertising-restriction-how-to-adapt-to-metas-new-ad-policies/).

### 3.2 TikTok **[PRACTITIONER]**

A Vietnamese agency page written specifically for the *giảm cân / hút mỡ* vertical states
TikTok VN rejects: direct before/after, *"cam kết giảm cân nhanh"*, body-shaming framing,
and appearance-anxiety visuals — because the sector *"liên quan trực tiếp đến ngoại hình"*.
It reports what does clear review: **testimonial/experience-sharing**, **expert-consultation
framing presented as education**, **lifestyle-integration narrative**, and **livestream Q&A**
— content that reads *tự nhiên* rather than promotional, with the hook required to land in
the first few seconds ([Zafago](https://zafago.com/giai-phap-quang-cao-tiktok-nganh-giam-can-hut-mo-2026/)).
No CPM/CVR benchmarks were given.

### 3.3 The banned-word layer **[PRACTITIONER]**

Vietnamese practitioners maintain shared "từ cấm chạy ads" lists. The weight-loss entries
are the core vocabulary of the category:

- Flagged as high-risk: **giảm cân, béo, mập, gầy, giảm mỡ, bụng mỡ**.
- Taught substitutions: *giảm cân* → **kiểm soát cân nặng**; (parallel: *trắng da* →
  *làm sáng da*).
- Absolute guarantees blocked: *"100% hiệu quả"*, *"hoàn tiền nếu không hiệu quả"*,
  *"hiệu quả sau 3 ngày"*, *"không hiệu quả đền gấp đôi"*; the taught reframe is
  **"giải pháp được nhiều người tin chọn"**.
- Disease keywords severely restricted: *ung thư, tiểu đường, xương khớp, đau lưng, suy
  thận, mất ngủ, trầm cảm*; therapeutic verbs *khỏi bệnh / chữa trị*.
- Format-level rejection triggers named: **ALL CAPS**, excessive exclamation marks,
  before/after body comparison, and **second-person body address** (*"Bạn có béo không?"*).

Sources: [SEODO](https://seodo.vn/nhung-tu-cam-chay-quang-cao-facebook/),
[Quảng cáo siêu tốc](https://quangcaosieutoc.com/nguyen-nhan-tai-khoan-quang-cao-facebook-khong-can-tien/).

> **The euphemism treadmill is itself a field convention.** The category's dominant register
> is partly an artifact of moderation: advertisers write around a banned vocabulary, so the
> surface language drifts toward *kiểm soát cân nặng*, *vóc dáng*, *thon gọn*, *nhẹ nhõm*,
> *tự tin*, while the intent stays literal.

---

## 4. Recurring hook mechanics **[PRACTITIONER]**

Collated from Vietnamese template libraries and copy guides. All are prescriptive artifacts;
none is a verified live ad.

| Hook mechanic | Shape | Evidence |
|---|---|---|
| **Pain-point mirror** | Open by naming the reader's exact situation before any product mention — *"chạm đúng nỗi đau"* is the field's stock phrase for it. Explicitly taught as step 1. | [ACT Group](https://actgroup.com.vn/5-mau-content-giam-can-sieu-chat-cham-dung-noi-dau-khach-hang/), [UpContent](https://upcontent.vn/content-giam-can/) |
| **Failed-journey confession** | First-person: years of failing, then N months of succeeding. Taught as the highest-converting personal-story frame. | [ACT Group](https://actgroup.com.vn/5-mau-content-giam-can-sieu-chat-cham-dung-noi-dau-khach-hang/) |
| **Number + timebox** | *"GIẢM CÂN THẤY RÕ CHỈ SAU 7 NGÀY"*; *"85kg xuống còn 55kg"* over 7 months; *"giảm 5–10kg/1 liệu trình"*. The specific-number-plus-window is the category's default headline unit. | [Vinalink](https://vinalink.edu.vn/thu-vien-kien-thuc/content-giam-can), [SimplePage](https://simplepage.vn/blog/cach-quang-cao-thuoc-giam-can/) |
| **Occasion pressure** | Tết / hè-biển / mùa cưới as the deadline. Also *"dịp lễ khách nhà em cứ ăn uống toẹt ga"* as a post-holiday opener. | [AgencyVN](https://agencyvn.com/content-giam-can), [SimplePage](https://simplepage.vn/blog/cach-quang-cao-thuoc-giam-can/) |
| **Objection-preempt** | *"không tác dụng phụ"*, *"không gây khó ngủ"*, *"không phải lo cơ địa khó giảm"* — negation stacks that answer the fear before it is voiced. **"Cơ địa khó giảm" ("my body type just won't")** is a distinctive Vietnamese self-identity objection the field addresses head-on. | [SimplePage](https://simplepage.vn/blog/cach-quang-cao-thuoc-giam-can/) |
| **Shock/urgency marker** | *"CHẤN ĐỘNG"*, *"GIẢM CÂNNNN!!!"*, 🔥 SALE 🔥, scarcity (*"chỉ còn slot duy nhất"*, "20% off, first 5 customers"). | [SimplePage](https://simplepage.vn/blog/cach-quang-cao-thuoc-giam-can/), [Vinalink](https://vinalink.edu.vn/thu-vien-kien-thuc/content-giam-can) |
| **Hedged promise** | *"Không dám nói… chắc chắn sẽ giảm"* — explicit expectation-management woven into the promise. A direct fingerprint of the moderation/legal squeeze. | [SimplePage](https://simplepage.vn/blog/cach-quang-cao-thuoc-giam-can/) |

**Named formulas.** The Vietnamese guides teach a consistent body architecture:
**Problem → Solution → Social proof → CTA** (SimplePage), and a four-step
audience→pain→desire→product sequence (UpContent). AIDA/PAS are referenced generically in
the general Facebook-copy guides; **no source I reached showed the diet category using a
named canon framework (PAS, 4Ps, Schwartz awareness levels) by name.** The category's
doctrine is folk-transmitted through template libraries, not through the direct-response
canon.

---

## 5. Proof types, ranked by how the field uses them

1. **Before/after transformation imagery** — still the category's default proof, and
   simultaneously **the thing both Meta and TikTok reject** and the thing Vietnamese press
   has documented as fabricated (the Wu-Yi tea case: the "customer" in the before/after had
   never drunk the product, [An ninh Thủ đô](https://www.anninhthudo.vn/su-that-ve-cac-buc-anh-quang-cao-giam-can-post197615.antd)).
   The result is a category running its main proof device in permanent policy-evasion mode.
   **[PRACTITIONER + REGULATOR/PRESS]**
2. **Customer feedback / inbox screenshots** — testimonial and message-screenshot collages
   are taught as high-persuasion because *"câu chuyện có thật có tính thuyết phục cao"*
   ([AgencyVN](https://agencyvn.com/content-giam-can), [SimplePage](https://simplepage.vn/blog/cach-quang-cao-thuoc-giam-can/)). **[PRACTITIONER]**
3. **KOL/KOC endorsement** — structurally *celebrity + product + problem + duration +
   emotional quote* ([Vinalink](https://vinalink.edu.vn/thu-vien-kien-thuc/content-giam-can)).
   **Now the most damaged proof type in the market — see §7.** **[PRACTITIONER]**
4. **Certification / origin documents** — *chứng nhận an toàn*, *nguồn gốc nguyên liệu*,
   công bố numbers. Buzzmetrics finds **unclear origin is 45% of consumer concern** in the
   supplement category, so paperwork is a live persuasion asset, not boilerplate
   ([Buzzmetrics](https://www.buzzmetrics.com/insight/kham-pha-insight-nganh-thuc-pham-chuc-nang-thach-thuc-va-co-hoi-trong-thoi-dai-so)). **[MARKET]**
5. **Medical authority** — the clinics use it (doctor teams, metabolic workups, named
   specialties: [MedFit](https://medfit.vn/doi-ngu-bac-si-chuyen-khoa-giam-can-tai-medfit/)),
   but for a *food* product it is **statutorily off-limits** (§2.2). The proof type most
   available to a clinic is the one least available to a meal-replacement brand.
6. **Mechanism/ingredient claims** — Nutifood Slimmax leads on Isomaltulose / CLA / FOS;
   Herbalife on Formula 1 replacing 2 meals a day
   ([Medipharusa round-up](https://medipharusa.com/sua-giam-can.html),
   [congtyherbalife.vn](https://congtyherbalife.vn/product/hon-hop-dinh-duong-cong-thuc/)).
   Ingredient-as-proof is standard for the meal-replacement sub-segment specifically. **[MARKET]**
7. **Clinical-evidence claims** — present in the segment's international parents (Optifast
   cites 40 years and 120+ publications, [Nestlé Health Science](https://www.optifast.com.au/))
   but **I found no Vietnamese-market ad usage of a clinical-evidence proof device**. See §8.

---

## 6. Offer framing, price framing, and the conversion mechanic

### 6.1 The offer is a *liệu trình*, not a product **[PRACTITIONER + MARKET]**

The category prices in **courses/packages with a stated duration and a stated centimetre-
or kilo-outcome**, not per unit:

- Clinic/device tier: Max Burn Lipo quoted at **~25 triệu đồng for 10 sessions**, 60–90 min
  each, with a **"giảm 8–15cm vòng bụng"** package claim; one salon's stated averages are
  12–25cm and 3–5kg over the course
  ([Nevada price list](https://vienthammynevada.com/bang-gia-giam-beo/),
  [HanaKBN](https://hanakbn.com/tu-van/may-giam-beo-max-burn-lipo)).
  Deal-site packaging of the same treatment (trọn gói 5 lần) is common
  ([HotDeal](https://www.hotdeal.vn/ho-chi-minh/giam-beo-lam-om/tron-goi-5-lan-max-burn-lipo-giai-phap-hoan-hao-giup-ban-so-huu-duong-cong-thon-tha-chuan-s-line-cong-nghe-doc-quyen-tai-huong-tre-clinic-ampamp-spa-351194.html)).
- Medical tier: MedFit charges **500.000đ for a multi-specialty consult, fully refunded
  against a package purchase** — a deposit-style qualifier that filters tyre-kickers while
  reading as risk-free ([MedFit](https://medfit.vn/cac-goi-dieu-tri-thua-can-beo-phi-tai-medfit/)).
  It also runs a **free-screening** entry offer ([MedFit](https://medfit.vn/kham-giam-can-mien-phi-o-dau-tai-tphcm/)).
- Grey/pharma tier: GLP-1 pens sold on TikTok/Facebook at **6–8 triệu đồng** for "authentic
  German/Danish imports" down to **800k–1 triệu** for "hàng nội địa/xả kho" — the price
  spread itself is the pitch, and the confusion is the mechanic
  ([VnExpress](https://vnexpress.net/but-tiem-giam-can-troi-noi-tren-tiktok-5045735.html)).

### 6.2 Price posture **[MARKET]**

Vietnamese consumers are **increasingly price-sensitive and promotion-led** — 41% report
declining savings ability, 63% feel financially secure (down QoQ), spending concentrates on
essentials incl. healthcare
([The Investor / Kantar](https://theinvestor.vn/vietnamese-consumers-increasingly-price-sensitive-favor-promotions-expert-d14734.html),
[NielsenIQ Tết 2025](https://nielseniq.com/global/en/insights/analysis/2025/winning-vietnams-tet-holiday-optimizing-fmcg-growth-for-the-next-season/),
[Kantar FMCG Outlook 2025](https://ceo-talk.vn/wp-content/uploads/2025/03/FMCG_Outlook_2025_EN-1.pdf)).
Buzzmetrics puts **price second only to effectiveness** as a stated purchase criterion in
supplements ([Buzzmetrics](https://www.buzzmetrics.com/insight/kham-pha-insight-nganh-thuc-pham-chuc-nang-thach-thuc-va-co-hoi-trong-thoi-dai-so)).
Standard sweeteners appearing in the templates: **freeship, tặng kèm, %-off for the first N
buyers, slot scarcity** ([SimplePage](https://simplepage.vn/blog/cach-quang-cao-thuoc-giam-can/), [Vinalink](https://vinalink.edu.vn/thu-vien-kien-thuc/content-giam-can)).

### 6.3 The conversion mechanic is a conversation, not a checkout **[PRACTITIONER]**

The dominant funnel is **Ad → Messenger/Zalo inbox → consult → close**, with
*"IB ngay để trải nghiệm"*, *"inbox để tư vấn"*, *"để lại số điện thoại"* as the
terminal CTAs, and a landing-page name+phone form as the alternate path
([Fchat](https://fchat.vn/blog/tuyet-chieu-viet-content-facebook-ads-danh-trung-insihgt-khach-hang.html),
[Sapo](https://www.sapo.vn/blog/toi-uu-quang-cao-facebook),
[Creazion, "DM funnel: Ad → Messenger → Offer → Purchase"](https://creazionmedia.com/facebook-marketing-in-vietnam-2025-tools-trends-tactics-that-actually-work/)).
A telling operational detail: tools like Pancake **auto-hide comments containing phone
numbers** so competitors cannot poach leads out of the comment thread — evidence that the
comment section is a real part of the conversion surface in this market
([Sapo](https://www.sapo.vn/blog/toi-uu-quang-cao-facebook)).

**Implication for copy shape:** the ad does not have to close. It has to earn an inbox.
That is a materially different job from the checkout-driven direct-response the canon
assumes, and it explains the category's tolerance for vague, curiosity-shaped copy.

---

## 7. The trust climate — 2025 broke the category's main proof device **[REGULATOR/PRESS]**

Two prosecutions inside twelve months, both in health/weight products, both against
top-tier social sellers:

- **Kẹo rau củ Kera (Mar–Apr 2025).** Quang Linh Vlogs, Hằng Du Mục and Hoa hậu Thùy Tiên
  promoted a "vegetable candy" on livestream with the claim *"một viên kẹo tương đương một
  đĩa rau luộc"*. Product tested >33% sorbitol. Sales: **129,617 boxes to 56,385 customers,
  17.5 tỷ đồng, in ~2 months**. Administrative fine 70 triệu each (140 triệu total), then
  **criminal prosecution and detention**.
  [VnExpress](https://vnexpress.net/tu-con-sot-mang-xa-hoi-den-be-boi-quang-cao-keo-rau-cu-kera-4936616.html),
  [VnExpress (fine)](https://vnexpress.net/hang-du-muc-quang-linh-vlogs-bi-phat-140-trieu-dong-do-quang-cao-sai-su-that-4863960.html),
  [VTV (khởi tố)](https://vtv.vn/phap-luat/khoi-to-quang-linh-vlog-va-hang-du-muc-lien-quan-vu-keo-rau-cu-kera-20250404190358518.htm),
  [Dân Việt — "trục lợi từ niềm tin"](https://danviet.vn/quang-linh-vlogs-hang-du-muc-quang-cao-sai-su-that-truc-loi-tu-niem-tin-su-yeu-quy-cua-dong-bao-20250316102741851-d1215890.html).
- **Ngân 98 / Super Detox X3 (Oct 2025).** Weight-loss "thực phẩm bảo vệ sức khỏe" line
  (X3, X7 Plus, X1000) found to contain **sibutramine and phenolphthalein** — both banned.
  Arrested and prosecuted for manufacturing/selling counterfeit pharmaceuticals; Cục An
  toàn thực phẩm issued a public do-not-use warning.
  [Chinhphu.vn](https://xaydungchinhsach.chinhphu.vn/khoi-to-bat-tam-giam-vo-thi-ngoc-ngan-ngan-98-119251013132412248.htm),
  [Sức khỏe & Đời sống](https://suckhoedoisong.vn/cac-chat-cam-trong-san-pham-cua-ngan-98-nguy-hiem-the-nao-169251013192033512.htm),
  [Nhân Dân](https://nhandan.vn/hai-chat-cam-trong-san-pham-giam-can-cua-ngan-98-nguy-hai-the-nao-post915139.html).

Meanwhile Bộ Y tế has publicly framed celebrity false advertising as a *vấn nạn*
([Hà Tĩnh portal](https://hatinh.gov.vn/vi/bai-viet/bo-y-te-canh-bao-van-nan-nguoi-noi-tieng-quang-cao-sai-su-that)),
and SEA-wide research reports **influencer trust declining across every tier**
([impact.com](https://impact.com/influencer/influencer-marketing-ecommerce-trends/)).

**Net:** in this specific category, in this specific market, "a famous person says it
works" is now a *liability-carrying* claim (§2.4) attached to a *publicly discredited*
device. Every serious brand-side proof decision in Vietnamese weight loss for the next
year or two is downstream of Kera and Ngân 98.

Counterweight: **Vietnamese creators still out-trust foreign ones**, and micro-influencers
(10k–100k) retain relationship-grade trust; livestream is felt as more authentic than
polished ads ([Awisee](https://awisee.com/blog/influencer-marketing-vietnam/),
[Vietnam Briefing](https://www.vietnam-briefing.com/news/vietnam-beauty-personal-care-sector-market-entry.html/)) **[MARKET]**.
The device isn't dead; the *celebrity-assertion* version of it is.

---

## 8. Format and register conventions

**[PRACTITIONER] unless noted.**

- **Length.** ~150–300 words per Facebook post is the taught norm for this category
  ([SimplePage](https://simplepage.vn/blog/cach-quang-cao-thuoc-giam-can/)); guides
  simultaneously push "ngắn gọn nhưng đầy đủ".
- **Caption architecture.** Hook line (often all-caps or emoji-flanked) → pain paragraph →
  mechanism/benefit bullets → proof (story, number, or feedback) → offer sweetener → CTA
  to inbox. Heavy emoji throughout — 🔥 ✅ 💊 and transformation glyphs are named as
  consistent across samples.
- **Video vs image.** The guides push video hard: detailed script, **hook in the first
  seconds**, music/effects, **burned-in subtitles** ([ACT Group](https://actgroup.com.vn/5-mau-content-giam-can-sieu-chat-cham-dung-noi-dau-khach-hang/)).
  TikTok work is testimonial/consult/livestream-shaped ([Zafago](https://zafago.com/giai-phap-quang-cao-tiktok-nganh-giam-can-hut-mo-2026/)).
  Facebook static + long caption persists as the Messenger-lead workhorse.
- **Register.** Overwhelmingly **peer-to-peer intimate seller voice** — *"nhanh tay inbox
  em"*, *"khách nhà em"*, first-person diary, *chị em* address. Not brand-voice, not
  institutional. The exception tier is the medical clinics, which write in a clinical-
  professional register (*đa mô thức*, chỉ số chuyển hóa, hồ sơ sức khỏe —
  [MedFit](https://medfit.vn/giam-can/)).
- **Audience default.** Women 25–50, office workers, time-poor
  ([AgencyVN](https://agencyvn.com/content-giam-can)). Where personas appear at all, this is
  the whole roster.
- **Social-listening cross-check [MARKET].** Vietnamese weight-loss conversation among
  16–22s clusters on **cheap accessible foods** (chanh, mật ong, sữa chua, trà xanh) with
  detox/low-carb/HIIT mentioned less; supplement-category conversation is **99.2%
  non-branded** — only **0.8% of discussion is branded content**, with online sellers and
  peer reviews carrying the information load
  ([Buzzmetrics](https://www.buzzmetrics.com/insight/kham-pha-insight-nganh-thuc-pham-chuc-nang-thach-thuc-va-co-hoi-trong-thoi-dai-so),
  [Buzzmetrics via VietQ](https://vietq.vn/4-ong-lon-lang-nghe-mang-xa-hoi---social-listening-bat-tay-hop-tac-d99396.html)).
- **Seasonality.** Tết is the peak media window across FMCG, with pre-Tết timing itself
  cited as ~18% of ad effectiveness perception; hè and mùa cưới are the category's other
  named peaks ([BIN](https://www.bin.vn/tin-tuc/chuong-4-tong-hop-cac-nganh-hang-can-chuan-bi-va-trien-khai-chien-dich-quang-cao-tet-nhu-the-nao-cho-hieu-qua),
  [Rentracks](https://rentracks.com.vn/en/top-5-xu-huong-tieu-dung-tet-chien-luoc-marketing/)).

---

## 9. The three tiers actually competing

| Tier | Who | Proof posture | Price posture | Register |
|---|---|---|---|---|
| **Social seller / MLM** | Independent Facebook & TikTok sellers, direct-selling networks (Herbalife, Amway, Nu Skin strong per [Euromonitor](https://www.euromonitor.com/weight-management-and-wellbeing-in-vietnam/report)) | Before/after, feedback screenshots, KOL | Course pricing + promos, freeship | Intimate peer, emoji-dense |
| **Branded FMCG meal replacement** | Nutifood Slimmax, Herbalife Formula 1, imported shake brands ([Medipharusa](https://medipharusa.com/sua-giam-can.html)) | Ingredient mechanism (CLA, FOS, Isomaltulose), meal-replacement protocol | Retail/e-commerce, Shopee/Lazada-led **[MARKET]** | Product-brand, restrained |
| **Medical / device clinic** | MedFit, Nutrihome, thẩm mỹ viện device chains (Max Burn Lipo, Nevada) | Doctor teams, metabolic workup, cm/kg package guarantees | 500k qualifying consult; 25tr/10-session packages | Clinical-professional |

Vietnam also got its **first internationally-standard weight-control & obesity treatment
centre** recently ([Thanh Tra](https://thanhtra.com.vn/y-te-8CCF74D5E/lan-dau-tien-viet-nam-co-trung-tam-kiem-soat-can-nang-va-dieu-tri-beo-phi-EA43ACB7.html)),
and press is now framing obesity as *"bệnh lý mạn tính phức tạp"* requiring long-term
management, not willpower ([Phụ nữ Việt Nam](https://phunuvietnam.vn/dieu-tri-beo-phi-vi-sao-hon-80-nguoi-giam-can-lai-tang-can-tro-lai-238260729091849616.htm)) —
i.e. **the medicalised frame is arriving in editorial before it arrives in advertising.**

---

## 10. What nobody is doing — the visible gaps

Stated as observed absences in the sources I could reach, not as recommendations. Each is a
**negative finding** and therefore weaker evidence than the positive findings above — absence
in agency template libraries and press coverage is not proof of absence in the ad field.

1. **Maintenance / regain.** The entire advertised category sells the *drop*. Vietnamese
   press reports **50–80% of people regain most of the lost weight within 2–5 years**
   ([Dân Trí, Jul 2026](https://dantri.com.vn/suc-khoe/dieu-tri-beo-phi-vi-sao-50-80-nguoi-giam-can-lai-tang-can-tro-lai-20260728143222412.htm),
   [Phụ nữ VN](https://phunuvietnam.vn/dieu-tri-beo-phi-vi-sao-hon-80-nguoi-giam-can-lai-tang-can-tro-lai-238260729091849616.htm)),
   and GLP-1 users regain within ~1.5 years of stopping
   ([VnExpress](https://vnexpress.net/but-tiem-giam-can-troi-noi-tren-tiktok-5045735.html)).
   **I found no advertiser whose pitch is the after-the-diet phase.** The yo-yo experience
   is the category's most universal shared reality and its least-used message.
2. **Named clinical evidence, in Vietnamese, in an ad.** The VLCD segment's international
   parents lead on trial counts; the Vietnamese ad field leads on transformations. I found
   **no Vietnamese-market example of study-count/publication-count as the lead proof** —
   note this gap is *partly manufactured by law* (§2.2 blocks the doctor/white-coat
   packaging of that evidence, though it does not block citing the evidence itself).
3. **Anyone advertising *to* the failure history rather than past it.** *"Cơ địa khó giảm"*
   appears only as an objection to be swatted ([SimplePage](https://simplepage.vn/blog/cach-quang-cao-thuoc-giam-can/)),
   never as a premise to build on.
4. **Men.** Every persona description I found is women 25–50
   ([AgencyVN](https://agencyvn.com/content-giam-can)). Obesity prevalence is not
   women-only.
5. **The comorbidity buyer.** 2.5m Vietnamese adults have diabetes ([IDF via IMARC](https://www.imarcgroup.com/vietnam-weight-loss-market)),
   >4% diabetic and >30% dyslipidaemic per the MoH-cited figures — but the disease
   vocabulary is a **banned-word minefield** on Meta (§3.3) and a legal minefield under NĐ
   38/2021 (§2.3). Structurally underserved *because* it is hard, not because it is small.
6. **Transparent downside.** The regulator, not the advertisers, is the one telling people
   what doesn't work and what the side effects are
   ([Cục ATTP](https://baovanhoa.vn/doi-song/cuc-an-toan-thuc-pham-canh-bao-quang-cao-thoi-phong-cong-dung-thuc-pham-chuc-nang-123178.html)).
   No advertiser in the reachable evidence is competing on candour.
7. **Brand presence in the conversation at all.** 0.8% of supplement discussion is branded
   ([Buzzmetrics](https://www.buzzmetrics.com/insight/kham-pha-insight-nganh-thuc-pham-chuc-nang-thach-thuc-va-co-hoi-trong-thoi-dai-so)).
   The category is ~99% seller-and-peer chatter.
8. **Post-2026 compliance as a visible position.** The new endorser-liability law lands
   1 Jan 2026 and a KOL/KOC handbook is still forthcoming
   ([PLO](https://plo.vn/luat-quang-cao-2025-se-co-cam-nang-cho-kol-koc-trong-nam-2026-post880999.html)).
   Nothing I found shows an advertiser making its own compliance legible to buyers.

---

## 11. Open questions this research could not close

1. **What is actually running.** Meta Ad Library and TikTok Creative Center both refused
   fetch. Every §4/§5/§8 claim is template-library-derived. **A Playwright-driven pass over
   the Meta Ad Library (country=VN; queries: giảm cân, kiểm soát cân nặng, thon gọn, giảm
   mỡ, eat clean, thay thế bữa ăn; plus `view_all_page_id` for Herbalife VN, Nutifood,
   MedFit, the Nevada/Max Burn chains) is the single highest-value follow-up.**
2. **Cambridge's own regulatory classification** in Vietnam (§2.1) — determines which
   pre-clearance branch and which disclaimer regime binds. Answerable from the product's
   công bố paperwork, not from research.
3. **Real performance benchmarks.** The one CTR/CVR figure I found (0.5–2% CTR, 1–5% CVR)
   comes from an uncited agency blog and should not be relied on.
4. **Meta's own policy text** — every Meta citation in §3.1 is secondary. Worth reading the
   first-party page in a browser session.
5. **Whether the 2026 law has changed observed KOL usage yet** — it took effect ~7 months
   ago; no measurement of the behavioural response was reachable.
