# ROADMAP — Mood Story AI

> Task breakdown theo từng version. Cập nhật khi hoàn thành task.

---

## Trạng thái ký hiệu

- `[ ]` Chưa làm
- `[~]` Đang làm
- `[x]` Hoàn thành

---

## Phase 0 — Project Setup (làm đầu tiên)

```
[x] Init Next.js 14 với pnpm
[x] Cài dependencies: zustand, @ffmpeg/ffmpeg, @ffmpeg/util, clsx, tailwind-merge
[x] Setup Tailwind config (brand colors, surface colors)
[x] Setup TypeScript strict mode
[x] Setup folder structure theo FE_GUIDE.md
[x] Setup .env.local template
[x] Setup Cross-Origin headers cho FFmpeg.wasm (next.config.ts)
[x] Setup mock mode (NEXT_PUBLIC_USE_MOCK=true)
[x] Deploy lên Vercel lần đầu (empty app, chỉ để có URL)
```

---

## V1 — MVP Frontend (FE-first, mock BE)

### 1.1 Home Page — Story Type + Mood Picker

```
[x] Layout MobileContainer (max-width 430px, centered)
[x] BottomNav component
[x] StoryTypePicker component (Moment / Journey / Vibe cards)
[x] MoodPackGrid component (6 mood cards với emoji + name)
[x] Lưu selection vào editorStore
[x] CTA button → navigate /create
[x] Animation: card selection có micro-animation
[x] Dark theme toàn bộ (màu theo UI prototype)
```

### 1.2 Create Page — Upload

```
[ ] UploadZone component (drag & drop + tap)
[ ] Validate file type (JPG/PNG/WEBP/MP4/MOV) và size (< 50MB)
[ ] FileThumb component (preview với remove button)
[ ] Reorder files bằng drag (Journey type)
[ ] Show file count / max files limit
[ ] Upload lên Cloudinary (mock: chỉ tạo object URL local)
[ ] Lưu files vào uploadStore
[ ] Progress indicator per file
```

### 1.3 Create Page — AI Processing (Mock)

```
[ ] AI loading state UI (animated steps: "Analyzing...", "Applying mood...", etc.)
[ ] Gọi mock AI analysis (sleep 2.5s → trả MOCK_AI_RESULT)
[ ] CaptionEditor component (editable text, mood-styled font)
[ ] MusicSelector component (list tracks, play preview 5s)
[ ] Duration selector (10 / 15 / 20 / 25s pills)
[ ] "Shuffle" button → random seed mới, preview thay đổi
[ ] CTA "Preview" → navigate /preview
```

### 1.4 Preview Page

```
[ ] CanvasPreview component (Canvas render static preview, không phải video)
[ ] Hiển thị color grade effect trên canvas
[ ] Hiển thị text overlay với đúng font/style
[ ] PlatformSelector (Instagram / TikTok / Facebook / Download)
[ ] Export button
```

### 1.5 Export — Mock Render

```
[ ] RenderProgress component (progress bar + estimated time)
[ ] Mock render: sleep + increment progress → serve /public/mock/sample.mp4
[ ] Download trigger (a[download] với blob URL)
[ ] "Make another" → reset stores → về home
```

### 1.6 Mood Engine — Data Layer

```
[ ] Types: MoodPack, MoodSeed, ResolvedPackParams, StoryType
[ ] 6 Mood Pack definitions (night-drive, chill, sad, coding, cinematic, neon)
[ ] generateSeed() function
[ ] resolveSeed() function
[ ] getMoodPack() helper
[ ] Beat markers data cho từng track
```

### 1.7 Zustand Stores

```
[ ] uploadStore (theo STATE_MANAGEMENT.md)
[ ] editorStore (theo STATE_MANAGEMENT.md)
[ ] exportStore (theo STATE_MANAGEMENT.md)
```

---

## V1.5 — Real Video Engine (FE vẫn, nhưng render thật)

```
[ ] FFmpeg singleton setup (lib/ffmpeg.ts)
[ ] next.config.ts: COOP/COEP headers
[ ] Canvas Compositor: Ken Burns effect
[ ] Canvas Compositor: color grade (brightness/contrast/saturation)
[ ] Canvas Compositor: text overlay với typewriter animation
[ ] Canvas Compositor: transition (slow-fade trước)
[ ] Thêm transition: light-leak, film-burn
[ ] FFmpeg encode: PNG sequence → MP4
[ ] FFmpeg: ghép audio track vào MP4
[ ] Test render 10s video thật
[ ] Test render 25s video thật
[ ] Progress bar real (từ FFmpeg progress event)
[ ] Error handling: FFmpeg load fail, render fail
[ ] Thêm sample music vào /public/music/ (3-5 tracks free license)
[ ] Audio preview trong MusicSelector (HTMLAudioElement)
```

---

## V2 — Real AI Integration

```
[ ] Setup OpenAI client (server-side)
[ ] API Route: POST /api/ai/analyze (GPT-4o Vision)
[ ] API Route: POST /api/ai/caption (GPT-4o-mini)
[ ] API Route: POST /api/ai/music (GPT-4o-mini)
[ ] Cloudinary upload thật (thay mock)
[ ] useAIAnalysis hook (real calls)
[ ] Error retry logic (rate limit)
[ ] Cost tracking (log tokens/call)
[ ] Beat sync: transition tại đúng beat marker
[ ] Narrative reorder theo AI result
[ ] Segment selection: cắt video đúng timestamp AI chọn
[ ] FFmpeg trim video: -ss startTime -t duration
```

---

## V3 — Polish & Scale

```
[ ] Thêm Mood Pack: Travel, Memories, Gaming, Late Night
[ ] Thêm Story Type animations (Journey narrative bar)
[ ] Social share button (Web Share API)
[ ] localStorage: save draft (user có thể quay lại)
[ ] Onboarding flow (lần đầu dùng)
[ ] Analytics (Vercel Analytics / Plausible)
[ ] Error reporting (Sentry free tier)
[ ] Performance: Web Worker cho Canvas rendering
[ ] PWA: installable trên mobile
[ ] Auth (NextAuth.js) — chỉ khi cần lưu history
[ ] Render queue nếu cần (BullMQ / Vercel Queue)
```

---

## Thứ tự ưu tiên làm việc

```
Phase 0 → V1 (Home + Upload) → V1 (AI Mock + Preview) → V1 (Export Mock)
→ Test UX flow hoàn chỉnh với mock
→ V1.5 (Real video render)
→ Test output video thật trên mobile
→ V2 (Real AI)
→ V3 features theo feedback
```

---

## Definition of Done cho V1

- [ ] User có thể upload 1-3 ảnh từ điện thoại
- [ ] User có thể chọn Story Type + Mood Pack
- [ ] AI mock xử lý và hiện caption
- [ ] User có thể edit caption
- [ ] User có thể xem preview (Canvas)
- [ ] User có thể download file MP4 (mock hoặc real)
- [ ] Toàn bộ flow chạy trên mobile Chrome (Android) và Safari (iOS)
- [ ] Deploy lên Vercel và accessible qua URL
