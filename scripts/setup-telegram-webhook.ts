/**
 * Sets up the Telegram webhook URL for the Clickly bot.
 *
 * Usage:
 *   npx tsx scripts/setup-telegram-webhook.ts
 *
 * Requires TELEGRAM_BOT_TOKEN environment variable.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL =
  "https://affiliate-platform-teal.vercel.app/api/telegram/webhook";

if (!BOT_TOKEN) {
  console.error("Error: TELEGRAM_BOT_TOKEN environment variable is not set.");
  process.exit(1);
}

async function setupWebhook() {
  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: WEBHOOK_URL }),
    }
  );

  const result = await response.json();
  console.log("Webhook setup result:", result);

  if (!result.ok) {
    console.error("Failed to set webhook:", result.description);
    process.exit(1);
  }

  console.log(`Webhook successfully set to: ${WEBHOOK_URL}`);
}

setupWebhook();
