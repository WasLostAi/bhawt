import { ENV } from "@/lib/env"

// API endpoints
const API_ENDPOINTS = {
  jupiter: {
    quote: "/api/jupiter/quote",
    swap: "/api/jupiter/swap",
    tokens: "/api/jupiter/tokens",
    markets: "/api/jupiter/markets",
  },
  jito: {
    bundle: "/api/jito/bundle",
    status: "/api/jito/status",
  },
  tokens: {
    price: "/api/tokens/price",
    info: "/api/tokens/info",
    liquidity: "/api/tokens/liquidity",
  },
  pools: {
    list: "/api/pools/list",
    new: "/api/pools/new",
    details: "/api/pools/details",
  },
  whales: {
    transactions: "/api/whales/transactions",
    wallets: "/api/whales/wallets",
    signals: "/api/whales/signals",
  },
}

// Error types
export enum ApiErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// API error interface
export interface ApiError {
  type: ApiErrorType
  message: string
  status?: number
  details?: any
}

// Base API client class
class ApiClient {
  private baseUrl: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseUrl = ENV.get("API_BASE_URL", "") || ""
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  // Add authentication token if available
  private getHeaders(): HeadersInit {
    const headers = { ...this.defaultHeaders }
    const authToken = ENV.get("AUTH_TOKEN", "")

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }

    return headers
  }

  // Handle API errors
  private handleError(error: any, url: string): never {
    console.error(`API error for ${url}:`, error)

    if (error instanceof TypeError && error.message.includes("NetworkError")) {
      throw {
        type: ApiErrorType.NETWORK_ERROR,
        message: "Network error occurred. Please check your connection.",
      }
    }

    if (error.name === "AbortError") {
      throw {
        type: ApiErrorType.TIMEOUT_ERROR,
        message: "Request timed out. Please try again.",
      }
    }

    if (error.status === 401) {
      throw {
        type: ApiErrorType.AUTHENTICATION_ERROR,
        message: "Authentication failed. Please log in again.",
        status: 401,
      }
    }

    if (error.status === 403) {
      throw {
        type: ApiErrorType.AUTHENTICATION_ERROR,
        message: "You don't have permission to access this resource.",
        status: 403,
      }
    }

    if (error.status === 404) {
      throw {
        type: ApiErrorType.NOT_FOUND_ERROR,
        message: "The requested resource was not found.",
        status: 404,
      }
    }

    if (error.status === 422) {
      throw {
        type: ApiErrorType.VALIDATION_ERROR,
        message: "Validation failed. Please check your input.",
        status: 422,
        details: error.data,
      }
    }

    if (error.status === 429) {
      throw {
        type: ApiErrorType.RATE_LIMIT_ERROR,
        message: "Rate limit exceeded. Please try again later.",
        status: 429,
      }
    }

    if (error.status >= 500) {
      throw {
        type: ApiErrorType.SERVER_ERROR,
        message: "Server error occurred. Please try again later.",
        status: error.status,
      }
    }

    throw {
      type: ApiErrorType.UNKNOWN_ERROR,
      message: error.message || "An unknown error occurred.",
      details: error,
    }
  }

  // Generic request method
  async request<T>(method: string, endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const url = this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint
    const headers = this.getHeaders()

    const config: RequestInit = {
      method,
      headers,
      ...options,
    }

    if (data && method !== "GET") {
      config.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          status: response.status,
          data: errorData,
        }
      }

      return await response.json()
    } catch (error) {
      return this.handleError(error, url)
    }
  }

  // HTTP method wrappers
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options)
  }

  async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>("POST", endpoint, data, options)
  }

  async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>("PUT", endpoint, data, options)
  }

  async patch<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>("PATCH", endpoint, data, options)
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options)
  }
}

// Export API client instance and endpoints
export const apiClient = new ApiClient()
export { API_ENDPOINTS }
