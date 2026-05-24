# Mood Story AI

> "Minimal editing. Maximum vibe." — tạo story aesthetic trong dưới 30 giây.

Mood Story AI là mobile-first web app giúp người dùng không biết edit video tạo ra
story/reel đẹp tự động bằng AI — upload ảnh/video, chọn mood, export ngay.

---

## Quick Start

```bash
# Yêu cầu: Node >= 18, pnpm >= 8
pnpm install
pnpm dev
```

Truy cập `http://localhost:3000`

---

## Tài liệu kỹ thuật

| File                       | Nội dung                                                   |
| -------------------------- | ---------------------------------------------------------- |
| `docs/CONTEXT.md`          | **Gửi file này cho AI trước tiên** — toàn bộ context dự án |
| `docs/ARCHITECTURE.md`     | Kiến trúc hệ thống, data flow, tech decisions              |
| `docs/FE_GUIDE.md`         | Convention, folder structure, coding pattern FE            |
| `docs/VIDEO_ENGINE.md`     | FFmpeg.wasm + Canvas pipeline, cách render video           |
| `docs/MOOD_ENGINE.md`      | Mood Pack system, parameter space, randomization           |
| `docs/AI_INTEGRATION.md`   | GPT-4o Vision, caption gen, frame analysis                 |
| `docs/STATE_MANAGEMENT.md` | Zustand store design                                       |
| `docs/ROADMAP.md`          | V1 → V3 task breakdown                                     |
| `docs/DEPLOY.md`           | Vercel deploy, env vars, checklist                         |

---

## Tech Stack

```
Frontend        Next.js 14 (App Router) + TypeScript + Tailwind CSS
Video Engine    FFmpeg.wasm + Canvas API
State           Zustand
AI              OpenAI GPT-4o Vision (frame analysis, caption)
Storage         Cloudinary free tier (upload) / localStorage (draft)
Deploy          Vercel
Package manager pnpm
```

---

## Triết lý sản phẩm

- **Target user:** người có ảnh/video đẹp nhưng không biết edit — chiếm 90% người dùng MXH
- **Không cạnh tranh** với editor giỏi trên CapCut
- **Cạnh tranh** bằng tốc độ và output trông chuyên nghiệp dù chỉ bấm 3 cái
- Output video: 10s / 15s / 20s / 25s — không dài hơn
- V1 hoàn toàn anonymous, không cần auth

---

## Cấu trúc thư mục

```
mood-story-ai/
├── README.md
├── ARCHITECTURE.md
├── docs/
│   ├── CONTEXT.md
│   ├── FE_GUIDE.md
│   ├── VIDEO_ENGINE.md
│   ├── MOOD_ENGINE.md
│   ├── AI_INTEGRATION.md
│   ├── STATE_MANAGEMENT.md
│   ├── ROADMAP.md
│   └── DEPLOY.md
├── .cursor/
│   └── rules/
│       ├── general.mdc
│       └── video-engine.mdc
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── upload/
│   │   ├── editor/
│   │   ├── export/
│   │   └── mood-engine/
│   ├── lib/
│   ├── hooks/
│   ├── store/
│   ├── styles/
│   └── types/
├── public/
│   └── music/           # nhạc pre-selected theo mood pack
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```
