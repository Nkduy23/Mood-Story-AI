# CONTEXT — Mood Story AI

> Gửi file này cho AI assistant TRƯỚC KHI bắt đầu bất kỳ task nào.
> File này là nguồn sự thật duy nhất về toàn bộ dự án.

---

## Dự án là gì

Mobile-first web app giúp người dùng **không biết edit video** tạo story/reel aesthetic
tự động bằng AI. Upload ảnh hoặc video ngắn → chọn mood → AI xử lý → export MP4.

**Output video:** 10s / 15s / 20s / 25s (không dài hơn)
**Target platform:** Instagram Reels, TikTok, Facebook Story
**Target user:** người dùng phổ thông, không biết dùng CapCut, muốn có video đẹp nhanh

---

## Differentiator — điều khác TikTok AutoCut

TikTok cắt video theo beat nhạc đơn thuần, không hiểu nội dung.
Mood Story AI dùng **GPT-4o Vision phân tích frame** để:

1. Chọn đoạn video "đắt nhất" theo mood (không cắt lung tung)
2. Sắp xếp ảnh theo narrative logic (cảnh rộng → gần → người)
3. Đặt chuyển cảnh đúng tại điểm beat drop của nhạc
4. Generate caption đọc từ nội dung ảnh thật (không phải text generic)

---

## 3 Core Concepts

### 1. Story Type

User chọn loại story trước mood:

- `Moment` — 1 khoảnh khắc, 1–2 ảnh, text lớn, nhạc nền
- `Journey` — 3–5 ảnh/clip, có đầu cuối, narrative rõ ràng
- `Vibe` — loop ngắn 5–8s, không cần story, chỉ cần đẹp

### 2. Mood Pack System

Mood không phải template cứng — là **không gian tham số ngẫu nhiên có kiểm soát**.
Mỗi lần generate = 1 seed khác → cùng mood, cùng ảnh, bấm lại ra clip khác.

Cấu trúc 1 Mood Pack:

```
{
  id: "night-drive",
  name: "Night Drive",
  emoji: "🌙",
  colorGrade: ["muted-cyan", "deep-blue", "warm-shadow"],  // random 1
  transition: ["light-leak", "slow-fade", "film-burn"],     // random 1
  textStyle: ["typewriter", "fade-in", "glitch"],           // random 1
  fontFamily: ["mono", "serif-thin"],                       // random 1
  musicPool: ["track-01.mp3", "track-02.mp3", ...],        // random 1
  kenBurns: ["zoom-in-slow", "pan-left", "zoom-out"],       // random 1
  animationSpeed: [0.8, 1.0, 1.2],                         // random 1
  colorTone: { shadows: "cyan", highlights: "warm-orange" }
}
```

### 3. Video Analysis Pipeline

```
Upload → GPT-4o Vision phân tích thumbnail từng giây
       → Score từng đoạn theo mood
       → Chọn timestamp tốt nhất
       → FFmpeg cắt đúng điểm đó
       → Ghép theo narrative order
       → Sync chuyển cảnh với beat nhạc
       → Canvas apply color grade + text overlay
       → FFmpeg.wasm export MP4
```

---

## Tech Stack (không thay đổi trừ khi có lý do rõ ràng)

| Layer         | Công nghệ                | Lý do                                   |
| ------------- | ------------------------ | --------------------------------------- |
| Framework     | Next.js 14 App Router    | SSR ready, Vercel native                |
| Language      | TypeScript strict mode   | Bắt buộc, không dùng `any`              |
| Styling       | Tailwind CSS             | Mobile-first utility                    |
| State         | Zustand                  | Nhẹ, dễ refactor lên Redux sau          |
| Video         | FFmpeg.wasm + Canvas API | Chạy browser, logic tái dùng khi lên BE |
| AI            | OpenAI GPT-4o (`gpt-4o`) | Vision + text trong 1 call              |
| AI caption rẻ | `gpt-4o-mini`            | Chỉ text, không cần vision              |
| Upload        | Cloudinary free tier     | 25GB free, transform API                |
| Package       | pnpm                     | Bắt buộc, không dùng npm/yarn           |
| Deploy        | Vercel                   | Free tier đủ cho < 500 user             |

---

## Nguyên tắc code (bắt buộc tuân theo)

1. **pnpm only** — không dùng npm install hay yarn add
2. **TypeScript strict** — không dùng `any`, không `@ts-ignore` vô lý
3. **Mobile-first** — mọi component viết cho 375px trước, rồi mới responsive lên
4. **Feature-based structure** — code theo feature folder, không theo layer
5. **No auth V1** — hoàn toàn anonymous, không có login
6. **Zustand store** — không dùng prop drilling, không Context cho global state
7. **Error boundary** — mọi async operation phải có error state rõ ràng
8. **FFmpeg.wasm** — load lazy, không block UI, luôn show progress

---

## Các file docs liên quan

Khi làm task cụ thể, đọc thêm file tương ứng:

| Task            | Đọc thêm              |
| --------------- | --------------------- |
| Video render    | `VIDEO_ENGINE.md`     |
| Mood/Pack logic | `MOOD_ENGINE.md`      |
| Gọi OpenAI      | `AI_INTEGRATION.md`   |
| Zustand store   | `STATE_MANAGEMENT.md` |
| Component/UI    | `FE_GUIDE.md`         |
| Deploy/env      | `DEPLOY.md`           |

---

## Giai đoạn hiện tại

**V1 FE-first** — build toàn bộ frontend với mock data trước.
Video engine dùng mock output (static mp4) để test UX flow.
Chưa có backend, chưa có auth, chưa có payment.

Xem chi tiết: `ROADMAP.md`
