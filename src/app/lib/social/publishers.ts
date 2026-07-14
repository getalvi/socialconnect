interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
  statusCode?: number;
}

async function uploadMediaToUrl(url: string, filePath: string): Promise<string | null> {
  try {
    const fs = await import('fs');
    const fileBuffer = fs.readFileSync(filePath);
    const response = await fetch(url, {
      method: 'POST',
      body: fileBuffer,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    if (!response.ok) return null;
    const data = await response.json() as Record<string, unknown>;
    return data.id as string || data.media_id as string || null;
  } catch {
    return null;
  }
}

export async function publishToFacebook(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<PublishResult> {
  try {
    const pageResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
    );
    const pageData = await pageResponse.json() as { data: Array<{ id: string; access_token: string }> };
    const page = pageData.data?.[0];
    if (!page) return { success: false, error: 'No Facebook page found' };

    const body: Record<string, string> = { message: content };
    if (mediaUrls.length > 0) {
      body.link = mediaUrls[0];
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}/feed?access_token=${page.access_token}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    const data = await response.json() as { id?: string; error?: { message: string } };

    if (data.error) return { success: false, error: data.error.message };
    return {
      success: true,
      platformPostId: data.id,
      platformUrl: `https://facebook.com/${data.id}`,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToInstagram(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<PublishResult> {
  try {
    const igResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
    );
    const igData = await igResponse.json() as { data: Array<{ instagram_business_account?: { id: string } }> };
    const igAccountId = igData.data?.[0]?.instagram_business_account?.id;
    if (!igAccountId) return { success: false, error: 'No Instagram business account linked' };

    if (mediaUrls.length > 0) {
      const createResp = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: mediaUrls[0],
            caption: content,
            access_token: accessToken,
          }),
        }
      );
      const createData = await createResp.json() as { id?: string; error?: { message: string } };
      if (createData.error) return { success: false, error: createData.error.message };
      if (!createData.id) return { success: false, error: 'Failed to create media container' };

      const publishResp = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creation_id: createData.id, access_token: accessToken }),
        }
      );
      const pubData = await publishResp.json() as { id?: string; error?: { message: string } };
      if (pubData.error) return { success: false, error: pubData.error.message };
      return { success: true, platformPostId: pubData.id };
    }

    return { success: false, error: 'Instagram requires at least one media file' };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToTwitter(
  accessToken: string,
  content: string,
  _mediaUrls: string[]
): Promise<PublishResult> {
  try {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content.substring(0, 280) }),
    });
    const data = await response.json() as { data?: { id: string; text: string }; error?: string; detail?: string };

    if (!response.ok) return { success: false, error: data.error || data.detail || `HTTP ${response.status}` };
    return {
      success: true,
      platformPostId: data.data?.id,
      platformUrl: `https://twitter.com/i/status/${data.data?.id}`,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToLinkedIn(
  accessToken: string,
  content: string,
  _mediaUrls: string[]
): Promise<PublishResult> {
  try {
    const userResp = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userResp.json() as { sub: string };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${userData.sub}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: content },
            shareMediaCategory: 'ARTICLE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText };
    }
    const data = await response.json() as { id: string };
    return { success: true, platformPostId: data.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToPinterest(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<PublishResult> {
  try {
    if (!mediaUrls.length) return { success: false, error: 'Pinterest requires a media URL' };

    const boardResp = await fetch('https://api.pinterest.com/v5/boards', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const boardData = await boardResp.json() as { items?: Array<{ id: string }> };
    const boardId = boardData.items?.[0]?.id;
    if (!boardId) return { success: false, error: 'No Pinterest board found' };

    const response = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board_id: boardId,
        media_source: { source_type: 'image_url', url: mediaUrls[0] },
        title: content.substring(0, 100),
        description: content.substring(0, 500),
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText };
    }
    const data = await response.json() as { id: string };
    return { success: true, platformPostId: data.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToTikTok(
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<PublishResult> {
  try {
    if (!mediaUrls.length) return { success: false, error: 'TikTok requires a video file' };

    const response = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: content.substring(0, 150),
          privacy_level: 'PUBLIC_TO_EVERYONE',
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: mediaUrls[0],
        },
      }),
    });
    const data = await response.json() as { data?: { publish_id: string }; error?: { code: string; message: string } };

    if (data.error) return { success: false, error: data.error.message };
    return { success: true, platformPostId: data.data?.publish_id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToYouTube(
  accessToken: string,
  content: string,
  _mediaUrls: string[]
): Promise<PublishResult> {
  try {
    const meta = {
      snippet: {
        title: content.substring(0, 100),
        description: content.substring(0, 5000),
        categoryId: '22',
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    };

    const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meta),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText };
    }

    const location = response.headers.get('location');
    if (location) {
      const uploadResp = await fetch(location, { method: 'PUT', body: '' });
      const uploadData = await uploadResp.json() as { id: string };
      return { success: true, platformPostId: uploadData.id, platformUrl: `https://youtube.com/watch?v=${uploadData.id}` };
    }

    return { success: false, error: 'Failed to initiate YouTube upload' };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToTelegram(
  accessToken: string,
  content: string,
  _mediaUrls: string[]
): Promise<PublishResult> {
  try {
    const chatId = accessToken;
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    if (!botToken) return { success: false, error: 'Telegram bot token not configured' };

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: content, parse_mode: 'HTML' }),
      }
    );
    const data = await response.json() as { ok: boolean; result?: { message_id: number } };
    if (!data.ok) return { success: false, error: 'Telegram send failed' };
    return { success: true, platformPostId: String(data.result?.message_id) };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToWordPress(
  accessToken: string,
  content: string,
  _mediaUrls: string[]
): Promise<PublishResult> {
  try {
    const siteUrl = process.env.WORDPRESS_SITE_URL || '';
    const response = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: content.substring(0, 100),
        content,
        status: 'publish',
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText };
    }
    const data = await response.json() as { id: number; link: string };
    return { success: true, platformPostId: String(data.id), platformUrl: data.link };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToShopify(
  accessToken: string,
  content: string,
  _mediaUrls: string[]
): Promise<PublishResult> {
  try {
    const storeName = process.env.SHOPIFY_STORE_NAME || 'your-store';
    const response = await fetch(
      `https://${storeName}.myshopify.com/admin/api/2024-01/articles.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article: {
            title: content.substring(0, 100),
            body_html: content,
            published: true,
          },
        }),
      }
    );
    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText };
    }
    const data = await response.json() as { article: { id: number } };
    return { success: true, platformPostId: String(data.article.id) };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function publishToThreads(
  accessToken: string,
  content: string,
  _mediaUrls: string[]
): Promise<PublishResult> {
  try {
    const response = await fetch('https://graph.threads.net/v1.0/me/threads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_type: 'TEXT',
        text: content.substring(0, 500),
      }),
    });
    const data = await response.json() as { id?: string; error?: { message: string } };
    if (data.error) return { success: false, error: data.error.message };
    if (!data.id) return { success: false, error: 'Failed to create Threads post' };

    const pubResp = await fetch(`https://graph.threads.net/v1.0/${data.id}/threads_publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const pubData = await pubResp.json() as { id?: string; error?: { message: string } };
    if (pubData.error) return { success: false, error: pubData.error.message };
    return { success: true, platformPostId: pubData.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

const publisherMap: Record<string, typeof publishToFacebook> = {
  facebook: publishToFacebook,
  instagram: publishToInstagram,
  twitter: publishToTwitter,
  linkedin: publishToLinkedIn,
  pinterest: publishToPinterest,
  tiktok: publishToTikTok,
  youtube: publishToYouTube,
  telegram: publishToTelegram,
  wordpress: publishToWordPress,
  shopify: publishToShopify,
  threads: publishToThreads,
};

export async function publishToPlatform(
  platform: string,
  accessToken: string,
  content: string,
  mediaUrls: string[]
): Promise<PublishResult> {
  const publisher = publisherMap[platform];
  if (!publisher) return { success: false, error: `Unsupported platform: ${platform}` };
  return publisher(accessToken, content, mediaUrls);
}