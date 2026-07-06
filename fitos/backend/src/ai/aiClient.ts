import { env } from "../config/env";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-5";

export function isAiEnabled(): boolean {
  return !!env.anthropicApiKey;
}

/**
 * Sends a single prompt to Claude and returns the text response, or `null`
 * if no API key is configured or the call fails. Callers MUST treat `null`
 * as "use the deterministic rule-based fallback" - the AI layer is additive
 * narrative/QA on top of the rule engine, never a hard dependency.
 */
export async function generateText(prompt: string, maxTokens = 500): Promise<string | null> {
  if (!isAiEnabled()) return null;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error(`AI planner call failed: ${response.status} ${await response.text()}`);
      return null;
    }

    const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
    const textBlock = data.content?.find((b) => b.type === "text");
    return textBlock?.text ?? null;
  } catch (err) {
    console.error("AI planner call errored, falling back to rule-based output:", err);
    return null;
  }
}
