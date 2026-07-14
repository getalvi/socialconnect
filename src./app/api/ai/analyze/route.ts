import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { openRouter } from '@/lib/openrouter';
import { logger } from '@/lib/logger';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const { mediaId, model } = body;

    if (!mediaId) return createApiResponse(false, undefined, 'mediaId is required', 400);

    const media = await db.media.findFirst({ where: { id: mediaId, userId: user.userId } });
    if (!media) return createApiResponse(false, undefined, 'Media not found', 404);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const imageUrl = `${appUrl}${media.url}`;

    const prompt = `Analyze this image in detail for social media marketing purposes.
Return a JSON object with this exact structure:
{
  "objects": ["detected object 1", "detected object 2"],
  "scene": "scene description",
  "mood": "overall mood/atmosphere",
  "color_palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "suggested_platforms": ["instagram", "pinterest"],
  "target_audience": "description of ideal audience",
  "content_suggestions": ["content idea 1", "content idea 2", "content idea 3"],
  "product_type": "product category if applicable",
  "quality_score": 8,
  "composition": "description of composition and framing"
}`;

    const result = await openRouter.vision(prompt, imageUrl, model);

    let parsedResult;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { description: result.content };
    } catch {
      parsedResult = { description: result.content };
    }

    await db.media.update({
      where: { id: mediaId },
      data: { analysisResult: JSON.stringify(parsedResult) },
    });

    await db.aiUsageLog.create({
      data: {
        userId: user.userId, model: result.model,
        promptTokens: result.usage.prompt_tokens, completionTokens: result.usage.completion_tokens,
        totalTokens: result.usage.total_tokens, latencyMs: result.latencyMs,
        requestType: 'analyze', input: JSON.stringify({ mediaId }),
        output: JSON.stringify(parsedResult),
      },
    });

    logger.info(`Image analyzed: ${mediaId}`);

    return createApiResponse(true, {
      mediaId,
      analysis: parsedResult,
      model: result.model,
      usage: result.usage,
      latencyMs: result.latencyMs,
    });
  } catch (error) {
    logger.error('Image analysis error', error);
    return createApiResponse(false, undefined, error instanceof Error ? error.message : 'Analysis failed', 500);
  }
}