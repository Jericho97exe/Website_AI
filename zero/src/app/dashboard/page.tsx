import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, Lock, List } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
        <p className="text-muted-foreground">Bienvenido al sistema multimedia. Selecciona una opción para comenzar.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/images">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Gestión de Imágenes</CardTitle>
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Sube imágenes, genera descripciones, traduce y reproduce como audio.</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/dvr">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Configurar DVR</CardTitle>
              <Lock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Configura la conexión con tu DVR de forma segura.</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/dvr/manage">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Gestionar DVRs</CardTitle>
              <List className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Administra tus DVRs configurados y visualiza su contenido.</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/background">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Página con Fondo</CardTitle>
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Visualiza una página con imagen de fondo.</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
