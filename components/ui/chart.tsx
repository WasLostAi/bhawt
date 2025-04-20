"use client"

import * as React from "react"
import type { TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import * as RechartsPrimitive from "recharts"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | undefined>(undefined)

export function ChartContainer({
  config,
  children,
  className,
}: {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={className}
        style={
          {
            "--color-price": config.price?.color,
            "--color-liquidity": config.liquidity?.color,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export function ChartTooltip({
  content,
}: {
  content: React.ReactNode
}) {
  return content
}

export function ChartTooltipContent({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("ChartTooltipContent must be used within a ChartContainer")
  }

  const { config } = context

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border border-[#30302e] bg-[#1d1d1c] p-2 shadow-md">
      <div className="text-xs text-[#707070]">{label}</div>
      <div className="mt-1 space-y-0.5">
        {payload.map((item: any, index: number) => {
          const dataKey = item.dataKey as string
          const configItem = config[dataKey]

          if (!configItem) {
            return null
          }

          return (
            <div key={index} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: configItem.color }} />
              <span className="text-xs font-medium">{configItem.label}:</span>
              <span className="text-xs">
                {dataKey === "price" ? Number(item.value).toFixed(8) : `$${Number(item.value).toLocaleString()}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config as any, item, key)

        return (
          <div
            key={item.value}
            className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
          >
            {(itemConfig as any)?.icon && !hideIcon ? (
              (itemConfig as any).icon()
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {(itemConfig as any)?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

import { cn } from "@/lib/utils"

export { ChartLegend, ChartLegendContent }
