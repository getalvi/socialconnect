import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { openRouter } from '@/lib/openrouter';
import { trendRequestSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const parsed = trendRequestSchema.safeParse(body);
    if (!parsed.success) {
      return createApiResponse(false, undefined, parsed.error.errors.map(e => e.message).join(', '), 400);
    }

    const { query, platform, model } = parsed.data;

    const prompt = `Research current trends for: "${query}"
${platform ? `Platform focus: ${platform}` : 'All platforms'}

Return a JSON object:
{
  "trending_topics": [{"topic": "topic name", "growth": "rising|stable|declining", "relevance_score": 85}],
  "content_formats": [{"format": "Reels/Shorts/Carousels", "engagement": "high|medium|low", "description": "why it works"}],
  "best_posting_times": [{"day": "Monday", "times": ["9:00 AM", "12:00 PM", "6:00 PM"]}],
  "audience_insights": {"demographics": {"age_groups": ["18-24", "25-34"], "top_locations": ["US", "UK"]}, "interests": ["tech", "lifestyle"]},
  "recommended_actions": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"]
}`;

    const result = await openRouter.chat(
      [{ role: 'user', content: prompt }],
      { model: model || undefined, max_tokens: 3000 }
    );

    let parsedResult;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      parsedResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { trending_topics: [], content_formats: [], best_posting_times: [], audience_insights: {}, recommended_actions: [] };
    } catch {
      parsedResult = { trending_topics: [{ topic: query, growth: 'rising', relevance_score: 80 }], content_formats: [], best_posting_times: [], audience_insights: { demographics: {}, interests: [] }, recommended_actions: [] };
    }

    await db.trendResearch.create({
      data: {
        userId: user.userId, query, platform: platform || null,
        results: JSON.stringify(parsedResult), aiModel: result.model,
      },
    });

    await db.aiUsageLog.create({
      data: {
        userId: user.userId, model: result.model,
        promptTokens: result.usage.prompt_tokens, completionTokens: result.usage.completion_tokens,
        totalTokens: result.usage.total_tokens, latencyMs: result.latencyMs,
        requestType: 'trend', input: JSON.stringify({ query, platform }),
      },
    });

    return createApiResponse(true, { ...parsedResult, model: result.model, usage: result.usage, latencyMs: result.latencyMs });
  } catch (error) {
    logger.error('Trend research error', error);
    return createApiResponse(false, undefined, error instanceof Error ? error.message : 'AI service error', 500);
  }
}