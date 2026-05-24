# DEPLOY — Vercel Deploy & Environment

> Đọc file này khi deploy, setup env, hoặc troubleshoot production.

---

## Vercel Setup

```bash
# Cài Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy lần đầu (từ root project)
vercel

# Deploy production
vercel --prod
```

---

## Environment Variables

### Local (.env.local)

```bash
# AI
OPENAI_API_KEY=sk-...                         # server-side only

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mood-story-unsigned

# Dev
NEXT_PUBLIC_USE_MOCK=true                     # bật để skip AI + dùng mock video
```

### Vercel Dashboard

Vào Settings → Environment Variables, thêm:

```
OPENAI_API_KEY          → Production + Preview
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    → All
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET → All
NEXT_PUBLIC_USE_MOCK    → false (Production), true (Preview)
```

---

## next.config.ts bắt buộc

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bắt buộc cho FFmpeg.wasm
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },

  // Cloudinary image optimization
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },

  // FFmpeg.wasm là CommonJS package
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
```

---

## Cloudinary Setup

1. Tạo tài khoản tại cloudinary.com (free: 25GB)
2. Vào Settings → Upload → Upload Presets
3. Tạo preset mới:
   - Name: `mood-story-unsigned`
   - Signing Mode: **Unsigned** (để upload từ client không cần server)
   - Folder: `mood-story/uploads`
   - Allowed formats: `jpg,png,webp,mp4,mov`
   - Max file size: 50MB
4. Copy Cloud Name từ Dashboard → dán vào .env.local

---

## Vercel Free Tier Limits (đủ cho < 500 user)

| Resource             | Free Limit  | Estimated Usage            |
| -------------------- | ----------- | -------------------------- |
| Bandwidth            | 100GB/month | ~10GB (500 user)           |
| Function duration    | 10s         | ❗ Cần chú ý API routes AI |
| Function invocations | 100k/month  | Đủ                         |
| Build minutes        | 6000/month  | Đủ                         |

**Lưu ý:** API routes gọi OpenAI có thể timeout 10s nếu GPT chậm.
Giải pháp: dùng Vercel Edge Runtime hoặc tăng timeout:

```typescript
// src/app/api/ai/analyze/route.ts
export const maxDuration = 30; // Vercel Pro feature, Free = 10s max
```

Với Free tier, optimize prompt để GPT trả về trong < 8s.

---

## Checklist trước khi deploy

```
[ ] pnpm build chạy không có lỗi
[ ] OPENAI_API_KEY đã set trên Vercel
[ ] Cloudinary upload preset là "Unsigned"
[ ] NEXT_PUBLIC_USE_MOCK=false trên Production
[ ] Test upload ảnh thật trên mobile browser
[ ] Test download MP4 trên iOS Safari (quan trọng — iOS có quirk với blob download)
[ ] Kiểm tra COOP/COEP headers trên production (DevTools → Network → Response Headers)
```

---

## iOS Safari Blob Download Fix

iOS Safari không support `a[download]` với blob URL. Workaround:

```typescript
function downloadVideo(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  // iOS Safari: mở trong tab mới, user tự save
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.open(url, "_blank");
    return;
  }

  // Android + Desktop: download bình thường
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## Monitoring (Free)

- **Vercel Analytics** — enable trong Vercel Dashboard → Analytics
- **Vercel Speed Insights** — `pnpm add @vercel/speed-insights`
- Error tracking: console.error đủ dùng cho V1, thêm Sentry ở V3
