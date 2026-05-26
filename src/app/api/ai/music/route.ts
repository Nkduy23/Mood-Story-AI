import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { moodPackId, storyType, overallVibe, availableTracks } = await req.json();

    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 50,
      messages: [
        {
          role: "system",
          content: "You suggest music tracks. Return ONLY JSON with trackId field.",
        },
        {
          role: "user",
          content: `Mood: ${moodPackId}
Story: ${storyType}
Vibe: ${overallVibe}
Tracks: ${JSON.stringify(availableTracks.map((t: { id: string; name: string; bpm: number }) => ({ id: t.id, name: t.name, bpm: t.bpm })))}
Return: {"trackId": "best-matching-id"}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    console.log(`[AI/music] tokens: ${response.usage?.total_tokens}`);

    return NextResponse.json(JSON.parse(response.choices[0].message.content!));
  } catch (err) {
    console.error("[AI/music] error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Music suggestion failed" }, { status: 500 });
  }
}
