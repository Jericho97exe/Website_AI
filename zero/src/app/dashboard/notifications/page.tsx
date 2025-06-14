"use client"

import { useNotifications } from "@/components/notification-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAllNotifications } =
    useNotifications()

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-500"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-500"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-500"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-500"
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground">Gestiona tus notificaciones del sistema.</p>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={clearAllNotifications}>
              <Trash2 className="mr-2 h-4 w-4" />
              Borrar todas
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">No leídas ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read">Leídas ({readNotifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todas las notificaciones</CardTitle>
              <CardDescription>Lista completa de notificaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent>{renderNotificationList(notifications)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones no leídas</CardTitle>
              <CardDescription>Notificaciones pendientes de lectura</CardDescription>
            </CardHeader>
            <CardContent>{renderNotificationList(unreadNotifications)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="read">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones leídas</CardTitle>
              <CardDescription>Notificaciones que ya has visto</CardDescription>
            </CardHeader>
            <CardContent>{renderNotificationList(readNotifications)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderNotificationList(notificationList: any[]) {
    if (notificationList.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay notificaciones</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {notificationList.map((notification) => (
          <div
            key={notification.id}
            className={cn("rounded-lg border p-4", !notification.read ? "bg-slate-50 dark:bg-slate-800/50" : "")}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center">
                  <h3 className="font-medium">{notification.title}</h3>
                  <Badge className={cn("ml-2", getTypeStyles(notification.type))}>{notification.type}</Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{formatTimestamp(notification.timestamp)}</p>
              </div>
              <div className="flex space-x-2">
                {!notification.read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Marcar como leída</span>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => clearNotification(notification.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            </div>
            <p className="mt-2">{notification.message}</p>
          </div>
        ))}
      </div>
    )
  }
}
