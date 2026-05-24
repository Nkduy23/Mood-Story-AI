# ARCHITECTURE — Mood Story AI

> Đọc file này khi cần hiểu toàn bộ hệ thống, data flow, hoặc khi thêm feature lớn.

---

## Tổng quan hệ thống V1

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER (Client)                  │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐   │
│  │  Upload  │───▶│  Editor  │───▶│    Export    │   │
│  │  Feature │    │  Feature │    │    Feature   │   │
│  └──────────┘    └──────────┘    └──────────────┘   │
│        │               │                │            │
│        ▼               ▼                ▼            │
│  ┌─────────────────────────────────────────────┐    │
│  │              Zustand Store                   │    │
│  │  uploadStore │ editorStore │ exportStore     │    │
│  └─────────────────────────────────────────────┘    │
│        │               │                │            │
│        ▼               ▼                ▼            │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐   │
│  │Cloudinary│    │ FFmpeg   │    │  Canvas API  │   │
│  │ Upload   │    │  .wasm   │    │  Compositor  │   │
│  └──────────┘    └──────────┘    └──────────────┘   │
│                        │                             │
│                        ▼                             │
│                  ┌──────────┐                        │
│                  │ OpenAI   │                        │
│                  │ API Call │                        │
│                  └──────────┘                        │
└─────────────────────────────────────────────────────┘
```

---

## User Flow

```
[Home]
  → chọn Story Type (Moment / Journey / Vibe)
  → chọn Mood Pack (Night Drive / Chill / ...)

[Upload]
  → upload ảnh hoặc video (tối đa 5 file)
  → preview thumbnail
  → reorder nếu muốn (Journey type)

[Editor — AI Processing]
  → GPT-4o Vision phân tích từng file (nếu là video: thumbnail từng giây)
  → AI score và chọn đoạn tốt nhất theo mood
  → AI sắp xếp narrative order
  → AI generate caption từ nội dung ảnh
  → User preview caption, có thể edit
  → User chọn nhạc từ pool (AI suggest 1, user có thể đổi)

[Preview]
  → Canvas render preview (không phải final mp4)
  → User có thể bấm "Shuffle" để random lại tham số
  → User approve → trigger FFmpeg.wasm render

[Export]
  → FFmpeg.wasm render MP4 (progress bar)
  → Download file
  → Chọn platform (Instagram / TikTok / Facebook)
  → Share hoặc download
```

---

## Feature Modules

### `/features/upload`

- Drag & drop hoặc tap to upload
- Validate: ảnh (JPG/PNG/WEBP), video (MP4/MOV), max 50MB mỗi file
- Upload lên Cloudinary, lấy về URL + metadata
- Lưu vào `uploadStore`

### `/features/editor`

- Nhận files từ `uploadStore`
- Gọi AI pipeline (xem `AI_INTEGRATION.md`)
- Apply Mood Pack parameters (xem `MOOD_ENGINE.md`)
- Canvas preview compositor
- Zustand: `editorStore`

### `/features/export`

- Nhận approved parameters từ `editorStore`
- FFmpeg.wasm render pipeline (xem `VIDEO_ENGINE.md`)
- Progress tracking
- Download trigger
- Zustand: `exportStore`

### `/features/mood-engine`

- Mood Pack definitions (data, không phải UI)
- Parameter randomization logic
- Seed management (để user có thể shuffle)

---

## Data Flow chi tiết

```typescript
// 1. User upload
UploadedFile[] → Cloudinary → { url, publicId, width, height, duration? }

// 2. AI phân tích
CloudinaryFile[] + MoodPack → GPT-4o Vision → {
  selectedSegments: { fileId, startTime, endTime, score }[]
  narrativeOrder: number[]
  caption: string
  suggestedMusicId: string
}

// 3. Render parameters
AIResult + MoodPackSeed → RenderParams {
  clips: { url, start, end, duration }[]
  transitions: TransitionConfig[]
  colorGrade: ColorGradeConfig
  textOverlay: TextOverlayConfig
  audioTrack: string
  totalDuration: 10 | 15 | 20 | 25
}

// 4. Export
RenderParams → FFmpeg.wasm → Blob → download MP4
```

---

## Quyết định kỹ thuật quan trọng

### Tại sao FFmpeg.wasm thay vì Remotion?

- FFmpeg.wasm: logic xử lý video tái dùng được khi chuyển lên BE (chỉ swap sang FFmpeg native)
- Remotion: lock-in vào React render pipeline, khó tách BE sau này
- Canvas API: xử lý color grade và text overlay nhẹ hơn, không cần build step

### Tại sao Zustand thay vì Redux?

- Ít boilerplate hơn 70%
- Khi cần scale: Zustand slice pattern tương tự Redux slice, refactor dễ
- Không cần provider wrapping

### Tại sao không có BE V1?

- Giảm chi phí deploy về $0
- FFmpeg.wasm đủ cho video 25s
- Khi cần BE (V2): chỉ cần move FFmpeg logic sang server, API contract giữ nguyên

### Video duration cố định

10s / 15s / 20s / 25s — không để user tự nhập.
Lý do: dễ tính toán render time, dễ sync nhạc với duration cố định.

---

## Môi trường

```bash
# .env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
OPENAI_API_KEY=                        # server-side only, không NEXT_PUBLIC_
```

---

## Constraint quan trọng

| Constraint              | Giá trị                         |
| ----------------------- | ------------------------------- |
| Max file size           | 50MB / file                     |
| Max files per session   | 5 files                         |
| Video output duration   | 10 / 15 / 20 / 25 giây          |
| Target screen           | 375px width (iPhone SE) trở lên |
| Video output resolution | 1080x1920 (9:16)                |
| Max concurrent users V1 | 500                             |
| OpenAI budget           | $5 test, ~$0–2/tháng production |
