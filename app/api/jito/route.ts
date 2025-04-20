import { type NextRequest, NextResponse } from "next/server"
import { jitoService } from "@/services/jito-service"

// GET /api/jito/status - Get Jito service status
export async function GET(request: NextRequest) {
  try {
    if (!jitoService.isEnabled()) {
      return NextResponse.json({ error: "Jito bundles are not enabled" }, { status: 400 })
    }

    const status = await jitoService.getStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Error fetching Jito status:", error)
    return NextResponse.json({ error: "Failed to fetch Jito status" }, { status: 500 })
  }
}

// POST /api/jito/bundle - Submit a bundle to Jito
export async function POST(request: NextRequest) {
  try {
    if (!jitoService.isEnabled()) {
      return NextResponse.json({ error: "Jito bundles are not enabled" }, { status: 400 })
    }

    const body = await request.json()

    // Validate required parameters
    if (!body.transactions || !Array.isArray(body.transactions) || body.transactions.length === 0) {
      return NextResponse.json({ error: "Missing required parameter: transactions (array)" }, { status: 400 })
    }

    const response = await jitoService.submitBundle(body.transactions)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error submitting Jito bundle:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit bundle" },
      { status: 500 },
    )
  }
}
