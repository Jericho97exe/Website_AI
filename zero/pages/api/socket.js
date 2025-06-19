import { Server } from 'socket.io';

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('🟢 Inicializando servidor Socket.IO');

    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutos
        skipMiddlewares: true,
      },
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      pingTimeout: 30000,
      pingInterval: 10000
    });

    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('🔌 Cliente conectado:', socket.id);
      
      // Configurar keep-alive
      socket.on('ping', (cb) => {
        if (typeof cb === 'function') cb();
      });

      socket.on('deteccion', (data) => {
        io.emit('deteccion', data);
      });

      socket.on('video_frame', (data) => {
        socket.broadcast.emit('video_frame', data);
      });

      socket.on("alarma", (data) => {
        io.emit("alarma", data);
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Cliente desconectado:', socket.id, 'Motivo:', reason);
      });

      socket.on('error', (error) => {
        console.error('🔥 Error en socket:', error);
      });
    });

    io.engine.on("connection_error", (err) => {
      console.error('🔥 Error de conexión:', err.message);
    });
  }

  res.end();
}