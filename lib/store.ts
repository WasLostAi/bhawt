import { create } from "zustand"
import { persist } from "zustand/middleware"

// Define the store state types
interface AppMetrics {
  activeTargets: number
  pendingTxs: number
  successfulSnipes: number
  failedSnipes: number
  totalVolume: number
  profitLoss: number
}

interface DashboardLayout {
  widgets: string[]
  positions: Record<string, { x: number; y: number; w: number; h: number }>
}

interface AppSettings {
  theme: "dark" | "light" | "system"
  dashboardLayout: DashboardLayout
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
  }
  performance: {
    maxConcurrentRequests: number
    prefetchData: boolean
    cacheTimeout: number
  }
  trading: {
    defaultSlippage: number
    defaultPriorityFee: number
    skipPreflight: boolean
    simulateTransactions: boolean
  }
  display: {
    compactMode: boolean
    showTestnets: boolean
    decimalPrecision: number
  }
}

interface AppState {
  metrics: AppMetrics
  settings: AppSettings
  updateMetrics: (metrics: Partial<AppMetrics>) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  resetMetrics: () => void
  resetSettings: () => void
  activeTargets?: number
  pendingTxs?: number
  successfulSnipes?: number
  addNotification: (notification: { title: string; description: string; type: string }) => void
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  dashboardLayout: {
    widgets: ["status", "pools", "targets", "transactions"],
    positions: {
      status: { x: 0, y: 0, w: 12, h: 1 },
      pools: { x: 0, y: 1, w: 8, h: 2 },
      targets: { x: 8, y: 1, w: 4, h: 2 },
      transactions: { x: 0, y: 3, w: 12, h: 2 },
    },
  },
  notifications: {
    enabled: true,
    sound: true,
    desktop: false,
  },
  performance: {
    maxConcurrentRequests: 5,
    prefetchData: true,
    cacheTimeout: 60000, // 1 minute
  },
  trading: {
    defaultSlippage: 1.0, // 1%
    defaultPriorityFee: 250000, // 0.00025 SOL
    skipPreflight: true,
    simulateTransactions: true,
  },
  display: {
    compactMode: false,
    showTestnets: false,
    decimalPrecision: 8,
  },
}

// Default metrics
const DEFAULT_METRICS: AppMetrics = {
  activeTargets: 0,
  pendingTxs: 0,
  successfulSnipes: 0,
  failedSnipes: 0,
  totalVolume: 0,
  profitLoss: 0,
}

// Create the store with persistence
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      metrics: DEFAULT_METRICS,
      settings: DEFAULT_SETTINGS,

      updateMetrics: (metrics) =>
        set((state) => ({
          metrics: { ...state.metrics, ...metrics },
        })),

      updateSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
            // Handle nested updates
            ...(settings.dashboardLayout
              ? {
                  dashboardLayout: {
                    ...state.settings.dashboardLayout,
                    ...settings.dashboardLayout,
                  },
                }
              : {}),
            ...(settings.notifications
              ? {
                  notifications: {
                    ...state.settings.notifications,
                    ...settings.notifications,
                  },
                }
              : {}),
            ...(settings.performance
              ? {
                  performance: {
                    ...state.settings.performance,
                    ...settings.performance,
                  },
                }
              : {}),
            ...(settings.trading
              ? {
                  trading: {
                    ...state.settings.trading,
                    ...settings.trading,
                  },
                }
              : {}),
            ...(settings.display
              ? {
                  display: {
                    ...state.settings.display,
                    ...settings.display,
                  },
                }
              : {}),
          },
        })),

      resetMetrics: () => set({ metrics: DEFAULT_METRICS }),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      // Add the missing addNotification function
      addNotification: (notification) => {
        console.log("Notification added:", notification)
        // In a real implementation, this would add the notification to a notifications array
      },

      // Add these properties to match what's being used in dashboard.tsx
      activeTargets: 0,
      pendingTxs: 0,
      successfulSnipes: 0,
    }),
    {
      name: "sol-sniper-settings",
      partialize: (state) => ({
        settings: state.settings,
      }),
    },
  ),
)
