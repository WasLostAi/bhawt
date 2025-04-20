"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, RefreshCw } from "lucide-react"

export default function ConfigPanel() {
  const { settings, updateSettings, resetSettings } = useAppStore()
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    updateSettings(localSettings)
    // Show success notification
  }

  const handleReset = () => {
    resetSettings()
    setLocalSettings(settings)
    // Show success notification
  }

  return (
    <div className="bg-[#151514] border border-[#30302e] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Configuration</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset} className="bg-[#1d1d1c] border-[#30302e] hover:bg-[#30302e]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#00B6E7] to-[#A4D756] hover:opacity-90 text-[#0C0C0C] font-medium"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trading">
        <TabsList className="mb-6">
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultSlippage">Default Slippage (%)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="defaultSlippage"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={[localSettings.trading.defaultSlippage]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        trading: { ...localSettings.trading, defaultSlippage: value[0] },
                      })
                    }
                  />
                  <span className="w-12 text-right">{localSettings.trading.defaultSlippage}%</span>
                </div>
              </div>

              <div>
                <Label htmlFor="priorityFee">Priority Fee (SOL)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="priorityFee"
                    min={0}
                    max={1000000}
                    step={10000}
                    value={[localSettings.trading.defaultPriorityFee]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        trading: { ...localSettings.trading, defaultPriorityFee: value[0] },
                      })
                    }
                  />
                  <span className="w-20 text-right">{localSettings.trading.defaultPriorityFee / 1000000} SOL</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="skipPreflight" className="block mb-1">
                    Skip Preflight
                  </Label>
                  <p className="text-xs text-[#707070]">Skip transaction verification before sending</p>
                </div>
                <Switch
                  id="skipPreflight"
                  checked={localSettings.trading.skipPreflight}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      trading: { ...localSettings.trading, skipPreflight: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="simulateTransactions" className="block mb-1">
                    Simulate Transactions
                  </Label>
                  <p className="text-xs text-[#707070]">Simulate transactions before sending</p>
                </div>
                <Switch
                  id="simulateTransactions"
                  checked={localSettings.trading.simulateTransactions}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      trading: { ...localSettings.trading, simulateTransactions: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compactMode" className="block mb-1">
                    Compact Mode
                  </Label>
                  <p className="text-xs text-[#707070]">Use compact UI layout</p>
                </div>
                <Switch
                  id="compactMode"
                  checked={localSettings.display.compactMode}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      display: { ...localSettings.display, compactMode: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showTestnets" className="block mb-1">
                    Show Testnets
                  </Label>
                  <p className="text-xs text-[#707070]">Display testnet networks</p>
                </div>
                <Switch
                  id="showTestnets"
                  checked={localSettings.display.showTestnets}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      display: { ...localSettings.display, showTestnets: checked },
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="decimalPrecision">Decimal Precision</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="decimalPrecision"
                    min={2}
                    max={12}
                    step={1}
                    value={[localSettings.display.decimalPrecision]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        display: { ...localSettings.display, decimalPrecision: value[0] },
                      })
                    }
                  />
                  <span className="w-12 text-right">{localSettings.display.decimalPrecision}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificationsEnabled" className="block mb-1">
                    Enable Notifications
                  </Label>
                  <p className="text-xs text-[#707070]">Show in-app notifications</p>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={localSettings.notifications.enabled}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: { ...localSettings.notifications, enabled: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="soundEnabled" className="block mb-1">
                    Sound Notifications
                  </Label>
                  <p className="text-xs text-[#707070]">Play sound for notifications</p>
                </div>
                <Switch
                  id="soundEnabled"
                  checked={localSettings.notifications.sound}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: { ...localSettings.notifications, sound: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="desktopEnabled" className="block mb-1">
                    Desktop Notifications
                  </Label>
                  <p className="text-xs text-[#707070]">Show desktop notifications</p>
                </div>
                <Switch
                  id="desktopEnabled"
                  checked={localSettings.notifications.desktop}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: { ...localSettings.notifications, desktop: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxConcurrentRequests">Max Concurrent Requests</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="maxConcurrentRequests"
                    min={1}
                    max={20}
                    step={1}
                    value={[localSettings.performance.maxConcurrentRequests]}
                    onValueChange={(value) =>
                      setLocalSettings({
                        ...localSettings,
                        performance: { ...localSettings.performance, maxConcurrentRequests: value[0] },
                      })
                    }
                  />
                  <span className="w-12 text-right">{localSettings.performance.maxConcurrentRequests}</span>
                </div>
              </div>

              <div>
                <Label htmlFor="cacheTimeout">Cache Timeout (ms)</Label>
                <Input
                  id="cacheTimeout"
                  type="number"
                  value={localSettings.performance.cacheTimeout}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      performance: { ...localSettings.performance, cacheTimeout: Number(e.target.value) },
                    })
                  }
                  className="bg-[#1d1d1c] border-[#30302e]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="prefetchData" className="block mb-1">
                    Prefetch Data
                  </Label>
                  <p className="text-xs text-[#707070]">Prefetch data for better performance</p>
                </div>
                <Switch
                  id="prefetchData"
                  checked={localSettings.performance.prefetchData}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      performance: { ...localSettings.performance, prefetchData: checked },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
