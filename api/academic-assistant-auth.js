import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_LIFETIME_SECONDS = 60 * 60;
const ADMIN_ROLES = new Set(['admin_sistema', 'super_admin', 'superadmin']);

function getTokenSecret() {
  const secret = process.env.ACADEMIC_ASSISTANT_ADMIN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ACADEMIC_ASSISTANT_ADMIN_SECRET debe configurarse con al menos 32 caracteres en las variables de entorno.');
  }
  return secret;
}

function signPayload(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createAdminAssistantToken(user, now = Date.now()) {
  const secret = getTokenSecret();
  const payload = Buffer.from(JSON.stringify({
    email: String(user.email).trim().toLowerCase(),
    role: String(user.role).trim().toLowerCase(),
    exp: Math.floor(now / 1000) + TOKEN_LIFETIME_SECONDS
  })).toString('base64url');
  return `${payload}.${signPayload(payload, secret)}`;
}

export function verifyAdminAssistantToken(token, now = Date.now()) {
  if (typeof token !== 'string') return false;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return false;

  const expected = Buffer.from(signPayload(payload, getTokenSecret()));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof user.email === 'string'
      && ADMIN_ROLES.has(user.role)
      && Number.isFinite(user.exp)
      && user.exp > Math.floor(now / 1000);
  } catch {
    return false;
  }
}
