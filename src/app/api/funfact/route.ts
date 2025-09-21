import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const DEFAULT_ERROR = "We couldn't fetch a fun fact right now. Please try again in a little while.";

type FactResult = {
  fact?: string;
  error?: string;
};

function normalizeOpenAIError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return DEFAULT_ERROR;
  }

  const message =
    (error as { message?: string }).message ??
    (error as { error?: { message?: string } }).error?.message ??
    (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message;

  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return DEFAULT_ERROR;
}

async function generateFact(movie: string): Promise<FactResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { error: "OPENAI_API_KEY is not configured on the server." };
  }

  const client = new OpenAI({ apiKey });
  const models = (process.env.OPENAI_MODEL?.split(",") ?? ["gpt-4o-mini", "gpt-3.5-turbo"])
    .map((model) => model.trim())
    .filter(Boolean);

  const requestId = crypto.randomUUID();
  const userPrompt = `Movie: ${movie} \nRequest ID: ${requestId}\nShare one short, spoiler-free fun fact. Keep it under 40 words and avoid repeating facts you might have given for other request IDs.`;

  for (const model of models) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a film trivia assistant who always varies the angle of each answer (production, cast, reception, symbolism, etc.).",
          },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.3,
        max_tokens: 120,
      });

      const fact = completion.choices[0]?.message?.content?.trim();
      if (fact) {
        return { fact };
      }
    } catch (error) {
      console.error(`OpenAI fun fact error with model ${model}`, error);
      const normalized = normalizeOpenAIError(error);

      if (models.length === 1 || model === models[models.length - 1]) {
        return { error: normalized };
      }
    }
  }

  return { error: DEFAULT_ERROR };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { favoriteMovie: true },
  });

  const movie = user?.favoriteMovie?.trim();

  if (!movie) {
    return NextResponse.json({ error: "No favorite movie set" }, { status: 400 });
  }

  const result = await generateFact(movie);

  if (result.fact) {
    return NextResponse.json({ fact: result.fact });
  }

  return NextResponse.json({ error: result.error ?? DEFAULT_ERROR }, { status: 502 });
}
