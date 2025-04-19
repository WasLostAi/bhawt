"use client"

import { useState, useEffect } from "react"
import { Responsive, WidthProvider } from "react-grid-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAppStore } from "@/lib/store"
import { Settings, Save, RotateCcw, Plus } from "lucide-react"
import StatusBar from "./status-bar"
import PoolMonitor from "./pool-monitor"
import TargetManagement from "./target-management"
import TransactionMonitor from "./transaction-monitor"
import WhaleMonitor from "./whale-monitor"
import StrategyMonitor from "./strategy-monitor"
import BundleManager from "./bundle-manager"
import PerpetualArbitrage from "./perpetual-arbitrage"
import ConfigPanel from "./config-panel"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

// Responsive grid layout with width provider
const ResponsiveGridLayout = WidthProvider(Responsive)

// Define the type for the layout
type ReactGridLayout = {
  Layout: {
    i: string
    x: number
    y: number
    w: number
    h: number
    minW?: number
    minH?: number
  }[]
  Layouts: {
    lg: {
      i: string
      x: number
      y: number
      w: number
      h: number
      minW?: number
      minH?: number
    }[]
    md: {
      i: string
      x: number
      y: number
      w: number
      h: number
      minW?: number
      minH?: number
    }[]
    sm: {
      i: string
      x: number
      y: number
      w: number
      h: number
      minW?: number
      minH?: number
    }[]
    xs: {
      i: string
      x: number
      y: number
      w: number
      h: number
      minW?: number
      minH?: number
    }[]
    xxs: {
      i: string
      x: number
      y: number
      w: number
      h: number
      minW?: number
      minH?: number
    }[]
  }
}

// Available widgets
const AVAILABLE_WIDGETS = {
  status: {
    name: "Status Bar",
    component: StatusBar,
    minH: 1,
    minW: 12,
    defaultSize: { w: 12, h: 1 },
  },
  pools: {
    name: "Pool Monitor",
    component: PoolMonitor,
    minH: 2,
    minW: 6,
    defaultSize: { w: 8, h: 2 },
  },
  targets: {
    name: "Target Management",
    component: TargetManagement,
    minH: 2,
    minW: 4,
    defaultSize: { w: 4, h: 2 },
  },
  transactions: {
    name: "Transaction Monitor",
    component: TransactionMonitor,
    minH: 2,
    minW: 6,
    defaultSize: { w: 12, h: 2 },
  },
  whales: {
    name: "Whale Monitor",
    component: WhaleMonitor,
    minH: 2,
    minW: 6,
    defaultSize: { w: 12, h: 2 },
  },
  strategies: {
    name: "Strategy Monitor",
    component: StrategyMonitor,
    minH: 2,
    minW: 6,
    defaultSize: { w: 12, h: 2 },
  },
  bundles: {
    name: "Bundle Manager",
    component: BundleManager,
    minH: 2,
    minW: 6,
    defaultSize: { w: 12, h: 2 },
  },
  perpetuals: {
    name: "Perpetual Arbitrage",
    component: PerpetualArbitrage,
    minH: 2,
    minW: 6,
    defaultSize: { w: 12, h: 2 },
  },
  settings: {
    name: "Settings",
    component: ConfigPanel,
    minH: 2,
    minW: 6,
    defaultSize: { w: 12, h: 2 },
  },
}

