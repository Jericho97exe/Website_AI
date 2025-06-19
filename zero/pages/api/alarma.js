export default function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;

    // Emitir evento a través de WebSocket
    const io = req.socket.server.io;
    if (io) {
      io.emit("alarma", data);
      console.log("🚨 Evento de alarma emitido a clientes WebSocket");
    }

    res.status(200).json({ message: 'Notificación recibida' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}