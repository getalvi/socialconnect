import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, createApiResponse } from '@/lib/auth';
import { openRouter } from '@/lib/openrouter';
import { logger } from '@/lib/logger';
import sharp from 'sharp';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return createApiResponse(false, undefined, 'Unauthorized', 401);

    const body = await request.json();
    const { mediaId, enhancementType, brightness, contrast, sharpness, saturation } = body;

    if (!mediaId) return createApiResponse(false, undefined, 'mediaId is required', 400);

    const media = await db.media.findFirst({ where: { id: mediaId, userId: user.userId } });
    if (!media) return createApiResponse(false, undefined, 'Media not found', 404);

    const inputPath = path.join(process.cwd(), 'public', media.url);
    let image = sharp(inputPath);

    if (enhancementType === 'auto' || enhancementType === 'brightness') {
      const factor = brightness || 1.2;
      image = image.modulate({ brightness: factor });
    }
    if (enhancementType === 'auto' || enhancementType === 'contrast') {
      const factor = contrast || 1.2;
      image = image.linear(factor, -(128 * (factor - 1)));
    }
    if (enhancementType === 'sharpness') {
      image = image.sharpen({ sigma: sharpness || 1.5, m1: 1, m2: 2 });
    }
    if (enhancementType === 'auto' || enhancementType === 'saturation') {
      const factor = saturation || 1.2;
      image = image.modulate({ saturation: factor });
    }
    if (enhancementType === 'denoise') {
      image = image.median(3);
    }

    const ext = media.filename.split('.').pop() || 'jpg';
    const enhancedName = `enhanced-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const outputPath = path.join(UPLOAD_DIR, enhancedName);

    await image.toFile(outputPath);

    const enhancedMedia = await db.media.create({
      data: {
        userId: user.userId,
        filename: enhancedName,
        originalName: `enhanced_${media.originalName}`,
        mimeType: media.mimeType,
        size: 0,
        url: `/uploads/${enhancedName}`,
        isProcessed: true,
        metadata: JSON.stringify({ sourceMediaId: mediaId, enhancementType }),
      },
    });

    const stats = await sharp(outputPath).metadata();
    await db.media.update({
      where: { id: enhancedMedia.id },
      data: { width: stats.width, height: stats.height, size: (await import('fs')).statSync(outputPath).size },
    });

    await db.activityLog.create({
      data: { userId: user.userId, action: 'enhance_image', resource: 'media', resourceId: enhancedMedia.id, metadata: JSON.stringify({ type: enhancementType }) },
    });

    logger.info(`Image enhanced: ${enhancedMedia.id} type=${enhancementType}`);

    return createApiResponse(true, enhancedMedia);
  } catch (error) {
    logger.error('Image enhancement error', error);
    return createApiResponse(false, undefined, error instanceof Error ? error.message : 'Enhancement failed', 500);
  }
}