import { type NextRequest, NextResponse } from "next/server"
import { jupiterService } from "@/services/jupiter-service"
import { ENV } from "@/lib/env"

// GET /api/jupiter/tokens - Get all tokens supported by Jupiter
export async function GET(request: NextRequest) {
  try {
    const tokens = await jupiterService.getTokens()
    return NextResponse.json({ tokens })
  } catch (error) {
    console.error("Error fetching Jupiter tokens:", error)
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 })
  }
}

// POST /api/jupiter/quote - Get a quote for a swap
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required parameters
    if (!body.inputMint || !body.outputMint || !body.amount) {
      return NextResponse.json({ error: "Missing required parameters: inputMint, outputMint, amount" }, { status: 400 })
    }

    const quote = await jupiterService.getQuote({
      inputMint: body.inputMint,
      outputMint: body.outputMint,
      amount: body.amount,
      slippageBps: body.slippageBps,
      onlyDirectRoutes: body.onlyDirectRoutes,
      asLegacyTransaction: body.asLegacyTransaction,
      maxAccounts: body.maxAccounts || ENV.get("NEXT_PUBLIC_MAX_ACCOUNTS", 64),
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error("Error getting Jupiter quote:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to get quote" }, { status: 500 })
  }
}
