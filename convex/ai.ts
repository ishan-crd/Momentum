"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

// Google Gemini API (free tier: https://aistudio.google.com/app/apikey)
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// Models to try in order; first with free-tier quota wins (2.0-flash often has limit: 0)
const MODELS = ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-2.0-flash"] as const;

async function chat(system: string, user: string, maxTokens = 300): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    throw new Error(
      "GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/app/apikey and add it in Convex Dashboard → Settings → Environment Variables."
    );
  const prompt = `${system}\n\n${user}`;
  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.3,
    },
  });

  let lastError: string | null = null;
  for (const model of MODELS) {
    const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      return text;
    }
    const errText = await res.text();
    lastError = `Gemini API error: ${res.status} ${errText}`;
    // 404 = model not found, try next; 429 = quota, retry this model once after delay
    if (res.status === 404) continue;
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 22000)); // ~20s as API suggests
      const retry = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (retry.ok) {
        const data = (await retry.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
        return text;
      }
      lastError = `Gemini API error: ${retry.status} ${await retry.text()}`;
    }
    break; // non-404, non-429 or retry failed
  }
  throw new Error(lastError ?? "Gemini API request failed");
}

function parseTaskList(text: string): string[] {
  const lines = text
    .split(/\n/)
    .map((s) => s.replace(/^[\d\-*•.]+\s*/, "").trim())
    .filter((s) => s.length > 0);
  return lines.slice(0, 6);
}

export const breakTask = action({
  args: { title: v.string() },
  handler: async (_ctx, { title }) => {
    const system = `You are a productivity assistant. Break the given task into 3-5 concrete subtasks. Reply with ONLY the subtask titles, one per line. No numbering, bullets, or extra text.`;
    const out = await chat(system, `Task: ${title}`, 200);
    return parseTaskList(out);
  },
});

export const breakGoal = action({
  args: { title: v.string() },
  handler: async (_ctx, { title }) => {
    const system = `You are a productivity assistant. Break the given goal into 3-5 concrete actionable tasks. Reply with ONLY the task titles, one per line. No numbering, bullets, or extra text.`;
    const out = await chat(system, `Goal: ${title}`, 200);
    return parseTaskList(out);
  },
});

export const todayFocus = action({
  args: {
    topTasks: v.array(v.string()),
    overdue: v.array(v.string()),
    goalTitle: v.optional(v.string()),
  },
  handler: async (_ctx, { topTasks, overdue, goalTitle }) => {
    const system = `You are a productivity coach. Given the user's top tasks, overdue items, and optional goal, write exactly ONE short sentence (under 15 words) suggesting what to focus on today. Be direct and encouraging. No quotes or preamble.`;
    const parts = [
      topTasks.length ? `Top tasks: ${topTasks.join(", ")}` : "",
      overdue.length ? `Overdue: ${overdue.join(", ")}` : "",
      goalTitle ? `Active goal: ${goalTitle}` : "",
    ].filter(Boolean);
    const user = parts.length ? parts.join("\n") : "No tasks or goals yet.";
    const out = await chat(system, user, 80);
    return out.split("\n")[0]?.trim() || "Focus on one thing at a time.";
  },
});

export const suggestGoalTasks = action({
  args: { goalTitle: v.string() },
  handler: async (_ctx, { goalTitle }) => {
    const system = `You are a productivity assistant. Suggest 3 concrete next tasks that would move this goal forward. Reply with ONLY the task titles, one per line. No numbering, bullets, or extra text.`;
    const out = await chat(system, `Goal: ${goalTitle}`, 150);
    return parseTaskList(out);
  },
});
