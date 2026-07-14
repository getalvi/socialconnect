import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { openRouter } from '@/lib/openrouter';
import { seoRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = seoRequestSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const { content, targetKeywords, model } = parsed.data;

    const prompt = `Generate SEO-optimized metadata for this content:
"${content}"
${targetKeywords.length ? `Target keywords: ${targetKeywords.join(', ')}` : ''}

Return a JSON object:
{
  "title": "SEO title (50-60 characters)",
  "meta_description": "Meta description (150-160 characters)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
  "readability_score": 75,
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]
}`;

    const result = await openRouter.chat(
      [{ role: 'user', content: prompt }],
      { model: model || undefined }
    );

    let parsedResult;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: '', meta_description: '', keywords: [], readability_score: 70, suggestions: [] };
    } catch {
      parsedResult = { title: content.substring(0, 60), meta_description: content.substring(0, 160), keywords: targetKeywords, readability_score: 70, suggestions: [] };
    }

    await db.aiUsageLog.create({
      data: {
        userId: user.userId, model: result.model,
        promptTokens: result.usage.prompt_tokens, completionTokens: result.usage.completion_tokens,
        totalTokens: result.usage.total_tokens, latencyMs: result.latencyMs,
        requestType: 'seo', input: JSON.stringify({ contentLength: content.length, targetKeywords }),
        output: JSON.stringify(parsedResult),
      },
    });

    return createApiResponse(true, { ...parsedResult, model: result.model, usage: result.usage, latencyMs: result.latencyMs });
  } catch (error) {
    logger.error('SEO generation error', error);
    return createApiResponse(false, undefined, error instanceof Error ? error.message : 'AI service error', 500);
  }
}