"use client"

import { useNotifications } from "@/components/notification-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, Trash2, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAllNotifications,
    isSocketConnected,
    connectSocket,
    disconnectSocket
  } = useNotifications();

  {/*
  useEffect(() => {
    // Intentar conectar al cargar la página
    connectSocket()
    return () => disconnectSocket()
  }, [connectSocket, disconnectSocket])
  */}
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
      case "alarm":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 border-orange-500 animate-pulse"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-500"
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)
  const alarmNotifications = notifications.filter((n) => n.type === "alarm")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground">Gestiona tus notificaciones del sistema.</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              if (isSocketConnected) {
                disconnectSocket();
              } else {
                connectSocket();
              }
            }}
          >
            {isSocketConnected ? (
              <>
                <Wifi className="mr-2 h-4 w-4 text-green-500" />
                Conectado
              </>
            ) : (
              <>
                <WifiOff className="mr-2 h-4 w-4 text-red-500" />
                Conectar
              </>
            )}
          </Button>
          
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
          <TabsTrigger value="alarms">Alarmas ({alarmNotifications.length})</TabsTrigger>
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

        <TabsContent value="alarms">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Seguridad</CardTitle>
              <CardDescription>Detecciones de movimiento recibidas</CardDescription>
            </CardHeader>
            <CardContent>{renderNotificationList(alarmNotifications)}</CardContent>
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

  function renderNotificationList(notificationList: Notification[]) {
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
            className={cn(
              "rounded-lg border p-4 transition-all",
              !notification.read ? "bg-slate-50 dark:bg-slate-800/50" : "",
              notification.type === "alarm" ? "border-orange-500/50" : ""
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center">
                  <h3 className="font-medium">{notification.title}</h3>
                  <Badge className={cn("ml-2", getTypeStyles(notification.type))}>
                    {notification.type === "alarm" ? "ALERTA" : notification.type}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatTimestamp(notification.timestamp)}
                </p>
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
            
            {notification.type === "alarm" && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {notification.distance && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    <span className="font-medium">Distancia:</span> {notification.distance.toFixed(1)} cm
                  </div>
                )}
                {notification.estado && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    <span className="font-medium">Estado:</span> {notification.estado === "activo" ? "Sistema activo" : "Sistema inactivo"}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
}
