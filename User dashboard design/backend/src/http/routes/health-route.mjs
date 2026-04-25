export function handleHealthRoute() {
  return {
    status: "ok",
    service: "automation-validator-api",
    timestamp: new Date().toISOString(),
  };
}
