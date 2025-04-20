import { ENV } from "@/lib/env"
import { jupiterService, type JupiterQuoteParams, type JupiterSwapParams } from "./jupiter-service"
import { jitoService } from "./jito-service"
import { handleTransactionError } from "@/lib/error-handler"

export interface TradeParams {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps?: number
  userPublicKey: string
  priorityFee?: number
  useJito?: boolean
}

export interface TradeResult {
  success: boolean
  txId?: string
  inputAmount: string
  outputAmount: string
  priceImpact: string
  error?: string
}

export class TradingEngine {
  private enablePriorityFees: boolean
  private enableJitoBundles: boolean
  private defaultPriorityFee: number

  constructor() {
    this.enablePriorityFees = ENV.get("NEXT_PUBLIC_ENABLE_PRIORITY_FEES", true)
    this.enableJitoBundles = ENV.get("NEXT_PUBLIC_ENABLE_JITO_BUNDLES", false)
    this.defaultPriorityFee = ENV.get("NEXT_PUBLIC_DEFAULT_PRIORITY_FEE", 100000) // Default 0.0001 SOL
  }

  /**
   * Execute a trade
   * @param params Trade parameters
   * @returns Trade result
   */
  async executeTrade(params: TradeParams): Promise<TradeResult> {
    try {
      // Get quote
      const quoteParams: JupiterQuoteParams = {
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        amount: params.amount,
        slippageBps: params.slippageBps || 50, // Default 0.5%
      }

      const quote = await jupiterService.getQuote(quoteParams)

      // Create swap transaction
      const swapParams: JupiterSwapParams = {
        ...quoteParams,
        userPublicKey: params.userPublicKey,
      }

      // Add priority fee if enabled
      if (this.enablePriorityFees) {
        swapParams.priorityFee = params.priorityFee || this.defaultPriorityFee
      }

      const swap = await jupiterService.createSwap(swapParams)

      // Use Jito if enabled and requested
      if (this.enableJitoBundles && params.useJito && jitoService.isEnabled()) {
        const bundleResponse = await jitoService.submitBundle([swap.swapTransaction])

        // Check bundle status
        const bundleStatus = await jitoService.getBundleStatus(bundleResponse.bundleId)

        if (bundleStatus.status === "confirmed") {
          return {
            success: true,
            txId: bundleStatus.id,
            inputAmount: quote.inAmount,
            outputAmount: quote.outAmount,
            priceImpact: quote.priceImpactPct,
          }
        } else {
          throw new Error(`Bundle failed: ${bundleStatus.error || "Unknown error"}`)
        }
      } else {
        // Execute transaction directly (this is a mock since we can't actually execute transactions in this environment)
        console.log("Executing transaction:", swap.swapTransaction)

        // In a real implementation, you would send the transaction to the blockchain
        // For now, we'll just simulate a successful transaction
        const txId = `sim_${Date.now().toString(36)}`

        return {
          success: true,
          txId,
          inputAmount: quote.inAmount,
          outputAmount: quote.outAmount,
          priceImpact: quote.priceImpactPct,
        }
      }
    } catch (error) {
      const errorDetails = handleTransactionError(error, { showToast: true })

      return {
        success: false,
        inputAmount: params.amount,
        outputAmount: "0",
        priceImpact: "0",
        error: errorDetails.message,
      }
    }
  }
}

export const tradingEngine = new TradingEngine()
