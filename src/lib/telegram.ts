import type { TelegramPost } from "@/types";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: { id: number };
  };
  description?: string;
}

// שליחת פוסט לערוץ טלגרם
export async function sendTelegramPost(post: TelegramPost): Promise<string | null> {
  try {
    if (post.imageUrl) {
      return await sendPhotoWithCaption(post.imageUrl, post.text);
    }
    return await sendTextMessage(post.text);
  } catch (error) {
    console.error("Telegram send error:", error);
    return null;
  }
}

async function sendTextMessage(text: string): Promise<string | null> {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });

  const data: TelegramResponse = await response.json();
  if (!data.ok) {
    console.error("Telegram API error:", data.description);
    return null;
  }

  return data.result?.message_id?.toString() ?? null;
}

async function sendPhotoWithCaption(photoUrl: string, caption: string): Promise<string | null> {
  const response = await fetch(`${TELEGRAM_API}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      photo: photoUrl,
      caption,
      parse_mode: "HTML",
      show_caption_above_media: true,
    }),
  });

  const data: TelegramResponse = await response.json();
  if (!data.ok) {
    // fallback: שלח טקסט בלבד אם התמונה נכשלה
    console.warn("Photo send failed, falling back to text:", data.description);
    return await sendTextMessage(caption);
  }

  return data.result?.message_id?.toString() ?? null;
}

// קבלת מספר מנויים
export async function getChannelSubscriberCount(): Promise<number> {
  try {
    const response = await fetch(`${TELEGRAM_API}/getChatMemberCount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHANNEL_ID }),
    });

    const data = await response.json();
    return data.ok ? data.result : 0;
  } catch {
    return 0;
  }
}

// מחיקת הודעה
export async function deleteTelegramMessage(messageId: string): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_API}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        message_id: parseInt(messageId, 10),
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch {
    return false;
  }
}

// הגבלת קצב - מקסימום 15 פוסטים ביום
const MAX_DAILY_POSTS = 15;

export async function canPostToday(todayPostCount: number): Promise<boolean> {
  return todayPostCount < MAX_DAILY_POSTS;
}
