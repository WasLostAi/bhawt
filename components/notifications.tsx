"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface Notification {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationsProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  maxNotifications?: number
}

export function Notifications({ position = "bottom-right", maxNotifications = 5 }: NotificationsProps) {
  const { toasts, dismiss } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [mounted, setMounted] = useState(false)

  // Map toast notifications to our notification format
  useEffect(() => {
    if (!mounted) return

    const mappedNotifications = toasts
      .map(
        (toast): Notification => ({
          id: toast.id,
          title: toast.title || "",
          description: toast.description as string,
          type: toast.variant === "destructive" ? "error" : "success",
          duration: 5000,
        }),
      )
      .slice(0, maxNotifications)

    setNotifications(mappedNotifications)
  }, [toasts, maxNotifications, mounted])

  // Handle client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Position classes
  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  }

  // Animation variants
  const variants = {
    initial: (position: string) => {
      if (position.includes("right")) return { opacity: 0, x: 20 }
      if (position.includes("left")) return { opacity: 0, x: -20 }
      return { opacity: 0 }
    },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: (position: string) => {
      if (position.includes("right")) return { opacity: 0, x: 20 }
      if (position.includes("left")) return { opacity: 0, x: -20 }
      return { opacity: 0 }
    },
  }

  // Icon mapping
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-[#76D484]" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-[#E57676]" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-[#F9CB40]" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-[#22CCEE]" />
    }
  }

  return (
    <div className={`fixed z-50 p-4 space-y-4 w-full max-w-md ${positionClasses[position]}`} aria-live="assertive">
      <AnimatePresence initial={false}>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            custom={position}
            transition={{ duration: 0.2 }}
            className={`rounded-lg border p-4 shadow-md bg-[#1d1d1c] border-[#30302e] text-white`}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                {getIcon(notification.type)}
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  {notification.description && (
                    <p className="text-sm text-[#707070] mt-1">{notification.description}</p>
                  )}
                  {notification.action && (
                    <button
                      onClick={notification.action.onClick}
                      className="mt-2 text-sm text-[#22CCEE] hover:underline"
                    >
                      {notification.action.label}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismiss(notification.id)}
                className="rounded-full p-1 text-[#707070] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
