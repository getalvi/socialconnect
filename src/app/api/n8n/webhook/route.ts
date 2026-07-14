import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await db.webhookEvent.create({
      data: {
        source: body.source || 'n8n',
        eventType: body.eventType || 'unknown',
        payload: JSON.stringify(body),
        processed: false,
      },
    });

    if (body.eventType === 'publish_complete' && body.postId) {
      await db.post.update({
        where: { id: body.postId },
        data: {
          status: body.success ? 'published' : 'failed',
          publishedAt: body.success ? new Date() : undefined,
          failedReason: body.error || null,
          engagementData: JSON.stringify(body.result || {}),
        },
      });

      await db.schedule.updateMany({
        where: { postId: body.postId, status: 'processing' },
        data: { status: body.success ? 'completed' : 'failed', result: JSON.stringify(body.result), lastError: body.error || null, executedAt: new Date() },
      });
    }

    logger.info(`n8n webhook received: ${body.eventType}`);

    return Response.json({ success: true });
  } catch (error) {
    logger.error('n8n webhook error', error);
    return Response.json({ success: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}