export default function CustomizableDashboard() {
  const { toast } = useToast()
  const { settings, updateSettings, metrics } = useAppStore()

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false)
  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts>({
    lg: Object.entries(settings.dashboardLayout.positions).map(([id, pos]) => ({
      i: id,
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      minW: AVAILABLE_WIDGETS[id as keyof typeof AVAILABLE_WIDGETS]?.minW || 3,
      minH: AVAILABLE_WIDGETS[id as keyof typeof AVAILABLE_WIDGETS]?.minH || 1,
    })),
    md: [],
    sm: [],
    xs: [],
    xxs: [],
  })

  // State for widget selection
  const [availableWidgets, setAvailableWidgets] = useState<string[]>([])
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)

  // Initialize available widgets
  useEffect(() => {
    const activeWidgetIds = settings.dashboardLayout.widgets
    const available = Object.keys(AVAILABLE_WIDGETS).filter((id) => !activeWidgetIds.includes(id))
    setAvailableWidgets(available)
  }, [settings.dashboardLayout.widgets])

  // Handle layout change
  const handleLayoutChange = (currentLayout: ReactGridLayout.Layout[]) => {
    if (!isEditMode) return

    // Update layouts state
    setLayouts({ ...layouts, lg: currentLayout })
  }

  // Save layout changes
  const saveLayout = () => {
    // Convert layout to positions format
    const positions = layouts.lg.reduce(
      (acc, item) => {
        acc[item.i] = { x: item.x, y: item.y, w: item.w, h: item.h }
        return acc
      },
      {} as Record<string, { x: number; y: number; w: number; h: number }>,
    )

    // Update settings
    updateSettings({
      dashboardLayout: {
        ...settings.dashboardLayout,
        positions,
      },
    })

    setIsEditMode(false)

    toast({
      title: "Dashboard Layout Saved",
      description: "Your custom dashboard layout has been saved.",
    })
  }

  // Reset layout to default
  const resetLayout = () => {
    const defaultPositions = {
      status: { x: 0, y: 0, w: 12, h: 1 },
      pools: { x: 0, y: 1, w: 8, h: 2 },
      targets: { x: 8, y: 1, w: 4, h: 2 },
      transactions: { x: 0, y: 3, w: 12, h: 2 },
    }

    updateSettings({
      dashboardLayout: {
        widgets: Object.keys(defaultPositions),
        positions: defaultPositions,
      },
    })

    setLayouts({
      ...layouts,
      lg: Object.entries(defaultPositions).map(([id, pos]) => ({
        i: id,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        minW: AVAILABLE_WIDGETS[id as keyof typeof AVAILABLE_WIDGETS]?.minW || 3,
        minH: AVAILABLE_WIDGETS[id as keyof typeof AVAILABLE_WIDGETS]?.minH || 1,
      })),
    })

    toast({
      title: "Layout Reset",
      description: "Dashboard layout has been reset to default.",
    })
  }

  // Add a new widget
  const addWidget = () => {
    if (!selectedWidget) return

    // Get the widget
    const widget = AVAILABLE_WIDGETS[selectedWidget as keyof typeof AVAILABLE_WIDGETS]
    if (!widget) return

    // Find a position for the new widget
    // For simplicity, we'll add it at the bottom
    const maxY = Math.max(...layouts.lg.map((item) => item.y + item.h), 0)

    // Add the widget to the layout
    const newLayout = [
      ...layouts.lg,
      {
        i: selectedWidget,
        x: 0,
        y: maxY,
        w: widget.defaultSize.w,
        h: widget.defaultSize.h,
        minW: widget.minW,
        minH: widget.minH,
      },
    ]

    // Update layouts
    setLayouts({ ...layouts, lg: newLayout })

    // Update settings
    updateSettings({
      dashboardLayout: {
        widgets: [...settings.dashboardLayout.widgets, selectedWidget],
        positions: {
          ...settings.dashboardLayout.positions,
          [selectedWidget]: { x: 0, y: maxY, w: widget.defaultSize.w, h: widget.defaultSize.h },
        },
      },
    })

    // Remove from available widgets
    setAvailableWidgets(availableWidgets.filter((id) => id !== selectedWidget))
    setSelectedWidget(null)

    toast({
      title: "Widget Added",
      description: `${widget.name} has been added to your dashboard.`,
    })
  }

  // Remove a widget
  const removeWidget = (id: string) => {
    // Update layouts
    setLayouts({
      ...layouts,
      lg: layouts.lg.filter((item) => item.i !== id),
    })

    // Update settings
    const newWidgets = settings.dashboardLayout.widgets.filter((w) => w !== id)
    const newPositions = { ...settings.dashboardLayout.positions }
    delete newPositions[id]

    updateSettings({
      dashboardLayout: {
        widgets: newWidgets,
        positions: newPositions,
      },
    })

    // Add to available widgets
    setAvailableWidgets([...availableWidgets, id])

    toast({
      title: "Widget Removed",
      description: `${AVAILABLE_WIDGETS[id as keyof typeof AVAILABLE_WIDGETS]?.name} has been removed from your dashboard.`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-syne">Dashboard</h1>
        <div className="flex items-center space-x-2">
          {isEditMode ? (
            <>
              <div className="flex items-center mr-4">
                <select
                  className="bg-[#1d1d1c] border border-[#30302e] rounded-md px-3 py-1 text-sm"
                  value={selectedWidget || ""}
                  onChange={(e) => setSelectedWidget(e.target.value || null)}
                >
                  <option value="">Add Widget...</option>
                  {availableWidgets.map((id) => (
                    <option key={id} value={id}>
                      {AVAILABLE_WIDGETS[id as keyof typeof AVAILABLE_WIDGETS]?.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 bg-[#1d1d1c] border-[#30302e]"
                  onClick={addWidget}
                  disabled={!selectedWidget}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <Button variant="outline" className="bg-[#1d1d1c] border-[#30302e]" onClick={resetLayout}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
                onClick={saveLayout}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Layout
              </Button>
            </>
          ) : (
            <Button variant="outline" className="bg-[#1d1d1c] border-[#30302e]" onClick={() => setIsEditMode(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Customize Dashboard
            </Button>
          )}
        </div>
      </div>

      <div className={`${isEditMode ? "bg-[#151514]/50 border border-dashed border-[#30302e] rounded-lg p-4" : ""}`}>
        {isEditMode && (
          <div className="mb-4 p-2 bg-[#1d1d1c] border border-[#30302e] rounded-md text-sm text-[#707070]">
            <p>Drag widgets to reposition them. Resize widgets by dragging the bottom-right corner.</p>
          </div>
        )}

        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={200}
          onLayoutChange={(layout) => handleLayoutChange(layout)}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          margin={[16, 16]}
        >
          {layouts.lg.map((item) => {
            const widgetId = item.i as keyof typeof AVAILABLE_WIDGETS
            const Widget = AVAILABLE_WIDGETS[widgetId]?.component

            if (!Widget) return null

            return (
              <div key={item.i} className="relative">
                {isEditMode && (
                  <div className="absolute top-2 right-2 z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-[#E57676] hover:bg-[#ff4d4d] text-white"
                      onClick={() => removeWidget(item.i)}
                    >
                      ×
                    </Button>
                  </div>
                )}
                <div className="h-full overflow-auto">
                  {widgetId === "status" ? (
                    <Widget
                      activeTargets={metrics.activeTargets}
                      pendingTxs={metrics.pendingTxs}
                      successfulSnipes={metrics.successfulSnipes}
                    />
                  ) : widgetId === "targets" ? (
                    <Widget
                      setActiveTargets={(count) => useAppStore.getState().updateMetrics({ activeTargets: count })}
                    />
                  ) : widgetId === "transactions" ? (
                    <Widget
                      setPendingTxs={(count) => useAppStore.getState().updateMetrics({ pendingTxs: count })}
                      setSuccessfulSnipes={(count) => useAppStore.getState().updateMetrics({ successfulSnipes: count })}
                    />
                  ) : (
                    <Widget />
                  )}
                </div>
              </div>
            )
          })}
        </ResponsiveGridLayout>
      </div>
    </div>
  )
}
