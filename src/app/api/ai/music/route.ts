// app/api/ai/music/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { getTracksByTags, getDefaultTrack } from "@/lib/musicLibrary";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { moodPackId, storyType, overallVibe, musicTags } = await req.json();

    // Lấy candidates từ musicLibrary thay vì nhận từ client
    const candidates = getTracksByTags(musicTags ?? []);
    const tracks = candidates.length > 0 ? candidates : [getDefaultTrack()];

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
Tracks: ${JSON.stringify(tracks.map((t) => ({ id: t.id, name: t.name, bpm: t.bpm, energy: t.energy, genre: t.genre })))}
Return: {"trackId": "best-matching-id"}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    console.log(`[AI/music] tokens: ${response.usage?.total_tokens} | candidates: ${tracks.length}`);

    const { trackId } = JSON.parse(response.choices[0].message.content!);

    // Trả về full track object thay vì chỉ trackId
    const selectedTrack = tracks.find((t) => t.id === trackId) ?? tracks[0];

    return NextResponse.json({
      trackId: selectedTrack.id,
      track: selectedTrack,
    });
  } catch (err) {
    console.error("[AI/music] error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Music suggestion failed" }, { status: 500 });
  }
}
