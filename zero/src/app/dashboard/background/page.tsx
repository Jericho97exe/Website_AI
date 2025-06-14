'use client'

import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"

interface Deteccion {
  tipo: string
  confianza: number
  timestamp: string
}

interface VideoFrame {
  image: string
}

function NotificationItem({ tipo, confianza, timestamp }: Deteccion) {
  return (
    <li className="flex items-center bg-white shadow-md rounded-lg p-4 mb-3">
      <div className="flex-shrink-0">
        {tipo === "person" ? (
          <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z" />
          </svg>
        ) : (
          <svg className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-semibold text-gray-800">
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)} detectado
        </p>
        <p className="text-sm text-gray-600">
          Confianza: {Math.round(confianza * 100)}%
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(timestamp).toLocaleString()}
        </p>
      </div>
    </li>
  )
}

export default function HomePage() {
  const [eventos, setEventos] = useState<Deteccion[]>([])
  const [frameBase64, setFrameBase64] = useState<string>("")
  const [connectionStatus, setConnectionStatus] = useState<string>("connecting")
  const [fps, setFps] = useState<number>(0)
  const socket = useRef<Socket | null>(null)
  const frameCount = useRef<number>(0)
  const fpsInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
  socket.current = io({
    path: "/api/socket",
    transports: ["websocket"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.current.on("connect", () => {
    console.log("✅ Conectado al servidor Socket.IO");
    setConnectionStatus("connected");
    startFpsCounter();
  });

  socket.current.on("disconnect", () => {
    console.log("⚠️ Desconectado del servidor Socket.IO");
    setConnectionStatus("disconnected");
    stopFpsCounter();
  });

  socket.current.on("connect_error", (err) => {
    console.error("❌ Error de conexión:", err?.message || err || "Error desconocido");
    setConnectionStatus("error");
  });

  socket.current.on("deteccion", (data: Deteccion) => {
    setEventos(prev => [data, ...prev.slice(0, 50)]);
  });

  socket.current.on("video_frame", (data: VideoFrame) => {
    setFrameBase64(data.image);
    frameCount.current += 1;
  });

  return () => {
    socket.current?.disconnect();
    stopFpsCounter();
  };
}, []);

  const startFpsCounter = () => {
    fpsInterval.current = setInterval(() => {
      setFps(frameCount.current)
      frameCount.current = 0
    }, 1000)
  }

  const stopFpsCounter = () => {
    if (fpsInterval.current) {
      clearInterval(fpsInterval.current)
    }
  }

  const connectionStatusColors = {
    connected: "bg-green-500",
    disconnected: "bg-red-500",
    connecting: "bg-yellow-500",
    error: "bg-red-700"
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video en tiempo real con detección</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${connectionStatusColors[connectionStatus as keyof typeof connectionStatusColors]}`}></span>
            <span className="text-sm">
              {connectionStatus === "connected" ? "Conectado" : 
               connectionStatus === "connecting" ? "Conectando..." : 
               connectionStatus === "error" ? "Error de conexión" : "Desconectado"}
            </span>
          </div>
          <div className="text-sm bg-gray-100 px-3 py-1 rounded">
            FPS: {fps}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow">
            {frameBase64 ? (
              <img
                src={`data:image/jpeg;base64,${frameBase64}`}
                alt="Video en tiempo real"
                className="w-full h-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                  {connectionStatus === "connected" ? "Cargando video..." : "Esperando conexión..."}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <h2 className="text-xl font-semibold mb-4">Detecciones recientes</h2>
            <ul className="max-h-[500px] overflow-y-auto pr-2">
              {eventos.length > 0 ? (
                eventos.map((e, idx) => (
                  <NotificationItem key={`${e.timestamp}-${idx}`} {...e} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No hay detecciones aún
                </p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}