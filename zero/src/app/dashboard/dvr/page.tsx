"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save } from "lucide-react"
import { useNotifications } from "@/components/notification-provider"

// Simple encryption function (for demo purposes only)
// In a real app, use a proper encryption library
const encryptData = (text: string, key: string): string => {
  // Simple XOR encryption (NOT secure for production)
  let result = ""
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    result += String.fromCharCode(charCode)
  }
  return btoa(result) // Base64 encode
}

export default function DvrPage() {
  const router = useRouter()
  const [ipAddress, setIpAddress] = useState("")
  const [port, setPort] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotifications()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validate inputs
      if (!ipAddress || !port || !username || !password || !name) {
        setError("Todos los campos son obligatorios")
        setLoading(false)
        return
      }

      // Validate IP address format
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
      if (!ipRegex.test(ipAddress)) {
        setError("Formato de dirección IP inválido")
        setLoading(false)
        return
      }

      // Validate port number
      const portNum = Number.parseInt(port)
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        setError("El puerto debe ser un número entre 1 y 65535")
        setLoading(false)
        return
      }

      // Encrypt sensitive data
      const encryptionKey = "secureKey123" // In a real app, use a proper key management system
      const encryptedPassword = encryptData(password, encryptionKey)

      // Get existing DVRs or initialize empty array
      const existingDvrs = JSON.parse(localStorage.getItem("dvrConnections") || "[]")

      // Create new DVR connection data
      const connectionData = {
        id: Date.now().toString(),
        name,
        ipAddress,
        port,
        username,
        password: encryptedPassword, // Store encrypted password
        timestamp: Date.now(),
      }

      // Add to array and store
      existingDvrs.push(connectionData)
      localStorage.setItem("dvrConnections", JSON.stringify(existingDvrs))

      // Añadir notificación
      addNotification("Configuración DVR guardada", `El DVR "${name}" se ha configurado correctamente`, "success")

      // Simulate API call delay and redirect
      setTimeout(() => {
        setSuccess("Configuración de DVR guardada correctamente")
        setLoading(false)
        // Redirect to the manage page
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
              <Label htmlFor="name">Nombre del DVR</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="DVR Principal" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipAddress">Dirección IP</Label>
              <Input
                id="ipAddress"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Puerto</Label>
              <Input id="port" value={port} onChange={(e) => setPort(e.target.value)} placeholder="8080" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p className="text-xs text-muted-foreground">La contraseña se almacenará de forma encriptada</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
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
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
