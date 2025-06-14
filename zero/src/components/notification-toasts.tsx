"use client"
import type { Notification } from "@/components/notification-provider"

import { useState, useEffect, useRef } from "react"
import { useNotifications } from "@/components/notification-provider"
import { NotificationToast } from "@/components/notification-toast"

export function NotificationToasts() {
  const { notifications } = useNotifications()
  const [activeToasts, setActiveToasts] = useState<Notification[]>([])
  const prevNotificationsRef = useRef<Notification[]>([])

  // Show new notifications as toasts
  useEffect(() => {
    // Only process if there are notifications and they've changed
    if (notifications.length > 0) {
      // Find new unread notifications that aren't already in activeToasts
      const newNotifications = notifications.filter(
        (notification) =>
          !notification.read &&
          !activeToasts.some((toast) => toast.id === notification.id) &&
          !prevNotificationsRef.current.some((prevNotif) => prevNotif.id === notification.id),
      )

      if (newNotifications.length > 0) {
        setActiveToasts((prev) => [...newNotifications, ...prev])
      }

      // Update the ref to current notifications
      prevNotificationsRef.current = notifications
    }
  }, [notifications, activeToasts])

  const handleClose = (id: string) => {
    setActiveToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  if (activeToasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {activeToasts.map((toast) => (
        <NotificationToast key={toast.id} notification={toast} onClose={() => handleClose(toast.id)} />
      ))}
    </div>
  )
}
