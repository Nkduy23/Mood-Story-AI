# AI_INTEGRATION — OpenAI GPT-4o Vision

> Đọc file này khi làm việc với OpenAI API, frame analysis, caption generation.

---

## Models được dùng

| Task                                 | Model         | Lý do                  |
| ------------------------------------ | ------------- | ---------------------- |
| Frame analysis (chọn đoạn video đẹp) | `gpt-4o`      | Cần Vision             |
| Narrative ordering (sắp xếp ảnh)     | `gpt-4o`      | Cần Vision + reasoning |
| Caption generation                   | `gpt-4o-mini` | Text only, rẻ hơn 10x  |
| Music suggestion                     | `gpt-4o-mini` | Text only              |

---

## API Key Setup

```typescript
// QUAN TRỌNG: API key chỉ dùng server-side
// Không bao giờ để NEXT_PUBLIC_OPENAI_API_KEY

// .env.local
OPENAI_API_KEY=sk-...

// Gọi qua Next.js API Route, không gọi trực tiếp từ client
// src/app/api/ai/analyze/route.ts
```

---

## API Routes Structure

```
src/app/api/
├── ai/
│   ├── analyze/route.ts      # Frame analysis + narrative order
│   ├── caption/route.ts      # Caption generation
│   └── music/route.ts        # Music suggestion
```

---

## 1. Frame Analysis — chọn đoạn video/ảnh tốt nhất

### Endpoint

```
POST /api/ai/analyze
```

### Input

```typescript
interface AnalyzeRequest {
  files: {
    id: string;
    url: string; // Cloudinary URL
    type: "image" | "video";
    duration?: number; // giây, chỉ có với video
  }[];
  moodPackId: string;
  storyType: StoryType;
}
```

### Server Route

```typescript
// src/app/api/ai/analyze/route.ts
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { files, moodPackId, storyType }: AnalyzeRequest = await req.json();

  // Build content array với images
  const imageContent = files.map((file) => ({
    type: "image_url" as const,
    image_url: {
      // Cloudinary transformation: lấy thumbnail nhỏ để tiết kiệm token
      url: file.url.replace("/upload/", "/upload/w_512,h_512,c_fill/"),
      detail: "low" as const, // low detail = ít token hơn, đủ cho việc này
    },
  }));

  const systemPrompt = `
You are a video editor AI. Analyze the provided images/video frames and return JSON only.
You understand visual aesthetics, composition, lighting, and how to match visuals to mood/vibe.
Current mood: ${moodPackId}
Story type: ${storyType}
`;

  const userPrompt = `
Analyze these ${files.length} media files for a "${moodPackId}" mood "${storyType}" story.

Return ONLY valid JSON in this exact format:
{
  "narrativeOrder": [0, 2, 1],
  "selectedSegments": [
    {
      "fileId": "file-id-here",
      "startTime": 0,
      "endTime": 5,
      "score": 0.9,
      "reason": "Good lighting, clear subject"
    }
  ],
  "overallVibe": "brief description",
  "suggestedDuration": 15
}

Rules:
- narrativeOrder: reorder files for best narrative flow (index of original array)
- selectedSegments: for video files, pick the BEST 5-second segment
- For image files: startTime=0, endTime=duration of slot
- score: 0.0-1.0 how well it fits the mood
- suggestedDuration: 10, 15, 20, or 25 seconds
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 500,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [{ type: "text", text: userPrompt }, ...imageContent],
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(response.choices[0].message.content!);
  return NextResponse.json(result);
}
```

---

## 2. Caption Generation — đọc ảnh sinh text

### Endpoint

```
POST /api/ai/caption
```

```typescript
// src/app/api/ai/caption/route.ts

