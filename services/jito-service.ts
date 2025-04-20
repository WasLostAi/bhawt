import { ENV } from "@/lib/env"
import { apiClient, API_ENDPOINTS } from "./api-client"

export interface JitoBundle {
  id: string
  transactions: string[]
  status: "pending" | "confirmed" | "failed"
  blockHeight?: number
  error?: string
  createdAt: number
}

export interface JitoBundleResponse {
  bundleId: string
  status: "success" | "error"
  message?: string
}

export interface JitoStatusResponse {
  connected: boolean
  blockHeight: number
  searcherIdentity: string
  bundlesInFlight: number
  bundlesProcessed24h: number
}

export class JitoService {
  private apiKey: string
  private enableJitoBundles: boolean

  constructor() {
    this.apiKey = ENV.get("JITO_API_KEY", "")
    this.enableJitoBundles = ENV.get("NEXT_PUBLIC_ENABLE_JITO_BUNDLES", false)
  }

  /**
   * Check if Jito bundles are enabled
   * @returns True if Jito bundles are enabled
   */
  isEnabled(): boolean {
    return this.enableJitoBundles && !!this.apiKey
  }

  /**
   * Submit a bundle of transactions to Jito
   * @param transactions Array of base64 encoded transactions
   * @returns Bundle response
   */
  async submitBundle(transactions: string[]): Promise<JitoBundleResponse> {
    if (!this.isEnabled()) {
      throw new Error("Jito bundles are not enabled")
    }

    try {
      const response = await apiClient.post<JitoBundleResponse>(API_ENDPOINTS.jito.bundle, {
        transactions,
      })

      return response
    } catch (error) {
      console.error("Error submitting Jito bundle:", error)
      throw error
    }
  }

  /**
   * Get the status of a bundle
   * @param bundleId Bundle ID
   * @returns Bundle status
   */
  async getBundleStatus(bundleId: string): Promise<JitoBundle> {
    if (!this.isEnabled()) {
      throw new Error("Jito bundles are not enabled")
    }

    try {
      const response = await apiClient.get<JitoBundle>(`${API_ENDPOINTS.jito.bundle}/${bundleId}`)
      return response
    } catch (error) {
      console.error("Error getting Jito bundle status:", error)
      throw error
    }
  }

  /**
   * Get the status of the Jito service
   * @returns Jito service status
   */
  async getStatus(): Promise<JitoStatusResponse> {
    try {
      const response = await apiClient.get<JitoStatusResponse>(API_ENDPOINTS.jito.status)
      return response
    } catch (error) {
      console.error("Error getting Jito status:", error)
      throw error
    }
  }
}

export const jitoService = new JitoService()
