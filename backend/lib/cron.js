import { CronJob } from "cron";
import http from "node:http";
import https from "node:https";

const job = new CronJob("*/14 * * * *", function () {
  const base = process.env.FRONTEND_URL;

  if (!base) {
    console.warn("⚠️ Keep-alive skipped: FRONTEND_URL is not defined in environment variables.");
    return;
  }

  try {
    const url = new URL("/health", base).href;
    const client = url.startsWith("https:") ? https : http;

    client
      .get(url, (res) => {
        if (res.statusCode === 200) {
          console.log("✅ Keep-alive GET request sent successfully");
        } else {
          console.log("⚠️ Keep-alive GET request failed. Status Code:", res.statusCode);
        }
      })
      .on("error", (e) => console.error("❌ Error while sending request:", e.message));
  } catch (error) {
    console.error("❌ Invalid FRONTEND_URL format:", error.message);
  }
});

export default job;