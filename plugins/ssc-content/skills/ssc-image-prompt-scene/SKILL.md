---
name: ssc-image-prompt-scene
description: RETIRED. The Scene (Ghép người) stage no longer exists — the 5→4 ImageStudio restructure folded compositing into the Full-image step, so there is no longer a stage that composes a selected subject INTO a selected background. This skill authors NOTHING (no save_creative_prompt, no generate) and holds no tools; invoking it only prints a Vietnamese redirect. For the work Scene used to do, use the Full-image step ssc-image-prompt-background (now builds the scene around the selected subject/product refs directly), then the Edit step ssc-image-prompt-composite (generic prompt-to-edit, repeatable). The backend layer key `model` (Scene's old key) stays dormant so old rows still read, but no skill authors for it. Operator-facing prose is Vietnamese.
metadata:
  type: skill
  stage: produce
  brand: cambridge-diet-vn
  section: ads
  capability: edit
  status: retired
  tools: []
---

# Ads Image Prompt — Scene (`ssc-image-prompt-scene`) — ĐÃ NGỪNG SỬ DỤNG

> **Bước Scene (*Ghép người*) đã bị gỡ bỏ.** Quy trình ImageStudio đã được rút gọn từ **5 bước xuống 4 bước**, và phần **ghép người vào nền** đã được **gộp thẳng vào bước Full image**. Không còn bước nào tách riêng để ghép một *subject* đã chọn vào một *background* đã chọn nữa.

Skill này **không còn tạo hay lưu prompt** (không `save_creative_prompt`, không Generate) và **không giữ tool nào**. Gọi nó chỉ để nhận hướng dẫn chuyển sang luồng mới.

## Quy trình 4 bước hiện tại

```
1. Người mẫu (Subject, tùy chọn) → 2. Full image (bắt buộc) → 3. Chỉnh sửa (Edit, tùy chọn, lặp lại) → 4. Text
```

## Thay vì Scene, hãy dùng

- **Bước Full image — `ssc-image-prompt-background`.** Đây là nơi thay thế cho Scene: bước Full image giờ **dựng cả khung cảnh quanh subject/sản phẩm đã chọn** (Kontext edit theo ref khi có subject/product, hoặc text-to-image khi không có), nên việc "ghép người vào nền" nằm ngay trong bước này — không cần ghép ở một bước riêng.
- **Bước Chỉnh sửa (Edit) — `ssc-image-prompt-composite`.** Bước edit tổng quát, **lặp lại được**: mô tả "cần đổi gì" trên ảnh Full image (hoặc trên bản edit trước) — kể cả việc đặt sản phẩm vào cảnh. Đây là nơi tinh chỉnh bố cục/ánh sáng/chi tiết sau khi đã có ảnh nền hoàn chỉnh.

## Ghi chú kỹ thuật

- Layer key cũ của Scene là **`model`** — nó vẫn **tồn tại nhưng ở trạng thái ngủ** trong backend: các creative `model` cũ vẫn đọc được, nhưng **không skill nào tạo prompt cho layer này nữa**. Đừng lưu `layer:'model'`.
- Không có tác vụ nào chạy ở đây: **không Generate, không lưu, không duyệt, không tốn credit.** Hãy chạy `/ssc.image-prompt <brief_id>` để tiếp tục ở bước Full image hoặc Edit.
