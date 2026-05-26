import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { getOptimizedUrl } from "@/lib/cloudinary";
import type { StoryType } from "@/features/mood-engine";

export const runtime = "edge"; // tránh 10s timeout Vercel free

interface AnalyzeRequestFile {
  id: string;
  url: string;
  type: "image" | "video";
  duration?: number;
}

interface AnalyzeRequest {
  files: AnalyzeRequestFile[];
  moodPackId: string;
  storyType: StoryType;
}

export async function POST(req: NextRequest) {
  try {
    const { files, moodPackId, storyType }: AnalyzeRequest = await req.json();

    if (!files?.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const openai = getOpenAIClient();

    const imageContent = files.map((file) => ({
      type: "image_url" as const,
      image_url: {
        url: getOptimizedUrl(file.url, 512),
        detail: "low" as const,
      },
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You are a video editor AI. Analyze images and return JSON only.
Mood: ${moodPackId}. Story type: ${storyType}.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze these ${files.length} files for a "${moodPackId}" mood "${storyType}" story.
Return ONLY valid JSON:
{
  "narrativeOrder": [0, 1, 2],
  "selectedSegments": [
    { "fileId": "id", "startTime": 0, "endTime": 5, "score": 0.9, "reason": "..." }
  ],
  "overallVibe": "brief description",
  "suggestedDuration": 15
}
Rules:
- narrativeOrder: best order for narrative flow (indices of input array)
- selectedSegments: for video pick best 5s segment, for image startTime=0
- suggestedDuration: 10, 15, 20, or 25 only`,
            },
            ...imageContent,
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content!);

    // Log cost
    console.log(`[AI/analyze] tokens: ${response.usage?.total_tokens} | files: ${files.length}`);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[AI/analyze] error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Analysis failed" }, { status: 500 });
  }
}
