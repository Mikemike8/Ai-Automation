import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let cachedEnvFile = null;

function loadDotEnv() {
  if (cachedEnvFile) {
    return cachedEnvFile;
  }

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(currentDir, "../../../.env");

  if (!fs.existsSync(envPath)) {
    cachedEnvFile = {};
    return cachedEnvFile;
  }

  const contents = fs.readFileSync(envPath, "utf8");
  const parsed = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    parsed[key] = value;
  }

  cachedEnvFile = parsed;
  return cachedEnvFile;
}

export function getEnv() {
  const dotEnv = loadDotEnv();

  return {
    port: Number(process.env.PORT || dotEnv.PORT || 8787),
    nodeEnv: process.env.NODE_ENV || "development",
    hfToken: process.env.HF_TOKEN || dotEnv.HF_TOKEN || "",
    hfModel: process.env.HF_MODEL || dotEnv.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct-1M",
    hfTimeoutMs: Number(process.env.HF_TIMEOUT_MS || dotEnv.HF_TIMEOUT_MS || 15000),
  };
}
