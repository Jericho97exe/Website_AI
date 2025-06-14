"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2, Eye, ArrowLeft } from "lucide-react"
import { useNotifications } from "@/components/notification-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type DvrConnection = {
  id: string
  name: string
  ipAddress: string
  port: string
  username: string
  password: string
  timestamp: number
}

export default function ManageDvrPage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [dvrConnections, setDvrConnections] = useState<DvrConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDvr, setSelectedDvr] = useState<DvrConnection | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [cameraFeeds, setCameraFeeds] = useState<string[]>([])

  useEffect(() => {
    // Load DVR connections from localStorage
    const storedConnections = localStorage.getItem("dvrConnections")
    if (storedConnections) {
      setDvrConnections(JSON.parse(storedConnections))
    }
    setLoading(false)
  }, [])

  const handleDelete = (dvr: DvrConnection) => {
    setSelectedDvr(dvr)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedDvr) return

    try {
      const updatedConnections = dvrConnections.filter((conn) => conn.id !== selectedDvr.id)
      localStorage.setItem("dvrConnections", JSON.stringify(updatedConnections))
      setDvrConnections(updatedConnections)

      addNotification("DVR eliminado", `La configuración del DVR "${selectedDvr.name}" ha sido eliminada`, "warning")

      setIsDeleteDialogOpen(false)
      setSelectedDvr(null)
    } catch (error) {
      addNotification("Error al eliminar", "No se pudo eliminar la configuración del DVR", "error")
    }
  }

  const handleViewContent = (dvr: DvrConnection) => {
    setSelectedDvr(dvr)

    // Simulate loading camera feeds
    setCameraFeeds([])
    setIsViewDialogOpen(true)

    // Simulate API call to get camera feeds
    setTimeout(() => {
      // Generate random number of cameras (3-8)
      const numCameras = Math.floor(Math.random() * 6) + 3
      const feeds = Array.from({ length: numCameras }, (_, i) => `Cámara ${i + 1}`)
      setCameraFeeds(feeds)
    }, 1500)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de DVRs</h1>
          <p className="text-muted-foreground">Administra tus conexiones de DVR configuradas.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/dvr")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button onClick={() => router.push("/dashboard/dvr")}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir DVR
          </Button>
        </div>
      </div>

      {dvrConnections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-center text-muted-foreground">No hay DVRs configurados</p>
            <Button onClick={() => router.push("/dashboard/dvr")}>
              <Plus className="mr-2 h-4 w-4" />
              Configurar un DVR
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dvrConnections.map((dvr) => (
            <Card key={dvr.id}>
              <CardHeader>
                <CardTitle>{dvr.name}</CardTitle>
                <CardDescription>
                  {dvr.ipAddress}:{dvr.port}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usuario:</span>
                    <span>{dvr.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Configurado:</span>
                    <span>{formatDate(dvr.timestamp)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleViewContent(dvr)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver contenido
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(dvr)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la configuración del DVR "{selectedDvr?.name}"? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Content Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contenido del DVR: {selectedDvr?.name}</DialogTitle>
            <DialogDescription>
              Visualización de cámaras conectadas al DVR {selectedDvr?.ipAddress}:{selectedDvr?.port}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {cameraFeeds.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Conectando con el DVR...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {cameraFeeds.map((camera, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center relative overflow-hidden"
                  >
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
                      {camera}
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Vista previa de cámara</p>
                      <p className="text-xs text-muted-foreground">(Simulación)</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
