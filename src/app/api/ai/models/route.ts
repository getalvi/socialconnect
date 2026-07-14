import { NextRequest } from 'next/server';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { openRouter } from '@/lib/openrouter';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const models = await openRouter.getModels();
    return createApiResponse(true, models);
  } catch (error) {
    return createApiResponse(false, undefined, 'Failed to fetch models', 500);
  }
}