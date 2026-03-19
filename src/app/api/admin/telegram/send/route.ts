import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "";

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text,
        parse_mode: "HTML",
      }),
    }
  );

  const data = await response.json();

  if (!data.ok) {
    return NextResponse.json({ error: data.description }, { status: 400 });
  }

  return NextResponse.json({ success: true, messageId: data.result.message_id });
}
