"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save } from "lucide-react"
import { useNotifications } from "@/components/notification-provider"

type DvrConnection = {
  id: string
  name: string
  ipAddress: string
  port: string
  username: string
  password: string
  timestamp: number
}

// Función de cifrado simple (solo para demostración)
const encryptData = (text: string, key: string): string => {
  let result = ""
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    result += String.fromCharCode(charCode)
  }
  return btoa(result)
}

export default function DvrPage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [formData, setFormData] = useState({
    ipAddress: "",
    port: "554",
    username: "admin",
    password: "",
    name: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)
  const [testing, setTesting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  // Probar conexión al DVR
  const testConnection = async () => {
    if (!formData.ipAddress || !formData.port) {
      setError("Dirección IP y puerto son obligatorios para probar la conexión")
      return
    }

    try {
      setTesting(true)
      setTestResult(null)
      
      // URL de prueba para snapshot del canal 1
      const testUrl = `http://${formData.ipAddress}:${formData.port}/cgi-bin/snapshot.cgi?channel=1`
      
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${formData.username}:${formData.password}`)
        }
      })

      if (response.ok && response.headers.get('content-type')?.includes('image/jpeg')) {
        setTestResult("success")
        addNotification("Conexión exitosa", "Se ha conectado correctamente al DVR", "success")
      } else {
        setTestResult("error")
        addNotification("Error de conexión", "No se pudo conectar al DVR", "error")
      }
    } catch (error) {
      setTestResult("error")
      addNotification("Error de conexión", "Ocurrió un error al intentar conectar al DVR", "error")
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validar entradas
      if (!formData.ipAddress || !formData.port || !formData.username || !formData.name) {
        setError("Todos los campos son obligatorios")
        setLoading(false)
        return
      }

      // Validar formato de IP
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
      if (!ipRegex.test(formData.ipAddress)) {
        setError("Formato de dirección IP inválido")
        setLoading(false)
        return
      }

      // Validar puerto
      const portNum = Number.parseInt(formData.port)
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        setError("El puerto debe ser un número entre 1 y 65535")
        setLoading(false)
        return
      }

      // Cifrar contraseña
      const encryptionKey = "secureKey123"
      const encryptedPassword = encryptData(formData.password, encryptionKey)

      // Crear nuevo DVR
      const connectionData: DvrConnection = {
        id: Date.now().toString(),
        name: formData.name,
        ipAddress: formData.ipAddress,
        port: formData.port,
        username: formData.username,
        password: encryptedPassword,
        timestamp: Date.now(),
      }

      // Obtener DVRs existentes o inicializar array vacío
      const existingDvrs = JSON.parse(localStorage.getItem("dvrConnections") || "[]")
      existingDvrs.push(connectionData)
      localStorage.setItem("dvrConnections", JSON.stringify(existingDvrs))

      // Notificación de éxito
      addNotification("Configuración DVR guardada", `El DVR "${formData.name}" se ha configurado correctamente`, "success")

      // Redirigir después de 1 segundo
      setTimeout(() => {
        router.push("/dashboard/dvr/manage")
      }, 1000)
    } catch (err) {
      setError("Ocurrió un error al guardar la configuración")
      addNotification("Error en configuración DVR", "Ocurrió un error al guardar la configuración del DVR", "error")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conexión DVR</h1>
        <p className="text-muted-foreground">Configura la conexión con tu DVR de forma segura.</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Configuración de Conexión</CardTitle>
          <CardDescription>Ingresa los datos de conexión de tu DVR</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del DVR *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="DVR Principal" 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipAddress">Dirección IP *</Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={handleChange}
                placeholder="192.168.1.100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Puerto *</Label>
              <Input 
                id="port" 
                value={formData.port} 
                onChange={handleChange} 
                placeholder="554" 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario *</Label>
              <Input 
                id="username" 
                value={formData.username} 
                onChange={handleChange} 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
              />
              <p className="text-xs text-muted-foreground">La contraseña se almacenará de forma encriptada</p>
            </div>

            <div className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={testConnection}
                disabled={testing || !formData.ipAddress}
              >
                {testing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Probar conexión"
                )}
              </Button>
              
              {testResult === "success" && (
                <span className="ml-3 text-green-600 text-sm">✓ Conexión exitosa</span>
              )}
              {testResult === "error" && (
                <span className="ml-3 text-red-600 text-sm">✗ Error de conexión</span>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="secondary" 
              className="w-full" 
              onClick={() => router.push("/dashboard/dvr/manage")}
            >
              Ver DVRs existentes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}