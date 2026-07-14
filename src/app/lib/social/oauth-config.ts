export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  userInfoUrl: string;
}

export const oauthConfigs: Record<string, () => OAuthConfig> = {
  facebook: () => ({
    clientId: process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.FACEBOOK_APP_SECRET || '',
    authorizeUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['public_profile', 'email', 'pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish'],
    userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture',
  }),
  instagram: () => ({
    clientId: process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '',
    authorizeUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish'],
    userInfoUrl: 'https://graph.facebook.com/me/accounts',
  }),
  twitter: () => ({
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    userInfoUrl: 'https://api.twitter.com/2/users/me',
  }),
  linkedin: () => ({
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['openid', 'profile', 'email', 'w_member_social'],
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
  }),
  pinterest: () => ({
    clientId: process.env.PINTEREST_APP_ID || '',
    clientSecret: process.env.PINTEREST_APP_SECRET || '',
    authorizeUrl: 'https://api.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
    scopes: ['boards:read', 'boards:write', 'pins:read', 'pins:write'],
    userInfoUrl: 'https://api.pinterest.com/v5/user_account',
  }),
  tiktok: () => ({
    clientId: process.env.TIKTOK_CLIENT_KEY || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
    authorizeUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scopes: ['user.info.basic', 'video.publish', 'video.list'],
    userInfoUrl: 'https://open.tiktokapis.com/v2/user/info/',
  }),
  youtube: () => ({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
  }),
  telegram: () => ({
    clientId: process.env.TELEGRAM_BOT_TOKEN || '',
    clientSecret: '',
    authorizeUrl: 'https://oauth.telegram.org/auth',
    tokenUrl: '',
    scopes: [],
    userInfoUrl: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN || ''}/getMe`,
  }),
  wordpress: () => ({
    clientId: process.env.WORDPRESS_CLIENT_ID || '',
    clientSecret: process.env.WORDPRESS_CLIENT_SECRET || '',
    authorizeUrl: `${process.env.WORDPRESS_SITE_URL || ''}/wp-json/oauth2/authorize`,
    tokenUrl: `${process.env.WORDPRESS_SITE_URL || ''}/wp-json/oauth2/token`,
    scopes: ['posts', 'media'],
    userInfoUrl: `${process.env.WORDPRESS_SITE_URL || ''}/wp-json/wp/v2/users/me`,
  }),
  shopify: () => ({
    clientId: process.env.SHOPIFY_API_KEY || '',
    clientSecret: process.env.SHOPIFY_API_SECRET || '',
    authorizeUrl: `https://${process.env.SHOPIFY_STORE_NAME || 'your-store'}.myshopify.com/admin/oauth/authorize`,
    tokenUrl: `https://${process.env.SHOPIFY_STORE_NAME || 'your-store'}.myshopify.com/admin/oauth/access_token`,
    scopes: ['read_products', 'write_products', 'read_content', 'write_content'],
    userInfoUrl: `https://${process.env.SHOPIFY_STORE_NAME || 'your-store'}.myshopify.com/admin/api/2024-01/shop.json`,
  }),
  threads: () => ({
    clientId: process.env.THREADS_APP_ID || process.env.FACEBOOK_APP_ID || '',
    clientSecret: process.env.THREADS_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '',
    authorizeUrl: 'https://www.threads.net/oauth/authorize',
    tokenUrl: 'https://graph.threads.net/oauth/access_token',
    scopes: ['threads_basic', 'threads_content_publish'],
    userInfoUrl: 'https://graph.threads.net/me?fields=id,username,threads_profile_picture_url',
  }),
};

export function getOAuthConfig(platform: string): OAuthConfig {
  const configFn = oauthConfigs[platform];
  if (!configFn) throw new Error(`Unsupported platform: ${platform}`);
  return configFn();
}

export function buildAuthorizationUrl(platform: string, redirectUri: string, state: string): string {
  const config = getOAuthConfig(platform);

  if (platform === 'telegram') {
    return `${config.authorizeUrl}?bot_id=${config.clientId}&origin=${encodeURIComponent(redirectUri)}&request_id=${state}`;
  }

  if (platform === 'twitter') {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scopes.join(' '),
      state,
      code_challenge: 'challenge',
      code_challenge_method: 'plain',
    });
    return `${config.authorizeUrl}?${params.toString()}`;
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state,
  });

  return `${config.authorizeUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(platform: string, code: string, redirectUri: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  const config = getOAuthConfig(platform);

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Token exchange failed for ${platform}: ${errText}`);
  }

  const data = await response.json() as Record<string, unknown>;

  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresIn: data.expires_in as number | undefined,
  };
}