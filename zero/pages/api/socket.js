import { Server } from 'socket.io';

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('🟢 Inicializando servidor Socket.IO');

    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('🔌 Cliente conectado al WebSocket');

      socket.on('deteccion', (data) => {
        console.log('📡 Detección recibida:', data);
        socket.broadcast.emit('deteccion', data);
      });

      socket.on('video_frame', (data) => {
        socket.broadcast.emit('video_frame', data);
      });

      socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado');
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}