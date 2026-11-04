/**
 * Endpoint serverless para extracción de IP real del cliente.
 * Detecta IP desde headers proxy (x-forwarded-for) o socket de conexión.
 */
export default function handler(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = '127.0.0.1';

  if (forwarded) {
    ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
  } else if (req.socket && req.socket.remoteAddress) {
    ip = req.socket.remoteAddress;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.status(200).json({ ip });
}

