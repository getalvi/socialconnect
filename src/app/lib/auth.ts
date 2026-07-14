import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'socialconnect-ai-jwt-secret-change-in-production';

function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
  exp: number;
  iat: number;
}

export function generateAccessToken(userId: string, role: string, email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    userId,
    role,
    email,
    exp: now + 15 * 60, // 15 minutes
    iat: now,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function generateRefreshToken(): string {
  return crypto.randomUUID();
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: JwtPayload = JSON.parse(base64UrlDecode(body));

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
}

export function getUserFromRequest(request: Request): { userId: string; role: string; email: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) return null;

  return { userId: payload.userId, role: payload.role, email: payload.email };
}

export function createApiResponse(success: boolean, data?: unknown, error?: string, status = 200) {
  return Response.json({ success, data, error }, { status });
}