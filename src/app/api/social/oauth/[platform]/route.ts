import { NextRequest } from 'next/server';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { buildAuthorizationUrl } from '@/lib/social/oauth-config';
import crypto from 'crypto';

const SUPPORTED = ['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'tiktok', 'youtube', 'telegram', 'wordpress', 'shopify', 'threads'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const { platform } = await params;
    if (!SUPPORTED.includes(platform)) {
      return createApiResponse(false, undefined, `Unsupported platform: ${platform}`, 400);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/social/oauth/${platform}/callback`;
    const state = crypto.randomBytes(16).toString('hex');

    const authUrl = buildAuthorizationUrl(platform, redirectUri, state);

    return createApiResponse(true, { authorizationUrl: authUrl, state, platform, redirectUri });
  } catch (error) {
    return createApiResponse(false, undefined, error instanceof Error ? error.message : 'OAuth initiation failed', 500);
  }
}