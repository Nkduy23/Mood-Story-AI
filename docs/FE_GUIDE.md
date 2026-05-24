# FE_GUIDE — Frontend Convention & Structure

> Đọc file này khi viết bất kỳ component, page, hoặc hook nào.

---

## Init dự án

```bash
pnpm create next-app@latest mood-story-ai \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd mood-story-ai

# Cài thêm dependencies
pnpm add zustand @ffmpeg/ffmpeg @ffmpeg/util clsx tailwind-merge
pnpm add -D @types/node
```

---

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, font, metadata
│   ├── page.tsx                # Home — chọn Story Type + Mood
│   ├── create/
│   │   └── page.tsx            # Upload + Editor flow
│   ├── preview/
│   │   └── page.tsx            # Preview + Export
│   └── globals.css
│
├── components/
│   ├── ui/                     # Primitive components (Button, Card, etc.)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   └── index.ts
│   └── layout/
│       ├── MobileContainer.tsx # Max-width wrapper, safe area
│       └── BottomNav.tsx
│
├── features/
│   ├── upload/
│   │   ├── components/
│   │   │   ├── UploadZone.tsx
│   │   │   ├── MediaPreview.tsx
│   │   │   └── FileThumb.tsx
│   │   ├── hooks/
│   │   │   └── useUpload.ts
│   │   └── index.ts
│   │
│   ├── editor/
│   │   ├── components/
│   │   │   ├── MoodPicker.tsx
│   │   │   ├── StoryTypePicker.tsx
│   │   │   ├── CaptionEditor.tsx
│   │   │   ├── MusicSelector.tsx
│   │   │   └── CanvasPreview.tsx
│   │   ├── hooks/
│   │   │   ├── useAIAnalysis.ts
│   │   │   └── useCanvasPreview.ts
│   │   └── index.ts
│   │
│   ├── export/
│   │   ├── components/
│   │   │   ├── ExportButton.tsx
│   │   │   ├── PlatformSelector.tsx
│   │   │   └── RenderProgress.tsx
│   │   ├── hooks/
│   │   │   └── useFFmpegRender.ts
│   │   └── index.ts
│   │
│   └── mood-engine/
│       ├── packs/              # Mood Pack definitions
│       │   ├── night-drive.ts
│       │   ├── chill.ts
│       │   ├── sad.ts
│       │   ├── coding.ts
│       │   ├── cinematic.ts
│       │   └── neon.ts
│       ├── randomizer.ts       # Parameter space randomization
│       ├── types.ts
│       └── index.ts
│
├── store/
│   ├── uploadStore.ts
│   ├── editorStore.ts
│   ├── exportStore.ts
│   └── index.ts
│
├── hooks/
│   └── useMediaQuery.ts        # Responsive hooks
│
├── lib/
│   ├── cloudinary.ts           # Upload helpers
│   ├── openai.ts               # API call wrappers
│   ├── ffmpeg.ts               # FFmpeg.wasm singleton
│   └── utils.ts                # cn(), formatDuration(), etc.
│
└── types/
    ├── media.ts
    ├── mood.ts
    └── render.ts
```

---

## Naming Convention

```typescript
// Components: PascalCase
UploadZone.tsx
MoodPicker.tsx

// Hooks: camelCase với prefix "use"
useUpload.ts
useFFmpegRender.ts

// Store: camelCase + "Store" suffix
uploadStore.ts

// Types/Interfaces: PascalCase, Interface prefix "I" không cần thiết
type MoodPack = { ... }
type RenderParams = { ... }

// Constants: SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE = 50 * 1024 * 1024
const ALLOWED_DURATIONS = [10, 15, 20, 25] as const

// Feature exports: re-export từ index.ts
// features/upload/index.ts
export { UploadZone } from './components/UploadZone'
export { useUpload } from './hooks/useUpload'
```

---

## Component Pattern

```typescript
// Luôn dùng pattern này cho component
import { type FC } from 'react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  className?: string
}

const UploadZone: FC<UploadZoneProps> = ({
  onFilesSelected,
  maxFiles = 5,
  className,
}) => {
  return (
    <div className={cn('...base styles...', className)}>
      {/* content */}
    </div>
  )
}

export { UploadZone }
```

---

## Styling Rules

```typescript
// Dùng cn() từ lib/utils cho conditional classes
import { cn } from '@/lib/utils'

// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mobile-first — luôn viết base styles cho mobile trước
// BAD
<div className="hidden md:flex">

// GOOD — nếu cần ẩn trên mobile thì explicit
<div className="flex md:hidden">

// Màu sắc — dùng CSS variables cho theme dark
// globals.css define:
// --color-bg-primary, --color-text-primary, etc.
```

---

## Tailwind Config bổ sung

```javascript
// tailwind.config.ts
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          purple: "#9b7cf4",
          pink: "#f472b6",
        },
        // Dark theme surfaces
        surface: {
          DEFAULT: "#0a0a0f",
          card: "#14121f",
          elevated: "#1a1828",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
};
```

---

## Page Flow (App Router)

```
/ (page.tsx)
  → Chọn Story Type
  → Chọn Mood Pack
  → CTA "Start Creating" → navigate /create

/create (page.tsx)
  → UploadZone
  → AI Processing (loading state)
  → CaptionEditor
  → MusicSelector
  → CTA "Preview" → navigate /preview

/preview (page.tsx)
  → CanvasPreview (mock hoặc real)
  → Nút "Shuffle" (random lại tham số)
  → PlatformSelector
  → CTA "Export" → trigger FFmpeg render
  → Download
```

---

## Error Handling Pattern

```typescript
// Mọi async operation đều theo pattern này
type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

// Trong hook
const [state, setState] = useState<AsyncState<RenderResult>>({
  data: null,
  isLoading: false,
  error: null,
});

const doSomething = async () => {
  setState((prev) => ({ ...prev, isLoading: true, error: null }));
  try {
    const result = await someAsyncOperation();
    setState({ data: result, isLoading: false, error: null });
  } catch (err) {
    setState({
      data: null,
      isLoading: false,
      error: err instanceof Error ? err.message : "Lỗi không xác định",
    });
  }
};
```

---

## Mock Strategy cho V1

Khi chưa có BE hoặc chưa muốn tốn OpenAI credit khi dev:

```typescript
// lib/openai.ts — toggle mock mode
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export async function analyzeMedia(files: CloudinaryFile[], mood: MoodPack) {
  if (USE_MOCK) {
    // Trả về mock data sau 2s để simulate loading
    await sleep(2000);
    return MOCK_AI_RESULT;
  }
  // real API call
}

// .env.local
NEXT_PUBLIC_USE_MOCK = true;
```

---

## Performance Rules

1. FFmpeg.wasm: load lazy bằng dynamic import, không import ở top-level
2. Canvas: dùng `requestAnimationFrame` cho animation preview
3. Images: dùng `next/image` với Cloudinary loader
4. Code splitting: mỗi feature page là separate chunk (App Router tự làm)
5. Bundle size: kiểm tra `pnpm build` — FFmpeg.wasm sẽ lớn, là bình thường
