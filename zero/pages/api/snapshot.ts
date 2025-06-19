import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { channel } = req.query;
  
  // Validación de parámetros
  if (!channel || Array.isArray(channel)) {
    return res.status(400).json({ error: 'Parámetro de canal inválido' });
  }

  const dvrIP = process.env.DVR_IP || '';
  const dvrUser = process.env.DVR_USER || '';
  const dvrPass = process.env.DVR_PASS || '';

  try {
    const response = await fetch(
      `http://${dvrIP}/cgi-bin/snapshot.cgi?channel=${channel}`, 
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${dvrUser}:${dvrPass}`).toString('base64')
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error del DVR: ${response.status}`);
    }

    // Establecer tipo de contenido
    res.setHeader('Content-Type', 'image/jpeg');
    
    // Pipe de la respuesta del DVR al cliente
    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
    
  } catch (error: any) {
    console.error('Error en snapshot API:', error);
    res.status(500).json({ 
      error: 'Error al obtener snapshot',
      details: error.message 
    });
  }
}