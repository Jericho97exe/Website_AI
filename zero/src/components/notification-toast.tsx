"use client"
import type { Notification } from "@/components/notification-provider"

import { useEffect, useState, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/components/notification-provider"

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { markAsRead } = useNotifications()
  const hasMarkedAsRead = useRef(false)

  // Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  // Mark as read when notification is shown - only once
  useEffect(() => {
    if (!notification.read && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true
      markAsRead(notification.id)
    }
  }, [notification.id, notification.read, markAsRead])

  const getIconAndColor = () => {
    switch (notification.type) {
      case "success":
        return {
          bgColor: "bg-green-100 dark:bg-green-900/20",
          borderColor: "border-green-500",
          textColor: "text-green-800 dark:text-green-300",
        }
      case "error":
        return {
          bgColor: "bg-red-100 dark:bg-red-900/20",
          borderColor: "border-red-500",
          textColor: "text-red-800 dark:text-red-300",
        }
      case "warning":
        return {
          bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
          borderColor: "border-yellow-500",
          textColor: "text-yellow-800 dark:text-yellow-300",
        }
      default:
        return {
          bgColor: "bg-blue-100 dark:bg-blue-900/20",
          borderColor: "border-blue-500",
          textColor: "text-blue-800 dark:text-blue-300",
        }
    }
  }

  const { bgColor, borderColor, textColor } = getIconAndColor()

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-lg border-l-4 bg-white p-4 shadow-md dark:bg-slate-800 transition-all duration-300",
        borderColor,
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full",
      )}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className={cn("font-medium", textColor)}>{notification.title}</h3>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.message}</div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="ml-4 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:hover:bg-slate-700"
        >
          <span className="sr-only">Cerrar</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
