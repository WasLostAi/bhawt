"use client"

import { X } from "lucide-react"
import { useToast } from "./use-toast"
import { useEffect, useState } from "react"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg border p-4 shadow-md transition-all duration-300 animate-in slide-in-from-right-full
            ${
              toast.variant === "destructive"
                ? "bg-[#1d1d1c] border-[#E57676] text-white"
                : "bg-[#1d1d1c] border-[#22CCEE] text-white"
            }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && <p className="text-sm text-[#707070] mt-1">{toast.description}</p>}
            </div>
            <button onClick={() => dismiss(toast.id)} className="rounded-full p-1 text-[#707070] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
