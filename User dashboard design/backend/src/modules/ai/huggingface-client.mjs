import { getEnv } from "../../config/env.mjs";

const SYSTEM_PROMPT = [
  "You help validate tabular CSV imports for business automation.",
  "Return strict JSON only.",
  "Do not include markdown fences or commentary.",
].join(" ");

function extractJson(content) {
  if (!content) {
    return null;
  }

  const rawContent = Array.isArray(content)
    ? content.map((part) => (typeof part === "string" ? part : part?.text ?? "")).join("")
    : String(content);
  const trimmed = rawContent.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const objectStart = candidate.indexOf("{");
    const objectEnd = candidate.lastIndexOf("}");

    if (objectStart !== -1 && objectEnd > objectStart) {
      try {
        return JSON.parse(candidate.slice(objectStart, objectEnd + 1));
      } catch {
        return null;
      }
    }

    return null;
  }
}

export function isHuggingFaceEnabled() {
  const { hfToken } = getEnv();
  return Boolean(hfToken);
}

export function getAiProviderLabel() {
  return isHuggingFaceEnabled() ? "huggingface" : "fallback";
}

function withProviderPolicy(model) {
  return model.includes(":") ? model : `${model}:fastest`;
}

async function postChatCompletion(body, hfToken, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function getSchemaPrompt(schemaDefinition) {
  if (typeof schemaDefinition === "string") {
    return schemaDefinition;
  }

  return JSON.stringify(schemaDefinition.example ?? schemaDefinition.schema);
}

export async function requestHuggingFaceJson(userPrompt, schemaDefinition) {
  const { hfToken, hfModel, hfTimeoutMs } = getEnv();

  if (!hfToken) {
    return null;
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `${userPrompt}\n\nReturn only valid JSON matching this shape:\n${getSchemaPrompt(schemaDefinition)}`,
    },
  ];

  const body = {
    model: withProviderPolicy(hfModel),
    temperature: 0.1,
    max_tokens: 700,
    response_format: { type: "json_object" },
    messages,
  };

  let response;

  try {
    response = await postChatCompletion(body, hfToken, hfTimeoutMs);
  } catch (error) {
    const details = error instanceof Error ? error.message : "request failed";
    throw new Error(`Hugging Face request failed: ${details}`);
  }

  if (!response.ok) {
    throw new Error(`Hugging Face request failed with status ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  const parsed = extractJson(content);

  if (!parsed) {
    throw new Error("Hugging Face response did not contain valid JSON");
  }

  return parsed;
}
