"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NotificationPanel } from "@/components/notification-panel"
import { NotificationToasts } from "@/components/notification-toasts"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Notificaciones", href: "/dashboard/notifications" },
    { name: "Imágenes", href: "/dashboard/images" },
    { name: "Conexión DVR", href: "/dashboard/dvr" },
    { name: "Página con Fondo", href: "/dashboard/background" },
  ]

  if (user?.role === "admin") {
    navItems.push({ name: "Gestión de Usuarios", href: "/dashboard/users" })
  }

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold">
                Sistema Multimedia
              </Link>
              <nav className="ml-10 hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationPanel />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {user?.username} ({user?.role === "admin" ? "Admin" : "Usuario"})
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium",
                  pathname === item.href
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>
      <NotificationToasts />
    </>
  )
}
