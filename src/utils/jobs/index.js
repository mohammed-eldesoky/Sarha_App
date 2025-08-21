import cron from "node-cron";
import { Token } from "../../DB/models/token.model.js";

export function startExpiredTokensCron() {
  const task = cron.schedule(
    "0 * * * *",
    async () => {
      try {
        const now = new Date();
        const result = await Token.deleteMany({ expiresAt: { $lte: now } });
        console.log(`[CRON] Deleted expired tokens: ${result.deletedCount} @ ${now.toISOString()}`);
      } catch (err) {
        console.error("[CRON] Error deleting expired tokens:", err?.message || err);
      }
    },
    {
      timezone: "Africa/Cairo",
    }
  );

  task.start();
  console.log("[CRON] Expired tokens cleanup scheduled (runs hourly).");
}