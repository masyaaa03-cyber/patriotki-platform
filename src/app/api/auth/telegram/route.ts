import { createHmac } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
  }

  // Проверяем подпись от Telegram
  const { hash, ...authData } = data;
  const checkString = Object.keys(authData)
    .sort()
    .map((key) => `${key}=${authData[key]}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const hmac = createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (hmac !== hash) {
    return NextResponse.json({ error: "Invalid hash" }, { status: 403 });
  }

  // Telegram auth verified — в реальном приложении здесь создаём сессию через Supabase
  // Для MVP возвращаем данные пользователя
  return NextResponse.json({
    success: true,
    user: {
      telegram_id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
    },
  });
}
