import { type NextRequest, NextResponse } from "next/server"
import { ENV } from "@/lib/env"

interface TelegramMessage {
  message_id: number
  from: {
    id: number
    is_bot: boolean
    first_name: string
    username?: string
  }
  chat: {
    id: number
    first_name: string
    username?: string
    type: string
  }
  date: number
  text: string
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
}

// Telegram bot token from environment variables
const TELEGRAM_BOT_TOKEN = ENV.get("TELEGRAM_BOT_TOKEN", "")
const TELEGRAM_ALLOWED_USERS = ENV.get("TELEGRAM_ALLOWED_USERS", "").split(",")

// POST /api/telegram - Handle Telegram webhook
export async function POST(request: NextRequest) {
  try {
    // Check if Telegram integration is enabled
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "Telegram integration is not configured" }, { status: 400 })
    }

    const update: TelegramUpdate = await request.json()

    // Validate update
    if (!update || !update.message) {
      return NextResponse.json({ error: "Invalid Telegram update" }, { status: 400 })
    }

    // Check if user is allowed
    const username = update.message.from.username
    if (username && TELEGRAM_ALLOWED_USERS.length > 0 && !TELEGRAM_ALLOWED_USERS.includes(username)) {
      console.log(`Unauthorized Telegram access attempt from: ${username}`)
      return NextResponse.json({ ok: true }) // Return OK to avoid Telegram retries
    }

    // Process message
    const message = update.message
    const chatId = message.chat.id
    const text = message.text

    // Process commands
    if (text.startsWith("/")) {
      await handleCommand(chatId, text)
    } else {
      // Process regular message
      await sendTelegramMessage(chatId, `Received: ${text}`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error processing Telegram webhook:", error)
    return NextResponse.json({ error: "Failed to process Telegram webhook" }, { status: 500 })
  }
}

/**
 * Handle Telegram bot commands
 * @param chatId Telegram chat ID
 * @param command Command text
 */
async function handleCommand(chatId: number, command: string): Promise<void> {
  const cmd = command.split(" ")[0].toLowerCase()

  switch (cmd) {
    case "/start":
      await sendTelegramMessage(chatId, "Welcome to BHAWT! Use /help to see available commands.")
      break

    case "/help":
      await sendTelegramMessage(
        chatId,
        "Available commands:\n" +
          "/status - Get bot status\n" +
          "/targets - List active targets\n" +
          "/add_target [token] [amount] - Add a new target\n" +
          "/remove_target [token] - Remove a target\n" +
          "/transactions - List recent transactions",
      )
      break

    case "/status":
      await sendTelegramMessage(
        chatId,
        "🤖 BHAWT Status:\n" +
          "✅ Bot is running\n" +
          "🎯 Active targets: 3\n" +
          "⏳ Pending transactions: 1\n" +
          "✅ Successful snipes: 12\n" +
          "❌ Failed snipes: 2",
      )
      break

    default:
      await sendTelegramMessage(chatId, "Unknown command. Use /help to see available commands.")
      break
  }
}

/**
 * Send a message to a Telegram chat
 * @param chatId Telegram chat ID
 * @param text Message text
 */
async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Telegram API error:", errorData)
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error)
  }
}
