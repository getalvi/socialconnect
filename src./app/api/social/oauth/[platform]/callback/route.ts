import { NextRequest } from 'next/server';
import { exchangeCodeForToken } from '@/lib/social/oauth-config';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { logger } from '@/lib/logger';

const SUPPORTED = ['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest', 'tiktok', 'youtube', 'telegram', 'wordpress', 'shopify', 'threads'];

export async function GET(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  try {
    const { platform } = await params;
    if (!SUPPORTED.includes(platform)) {
      return createApiResponse(false, undefined, `Unsupported platform: ${platform}`, 400);
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const userId = searchParams.get('state');

    if (!code) return createApiResponse(false, undefined, 'No authorization code provided', 400);
    if (!userId) return createApiResponse(false, undefined, 'No state/user ID provided', 400);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/social/oauth/${platform}/callback`;

    if (platform === 'telegram') {
      return createApiResponse(false, undefined, 'Telegram uses bot-based auth. Please provide bot token in settings.', 400);
    }

    const tokens = await exchangeCodeForToken(platform, code, redirectUri);

    const account = await db.socialAccount.create({
      data: {
        userId,
        platform,
        platformUserId: 'connected',
        displayName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || null,
        tokenExpiresAt: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null,
      },
    });

    logger.info(`OAuth callback: ${platform} connected for user ${userId}`);

    return createApiResponse(true, {
      message: `${platform} connected successfully`,
      accountId: account.id,
      platform,
    });
  } catch (error) {
    logger.error('OAuth callback error', error);
    return createApiResponse(false, undefined, error instanceof Error ? error.message : 'OAuth callback failed', 500);
  }
}