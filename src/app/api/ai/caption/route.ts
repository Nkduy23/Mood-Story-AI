import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { getOptimizedUrl } from "@/lib/cloudinary";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, moodPackId, captionPromptHint } = await req.json();

    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: `You generate short aesthetic captions for social media stories.
Style: ${captionPromptHint}
Rules: 1-2 lines max. No hashtags. No emojis. Match the mood. Return ONLY the caption text.`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: getOptimizedUrl(imageUrl, 512), detail: "low" },
            },
            {
              type: "text",
              text: `Generate a caption for this image in "${moodPackId}" mood.`,
            },
          ],
        },
      ],
    });

    console.log(`[AI/caption] tokens: ${response.usage?.total_tokens}`);

    return NextResponse.json({
      caption: response.choices[0].message.content!.trim(),
    });
  } catch (err) {
    console.error("[AI/caption] error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Caption failed" }, { status: 500 });
  }
}
