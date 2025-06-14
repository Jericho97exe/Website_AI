"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2 } from "lucide-react"
// Añadir la importación de useNotifications
import { useNotifications } from "@/components/notification-provider"

export default function Home() {
  const { user, login, register, isLoading } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // Dentro de la función Home, añadir:
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Initialize default admin user if no users exist
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    if (users.length === 0) {
      const defaultAdmin = {
        id: "admin-1",
        username: "admin",
        password: "admin123",
        role: "admin",
      }
      localStorage.setItem("users", JSON.stringify([defaultAdmin]))
    }

    // Redirect if already logged in
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Reemplazar la función handleSubmit con:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let success
      if (isLogin) {
        success = await login(username, password)
        if (success) {
          // Añadir notificación
          addNotification("Inicio de sesión exitoso", `Bienvenido de nuevo, ${username}!`, "success")
          router.push("/dashboard")
        } else {
          setError("Usuario o contraseña incorrectos")
          // Añadir notificación de error
          addNotification("Error de inicio de sesión", "Usuario o contraseña incorrectos", "error")
        }
      } else {
        success = await register(username, password, "user")
        if (success) {
          setIsLogin(true)
          setError("Usuario registrado correctamente. Inicia sesión.")
          // Añadir notificación
          addNotification("Registro exitoso", "Usuario registrado correctamente. Por favor, inicia sesión.", "success")
        } else {
          setError("El nombre de usuario ya existe")
          // Añadir notificación de error
          addNotification("Error de registro", "El nombre de usuario ya existe", "error")
        }
      }
    } catch (err) {
      setError("Ocurrió un error. Inténtalo de nuevo.")
      // Añadir notificación de error
      addNotification("Error", "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.", "error")
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Iniciar Sesión" : "Registrarse"}</CardTitle>
          <CardDescription>
            {isLogin ? "Ingresa tus credenciales para acceder al sistema" : "Crea una nueva cuenta de usuario"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isLogin ? "Iniciar Sesión" : "Registrarse"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
