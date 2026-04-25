import { createServer } from "node:http";
import { DEMO_DATASETS } from "../src/app/lib/validation-core.js";
import { getEnv } from "./src/config/env.mjs";
import { handleHealthRoute } from "./src/http/routes/health-route.mjs";
import { handleIngestRoute } from "./src/http/routes/ingest-route.mjs";
import { handleValidateRoute } from "./src/http/routes/validate-route.mjs";

const { port } = getEnv();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, handleHealthRoute());
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/demo-datasets") {
    sendJson(response, 200, { demoDatasets: Object.keys(DEMO_DATASETS) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/ingest") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, await handleIngestRoute(body));
    } catch (error) {
      sendJson(response, 400, {
        error: "Invalid request body",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/validate") {
    try {
      const body = await readJsonBody(request);
      sendJson(response, 200, await handleValidateRoute(body.csv, body.mappingOverrides));
    } catch (error) {
      sendJson(response, 400, {
        error: "Invalid request body",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Automation validator API listening on http://localhost:${port}`);
});
