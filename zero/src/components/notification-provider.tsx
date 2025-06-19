"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import { io, Socket } from "socket.io-client"

export type NotificationType = "info" | "success" | "warning" | "error" | "alarm"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  timestamp: number
  distance?: number
  estado?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (title: string, message: string, type: NotificationType, distance?: number, estado?: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
  connectSocket: () => void
  disconnectSocket: () => void
  isSocketConnected: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // Cargar notificaciones desde localStorage al montar
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications")
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications)
        setNotifications(parsedNotifications)
      } catch (error) {
        console.error("Error parsing notifications from localStorage:", error)
        localStorage.removeItem("notifications")
      }
    }
  }, [])

  // Guardar notificaciones en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
    const newUnreadCount = notifications.filter((n) => !n.read).length
    setUnreadCount(newUnreadCount)
  }, [notifications])

  // Conectar al socket (manejo persistente)
  const connectSocket = useCallback(() => {
    // Si ya hay una conexión activa, no hacer nada
    if (socketRef.current?.connected) {
      setIsSocketConnected(true)
      return
    }

    // Si ya existe un socket pero no está conectado, intentar reconectar
    if (socketRef.current) {
      socketRef.current.connect()
      return
    }

    // Crear nueva instancia de socket
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
      path: "/api/socket",
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      transports: ["websocket"],
      autoConnect: true
    })

    socketRef.current = newSocket

    newSocket.on("connect", () => {
      console.log("✅ Socket.IO conectado")
      setIsSocketConnected(true)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO desconectado:", reason)
      setIsSocketConnected(false)
      
      // Intentar reconectar solo si no es un cierre deliberado
      if (reason !== "io client disconnect") {
        setTimeout(() => {
          if (socketRef.current && !socketRef.current.connected) {
            socketRef.current.connect()
          }
        }, 1000)
      }
    })

    newSocket.on("error", (error) => {
      console.error("Socket.IO error:", error)
    })

    newSocket.on("alarma", (data: any) => {
      console.log("Evento 'alarma' recibido:", data)
      addNotification(
        "Detección de movimiento",
        `Se detectó un objeto a ${data.distancia.toFixed(1)} cm.`,
        "alarm",
        data.distancia,
        data.estado
      )
    })
  }, [])

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 Desconectando Socket.IO...")
      socketRef.current.disconnect()
      socketRef.current = null
      setIsSocketConnected(false)
    }
  }, [])

  const addNotification = useCallback((
    title: string, 
    message: string, 
    type: NotificationType, 
    distance?: number,
    estado?: string
  ) => {
    const newNotification: Notification = {
      id: uuidv4(),
      title,
      message,
      type,
      read: false,
      timestamp: Date.now(),
      distance,
      estado
    }

    setNotifications((prev) => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id)
      if (notification && notification.read) return prev

      return prev.map((notification) => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
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

  // Conectar al montar el provider
  useEffect(() => {
    connectSocket()
    
    return () => {
      // NO desconectar aquí - mantener conexión persistente
    }
  }, [connectSocket])

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    connectSocket,
    disconnectSocket,
    isSocketConnected
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