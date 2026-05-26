// src/lib/openai.ts
// Server-side only — không import file này từ client component

import OpenAI from "openai";

// Singleton
let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

// Re-export types dùng trong API routes
export type { OpenAI };
