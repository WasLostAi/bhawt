import { type NextRequest, NextResponse } from "next/server"

// This is a server-side API route that can safely access the Jupiter API key
export async function GET(request: NextRequest) {
  // Get the Jupiter API key from server-side environment variables
  const jupiterApiKey = process.env.JUPITER_API_KEY || ""

  // Check if the API key exists
  if (!jupiterApiKey) {
    return NextResponse.json({ error: "Jupiter API key not configured" }, { status: 500 })
  }

  // Return a status check (not the actual key)
  return NextResponse.json({
    status: "configured",
    hasKey: !!jupiterApiKey,
  })
}

// This endpoint can be used for Jupiter API operations
export async function POST(request: NextRequest) {
  try {
    const jupiterApiKey = process.env.JUPITER_API_KEY || ""

    if (!jupiterApiKey) {
      return NextResponse.json({ error: "Jupiter API key not configured" }, { status: 500 })
    }

    // Get the request body
    const body = await request.json()
    const { endpoint, params } = body

    // Validate the endpoint
    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 })
    }

    // Construct the Jupiter API URL
    const jupiterBaseUrl = "https://quote-api.jup.ag/v6"
    const url = `${jupiterBaseUrl}${endpoint}`

    // Add the API key to the headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jupiterApiKey}`,
    }

    // Make the request to Jupiter API
    const method = params ? "POST" : "GET"
    const options: RequestInit = {
      method,
      headers,
      body: params ? JSON.stringify(params) : undefined,
    }

    const response = await fetch(url, options)
    const data = await response.json()

    // Return the response from Jupiter API
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
