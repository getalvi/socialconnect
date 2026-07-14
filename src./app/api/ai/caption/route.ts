import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { openRouter } from '@/lib/openrouter';
import { captionRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = captionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const { content, mediaId, platform, tone, language, model, variations } = parsed.data;

    let imageContext = '';
    if (mediaId) {
      const media = await db.media.findFirst({ where: { id: mediaId, userId: user.userId } });
      if (media?.analysisResult) {
        imageContext = `\nImage Analysis: ${media.analysisResult}`;
      }
    }

    const prompt = `Generate ${variations} engaging social media captions for ${platform}.
Tone: ${tone}
Language: ${language}
${content ? `Product/Content: ${content}` : ''}
${imageContext}

Return a JSON object with this exact structure:
{
  "captions": [
    {"text": "caption text here", "engagement_score": 85, "hashtags_suggestion": ["#tag1", "#tag2"]}
  ],
  "best_practices": ["tip 1", "tip 2", "tip 3"]
}`;

    const start = Date.now();
    const result = await openRouter.chat(
      [{ role: 'user', content: prompt }],
      { model: model || undefined }
    );

    let parsedResult;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { captions: [{ text: result.content, engagement_score: 75, hashtags_suggestion: [] }], best_practices: [] };
    } catch {
      parsedResult = { captions: [{ text: result.content, engagement_score: 75, hashtags_suggestion: [] }], best_practices: [] };
    }

    await db.aiUsageLog.create({
      data: {
        userId: user.userId,
        model: result.model,
        promptTokens: result.usage.prompt_tokens,
        completionTokens: result.usage.completion_tokens,
        totalTokens: result.usage.total_tokens,
        latencyMs: result.latencyMs,
        requestType: 'caption',
        input: JSON.stringify({ platform, tone, language }),
        output: JSON.stringify(parsedResult),
      },
    });

    logger.info(`Caption generated for ${user.email}, model: ${result.model}`);

    return createApiResponse(true, {
      ...parsedResult,
      model: result.model,
      usage: result.usage,
      latencyMs: result.latencyMs,
    });
  } catch (error) {
    logger.error('Caption generation error', error);
    const msg = error instanceof Error ? error.message : 'AI service error';
    return createApiResponse(false, undefined, msg, 500);
  }
}