"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImagePlus, Play, History, Trash2 } from "lucide-react"

// Añadir la importación de useNotifications
import { useNotifications } from "@/components/notification-provider"

type ImageEntry = {
  id: string
  dataUrl: string
  description: string
  translations: Record<string, string>
  timestamp: number
}

const languages = [
  { code: "es", name: "Español" },
  { code: "en", name: "Inglés" },
  { code: "fr", name: "Francés" },
  { code: "de", name: "Alemán" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Portugués" },
]

export default function ImagesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [translatedText, setTranslatedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [history, setHistory] = useState<ImageEntry[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageEntry | null>(null)

  // Dentro de la función ImagesPage, añadir:
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Load history from localStorage
    const storedHistory = localStorage.getItem("imageHistory")
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory))
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Reset other states
      setDescription("")
      setTranslatedText("")
      setSelectedImage(null)
      setError("")
      setSuccess("")
    }
  }

  // Reemplazar la función generateDescription con:
  const generateDescription = () => {
    if (!previewUrl) {
      setError("Por favor, selecciona una imagen primero")
      return
    }

    // In a real app, this would call an AI service
    // For this demo, we'll use a placeholder description
    const placeholderDescriptions = [
      "Una imagen colorida que muestra un paisaje natural con montañas y un lago.",
      "Una fotografía de un grupo de personas sonriendo en un evento social.",
      "Una imagen de un edificio moderno con arquitectura innovadora.",
      "Una fotografía de un plato de comida gourmet presentado artísticamente.",
      "Una imagen de un animal salvaje en su hábitat natural.",
    ]

    const randomDescription = placeholderDescriptions[Math.floor(Math.random() * placeholderDescriptions.length)]
    setDescription(randomDescription)
    setSuccess("Descripción generada correctamente")

    // Añadir notificación
    addNotification("Descripción generada", "Se ha generado una descripción para la imagen subida.", "success")
  }

  // Reemplazar la función translateDescription con:
  const translateDescription = () => {
    if (!description) {
      setError("Primero genera una descripción para traducir")
      return
    }

    // In a real app, this would call a translation API
    // For this demo, we'll add a language prefix to simulate translation
    const languagePrefixes: Record<string, string> = {
      en: "[English] ",
      es: "[Español] ",
      fr: "[Français] ",
      de: "[Deutsch] ",
      it: "[Italiano] ",
      pt: "[Português] ",
    }

    setTranslatedText(languagePrefixes[selectedLanguage] + description)
    setSuccess("Texto traducido correctamente")

    // Añadir notificación
    addNotification(
      "Texto traducido",
      `Se ha traducido el texto al idioma: ${languages.find((l) => l.code === selectedLanguage)?.name || selectedLanguage}`,
      "info",
    )
  }

  // Reemplazar la función playAudio con:
  const playAudio = () => {
    if (!translatedText) {
      setError("Primero traduce el texto para reproducirlo")
      return
    }

    // Use the Web Speech API for text-to-speech
    const utterance = new SpeechSynthesisUtterance(translatedText)

    // Try to set the language
    utterance.lang = selectedLanguage

    // Start speaking
    setIsPlaying(true)
    speechSynthesis.speak(utterance)

    // Añadir notificación
    addNotification("Reproduciendo audio", "Se está reproduciendo el texto traducido como audio", "info")

    // When done speaking
    utterance.onend = () => {
      setIsPlaying(false)
    }
  }

  // Reemplazar la función saveToHistory con:
  const saveToHistory = () => {
    if (!previewUrl || !description) {
      setError("Necesitas una imagen y una descripción para guardar")
      return
    }

    const newEntry: ImageEntry = {
      id: Date.now().toString(),
      dataUrl: previewUrl,
      description,
      translations: { [selectedLanguage]: translatedText },
      timestamp: Date.now(),
    }

    const updatedHistory = [newEntry, ...history]
    setHistory(updatedHistory)
    localStorage.setItem("imageHistory", JSON.stringify(updatedHistory))
    setSuccess("Guardado en el historial correctamente")

    // Añadir notificación
    addNotification("Imagen guardada", "La imagen y su descripción se han guardado en el historial", "success")
  }

  // Reemplazar la función deleteFromHistory con:
  const deleteFromHistory = (id: string) => {
    const updatedHistory = history.filter((entry) => entry.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("imageHistory", JSON.stringify(updatedHistory))

    // Añadir notificación
    addNotification("Imagen eliminada", "Se ha eliminado una imagen del historial", "warning")

    if (selectedImage?.id === id) {
      setSelectedImage(null)
      setPreviewUrl(null)
      setDescription("")
      setTranslatedText("")
    }
  }

  const loadFromHistory = (entry: ImageEntry) => {
    setSelectedImage(entry)
    setPreviewUrl(entry.dataUrl)
    setDescription(entry.description)

    // If there's a translation for the currently selected language, load it
    if (entry.translations[selectedLanguage]) {
      setTranslatedText(entry.translations[selectedLanguage])
    } else {
      setTranslatedText("")
    }

    setSelectedFile(null)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Imágenes</h1>
        <p className="text-muted-foreground">Sube imágenes, genera descripciones, traduce y reproduce como audio.</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Subir Imagen</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subir Imagen</CardTitle>
                <CardDescription>Selecciona una imagen para procesarla</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Imagen</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                {previewUrl && (
                  <div className="mt-4">
                    <Label>Vista previa</Label>
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Vista previa"
                        className="w-full h-auto max-h-64 object-contain"
                      />
                    </div>
                  </div>
                )}

                <Button onClick={generateDescription} disabled={!previewUrl} className="w-full">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Generar Descripción
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descripción y Traducción</CardTitle>
                <CardDescription>Visualiza, traduce y escucha la descripción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="La descripción generada aparecerá aquí"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma para traducción</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={translateDescription} disabled={!description} className="w-full">
                  Traducir Texto
                </Button>

                {translatedText && (
                  <div className="space-y-2">
                    <Label htmlFor="translated">Texto Traducido</Label>
                    <Textarea id="translated" value={translatedText} readOnly rows={3} />
                    <div className="flex space-x-2">
                      <Button onClick={playAudio} disabled={isPlaying} className="flex-1">
                        <Play className="mr-2 h-4 w-4" />
                        {isPlaying ? "Reproduciendo..." : "Reproducir Audio"}
                      </Button>
                      <Button onClick={saveToHistory} variant="outline" className="flex-1">
                        <History className="mr-2 h-4 w-4" />
                        Guardar
                      </Button>
                    </div>
                  </div>
                )}

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
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Imágenes</CardTitle>
              <CardDescription>Visualiza y gestiona tus imágenes guardadas</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {history.map((entry) => (
                    <Card key={entry.id} className="overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={entry.dataUrl || "/placeholder.svg"}
                          alt="Imagen guardada"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">{formatDate(entry.timestamp)}</p>
                        <p className="line-clamp-2 text-sm">{entry.description}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => loadFromHistory(entry)}>
                          Cargar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteFromHistory(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay imágenes guardadas en el historial</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
