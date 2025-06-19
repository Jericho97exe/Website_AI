"use client";

import { useNotifications } from "@/components/notification-provider";
import { useEffect } from "react";

export default function SocketConnectionManager() {
  const { connectSocket, disconnectSocket } = useNotifications();

  useEffect(() => {
    // Conectar al montar la app
    connectSocket();
    
    // Manejar reconexión cuando el dispositivo vuelve en línea
    const handleOnline = () => {
      connectSocket();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      // NO desconectar aquí - mantener conexión global
    };
  }, [connectSocket]);

  return null;
}