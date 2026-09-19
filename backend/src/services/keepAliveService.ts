import { config } from "../config/env.ts";

const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes — under Render's 15-minute idle spin-down

/**
 * Pings this service's own public /health endpoint on an interval so the
 * Render free tier does not spin down between app store reviewer sessions or
 * gaps in mobile traffic. No-op unless KEEP_ALIVE_URL is set in the
 * environment (set it to the deployed Render URL, e.g.
 * https://pitchnest-live.onrender.com).
 */
export function startKeepAlive() {
  if (!config.keepAliveUrl) return;

  const url = `${config.keepAliveUrl.replace(/\/$/, "")}/health`;

  setInterval(() => {
    fetch(url).catch(() => {
      // Ignore transient network errors — this is best-effort only.
    });
  }, PING_INTERVAL_MS);

  console.log(`🫀 Keep-alive ping enabled for ${url}`);
}
