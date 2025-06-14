"use client"
import type { Notification } from "@/components/notification-provider"

import { useState } from "react"
import { Bell, Check, Trash2, X } from "lucide-react"
import { useNotifications } from "@/components/notification-provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications } =
    useNotifications()
  const [open, setOpen] = useState(false)

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getIconAndColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">Notificaciones</h3>
          <div className="flex space-x-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => markAllAsRead()}
                title="Marcar todas como leídas"
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Marcar todas como leídas</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => clearAllNotifications()}
                title="Borrar todas"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Borrar todas</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)} title="Cerrar">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn("flex items-start p-3", !notification.read && "bg-slate-50 dark:bg-slate-800/50")}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs text-slate-500">{formatTimestamp(notification.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm">{notification.message}</p>
                    <div className="mt-1 flex items-center">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-xs",
                          getIconAndColor(notification.type),
                        )}
                      >
                        {notification.type}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2 flex flex-col space-y-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification.id)}
                        title="Marcar como leída"
                      >
                        <Check className="h-3 w-3" />
                        <span className="sr-only">Marcar como leída</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => clearNotification(notification.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center">
              <p className="text-sm text-slate-500">No hay notificaciones</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
