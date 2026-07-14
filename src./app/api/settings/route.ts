import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { settingsSchema } from '@/lib/validation';

export async function GET() {
  try {
    const configs = await db.systemConfig.findMany();
    const settings: Record<string, string> = {};
    for (const c of configs) {
      settings[c.key] = c.value;
    }
    return createApiResponse(true, settings);
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const { key, value, type, description } = body;

    if (!key || value === undefined) {
      return createApiResponse(false, undefined, 'Key and value are required', 400);
    }

    const config = await db.systemConfig.upsert({
      where: { key },
      update: { value: String(value), type: type || 'string', description: description || undefined },
      create: { key, value: String(value), type: type || 'string', description: description || undefined },
    });

    return createApiResponse(true, config);
  } catch {
    return createApiResponse(false, undefined, 'Internal server error', 500);
  }
}