export async function POST(req: NextRequest) {
  const { imageUrl, moodPackId, captionPromptHint } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Không cần Vision cho caption nếu đã có context
    max_tokens: 100,
    messages: [
      {
        role: "system",
        content: `You generate short, aesthetic captions for social media stories.
Style: ${captionPromptHint}
Rules:
- 1-2 lines maximum
- No hashtags
- No emojis unless explicitly asked
- Match the mood perfectly
- Return ONLY the caption text, nothing else`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "low" },
          },
          {
            type: "text",
            text: `Generate a caption for this image in "${moodPackId}" mood.`,
          },
        ],
      },
    ],
  });

  return NextResponse.json({
    caption: response.choices[0].message.content!.trim(),
  });
}
```

---

## 3. Music Suggestion

```typescript
// src/app/api/ai/music/route.ts
// Không cần Vision — chỉ cần match mood + context

export async function POST(req: NextRequest) {
  const { moodPackId, storyType, overallVibe, availableTracks } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 50,
    messages: [
      {
        role: "system",
        content: "You suggest music tracks. Return ONLY a JSON with trackId field.",
      },
      {
        role: "user",
        content: `
Mood: ${moodPackId}
Story type: ${storyType}
Visual vibe: ${overallVibe}
Available tracks: ${JSON.stringify(availableTracks.map((t: MusicTrack) => ({ id: t.id, name: t.name, bpm: t.bpm })))}

Pick the best track. Return: {"trackId": "nd-01"}
`,
      },
    ],
    response_format: { type: "json_object" },
  });

  return NextResponse.json(JSON.parse(response.choices[0].message.content!));
}
```

---

## Client-side Hook

```typescript
// features/editor/hooks/useAIAnalysis.ts

export function useAIAnalysis() {
  const [state, setState] = useState<AsyncState<AIAnalysisResult>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const analyze = async (files: UploadedFile[], moodPackId: string, storyType: StoryType) => {
    setState({ data: null, isLoading: true, error: null });

    try {
      // Mock mode
      if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
        await sleep(2500);
        setState({ data: MOCK_AI_RESULT, isLoading: false, error: null });
        return;
      }

      // Step 1: Analyze frames
      const analysis = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, moodPackId, storyType }),
      }).then((r) => r.json());

      // Step 2: Generate caption từ ảnh đẹp nhất
      const bestFile = files[analysis.narrativeOrder[0]];
      const captionData = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: bestFile.url,
          moodPackId,
          captionPromptHint: getMoodPack(moodPackId).captionPromptHint,
        }),
      }).then((r) => r.json());

      setState({
        data: { ...analysis, caption: captionData.caption },
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState({
        data: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "AI analysis failed",
      });
    }
  };

  return { analyze, ...state };
}
```

---

## Mock Data (cho dev)

```typescript
// lib/mocks/ai-result.ts
export const MOCK_AI_RESULT: AIAnalysisResult = {
  narrativeOrder: [0, 1, 2],
  selectedSegments: [
    { fileId: "mock-0", startTime: 0, endTime: 5, score: 0.92, reason: "Good composition" },
    { fileId: "mock-1", startTime: 2, endTime: 7, score: 0.87, reason: "Nice lighting" },
  ],
  overallVibe: "Late night city, reflective mood",
  suggestedDuration: 15,
  caption: "some nights feel heavier than they look",
  suggestedMusicId: "nd-01",
};
```

---

## Cost Estimation

| Operation      | Model       | Tokens | Cost/call   | Calls/user |
| -------------- | ----------- | ------ | ----------- | ---------- |
| Frame analysis | gpt-4o      | ~800   | ~$0.003     | 1          |
| Caption        | gpt-4o-mini | ~150   | ~$0.0001    | 1          |
| Music suggest  | gpt-4o-mini | ~100   | ~$0.00007   | 1          |
| **Total/user** |             |        | **~$0.003** |            |

**$5 budget = ~1,600 lần tạo video đầy đủ** — đủ test thoải mái.

---

## Error Cases cần xử lý

```typescript
// Rate limit → retry sau 1s, tối đa 3 lần
// Invalid image format → báo user upload lại
// Response không phải JSON hợp lệ → fallback về mock result
// Network timeout → show error + nút retry
```
