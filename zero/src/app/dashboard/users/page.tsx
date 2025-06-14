"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, UserPlus, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
// Añadir la importación de useNotifications
import { useNotifications } from "@/components/notification-provider"

type UserType = {
  id: string
  username: string
  role: "admin" | "user"
}

export default function UsersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "user">("user")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  // Dentro de la función UsersPage, añadir:
  const { addNotification } = useNotifications()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard")
      return
    }

    loadUsers()
  }, [user, isLoading, router])

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    // Remove passwords for security
    const safeUsers = storedUsers.map((u: any) => ({
      id: u.id,
      username: u.username,
      role: u.role,
    }))
    setUsers(safeUsers)
  }

  // Reemplazar la función handleAddUser con:
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")

      // Check if username already exists
      if (storedUsers.some((u: any) => u.username === username)) {
        setError("El nombre de usuario ya existe")

        // Añadir notificación de error
        addNotification("Error al crear usuario", "El nombre de usuario ya existe en el sistema", "error")

        setLoading(false)
        return
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        password,
        role,
      }

      storedUsers.push(newUser)
      localStorage.setItem("users", JSON.stringify(storedUsers))

      setUsername("")
      setPassword("")
      setRole("user")
      setSuccess("Usuario creado correctamente")

      // Añadir notificación
      addNotification(
        "Usuario creado",
        `Se ha creado el usuario "${username}" con rol de ${role === "admin" ? "administrador" : "usuario"}`,
        "success",
      )

      loadUsers()
    } catch (err) {
      setError("Ocurrió un error al crear el usuario")

      // Añadir notificación de error
      addNotification("Error al crear usuario", "Ocurrió un error al intentar crear el usuario", "error")
    } finally {
      setLoading(false)
    }
  }

  // Reemplazar la función handleDeleteUser con:
  const handleDeleteUser = (id: string) => {
    try {
      // Don't allow deleting yourself
      if (id === user?.id) {
        setError("No puedes eliminar tu propio usuario")

        // Añadir notificación de error
        addNotification("Error al eliminar usuario", "No puedes eliminar tu propio usuario", "error")
        return
      }

      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]")
      const userToDelete = storedUsers.find((u: any) => u.id === id)
      const updatedUsers = storedUsers.filter((u: any) => u.id !== id)
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      setSuccess("Usuario eliminado correctamente")

      // Añadir notificación
      addNotification(
        "Usuario eliminado",
        `Se ha eliminado el usuario "${userToDelete?.username || "desconocido"}" del sistema`,
        "warning",
      )

      loadUsers()
    } catch (err) {
      setError("Ocurrió un error al eliminar el usuario")

      // Añadir notificación de error
      addNotification("Error al eliminar usuario", "Ocurrió un error al intentar eliminar el usuario", "error")
    }
  }

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administra los usuarios del sistema.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Añadir Nuevo Usuario</CardTitle>
            <CardDescription>Crea una nueva cuenta de usuario o administrador</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
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
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={role} onValueChange={(value) => setRole(value as "admin" | "user")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Usuario
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios Existentes</CardTitle>
            <CardDescription>Lista de todos los usuarios registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.role === "admin" ? "Administrador" : "Usuario"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
