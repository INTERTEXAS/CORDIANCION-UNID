import { neon } from '@neondatabase/serverless';
import { createAdminAssistantToken } from './academic-assistant-auth.js';

const ADMIN_ROLES = new Set(['admin_sistema', 'super_admin', 'superadmin']);

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.end(JSON.stringify(payload));
}

async function getRequestBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 4000) throw new RangeError('Request body too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export default async function handler(req, res, options = {}) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Método no permitido.' });
  }

  try {
    const body = await getRequestBody(req);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!email || !password || password.length > 512) {
      return sendJson(res, 400, { error: 'Ingresa las credenciales de administrador.' });
    }

    const databaseUrl = process.env.DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;
    if (!databaseUrl) {
      return sendJson(res, 503, { error: 'El acceso administrativo del asistente no está configurado en el servidor.' });
    }

    const sql = options.sqlClient || neon(databaseUrl);
    const rows = await sql`
      SELECT email, password_hash, rol
      FROM usuarios
      WHERE LOWER(TRIM(email)) = ${email}
      LIMIT 1
    `;
    const user = rows[0];
    const role = String(user?.rol || '').trim().toLowerCase();
    if (!user || user.password_hash !== password || !ADMIN_ROLES.has(role)) {
      return sendJson(res, 403, { error: 'Las credenciales no corresponden a una cuenta administradora autorizada.' });
    }

    let token;
    try {
      token = createAdminAssistantToken({ email: user.email, role });
    } catch (error) {
      if (error.message.includes('ACADEMIC_ASSISTANT_ADMIN_SECRET')) {
        return sendJson(res, 503, { error: 'El acceso administrativo del asistente no está configurado en el servidor.' });
      }
      throw error;
    }
    return sendJson(res, 200, { token, expiresIn: 3600 });
  } catch (error) {
    if (error instanceof SyntaxError) return sendJson(res, 400, { error: 'El cuerpo de la solicitud no es JSON válido.' });
    if (error instanceof RangeError) return sendJson(res, 413, { error: 'La solicitud excede el tamaño permitido.' });
    console.error('[AcademicAssistantAdminSession] Error al validar administrador:', error);
    return sendJson(res, 500, { error: 'No se pudo validar el acceso de administrador al asistente.' });
  }
}
