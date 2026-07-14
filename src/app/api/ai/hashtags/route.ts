import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { openRouter } from '@/lib/openrouter';
import { hashtagRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = hashtagRequestSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const { content, platform, count, model } = parsed.data;

    const prompt = `Generate ${count} relevant hashtags for ${platform} based on this content:
"${content}"

Return a JSON object with this exact structure:
{
  "trending": ["#trending1", "#trending2", "#trending3", "#trending4", "#trending5"],
  "niche": ["#niche1", "#niche2", "#niche3", "#niche4", "#niche5", "#niche6", "#niche7"],
  "general": ["#general1", "#general2", "#general3", "#general4", "#general5"],
  "branded": ["#BrandName_Idea1", "#BrandName_Idea2"]
}`;

    const result = await openRouter.chat(
      [{ role: 'user', content: prompt }],
      { model: model || undefined }
    );

    let parsedResult;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { trending: [], niche: [], general: [], branded: [] };
    } catch {
      const tags = result.content.split(/[\n,]/).filter(t => t.trim().startsWith('#')).map(t => t.trim());
      parsedResult = { trending: tags.slice(0, 5), niche: tags.slice(5, 15), general: tags.slice(15), branded: [] };
    }

    await db.aiUsageLog.create({
      data: {
        userId: user.userId,
        model: result.model,
        promptTokens: result.usage.prompt_tokens,
        completionTokens: result.usage.completion_tokens,
        totalTokens: result.usage.total_tokens,
        latencyMs: result.latencyMs,
        requestType: 'hashtag',
        input: JSON.stringify({ content: content.substring(0, 200), platform, count }),
        output: JSON.stringify(parsedResult),
      },
    });

    return createApiResponse(true, {
      ...parsedResult,
      model: result.model,
      usage: result.usage,
      latencyMs: result.latencyMs,
    });
  } catch (error) {
    logger.error('Hashtag generation error', error);
    const msg = error instanceof Error ? error.message : 'AI service error';
    return createApiResponse(false, undefined, msg, 500);
  }
}