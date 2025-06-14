"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

export type NotificationType = "info" | "success" | "warning" | "error"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  timestamp: number
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (title: string, message: string, type: NotificationType) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Load notifications from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications")
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications)
        setNotifications(parsedNotifications)
        setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length)
      } catch (error) {
        console.error("Error parsing notifications from localStorage:", error)
        localStorage.removeItem("notifications")
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
    const newUnreadCount = notifications.filter((n) => !n.read).length
    if (unreadCount !== newUnreadCount) {
      setUnreadCount(newUnreadCount)
    }
  }, [notifications, unreadCount])

  const addNotification = useCallback((title: string, message: string, type: NotificationType) => {
    const newNotification: Notification = {
      id: uuidv4(),
      title,
      message,
      type,
      read: false,
      timestamp: Date.now(),
    }

    setNotifications((prev) => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      // Check if the notification is already marked as read to avoid unnecessary updates
      const notification = prev.find((n) => n.id === id)
      if (notification && notification.read) return prev

      return prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      // Check if all notifications are already read
      if (prev.every((n) => n.read)) return prev

      return prev.map((notification) => ({ ...notification, read: true }))
    })
  }, [])

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
