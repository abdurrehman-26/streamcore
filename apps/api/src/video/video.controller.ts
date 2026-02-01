import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import * as Minio from 'minio';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PresignedUrlResponseDto } from './dto/responses/generate-presigned-upload.response';
import { WebhookResponseDto } from './dto/responses/webhook.response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { VideoMetadata } from '../schemas/video-metadata.schema';
import { Model } from 'mongoose';

@ApiTags('Video')
@Controller('video')
export class VideoController {
  constructor(
    @InjectQueue('videoProcessing') private videoQueue: Queue,
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    @InjectModel(VideoMetadata.name)
    private videoMetadataModel: Model<VideoMetadata>,
  ) {}
  @ApiOperation({
    summary: 'Generate Video Upload URL',
    description:
      'Generates a presigned URL for uploading a video file to the storage bucket.',
  })
  @ApiCreatedResponse({
    description: 'Presigned URL generated successfully',
    type: PresignedUrlResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('generate-upload-url')
  async generateUploadUrl() {
    const videoId = Date.now();
    await this.videoMetadataModel.create({
      videoId,
      status: 'uploading',
    });
    const presignedUrl = await this.minioClient.presignedPutObject(
      'streamcore',
      `raw/video_${Date.now()}.mp4`,
    );
    return { message: 'video upload url generated', url: presignedUrl };
  }

  @ApiOperation({
    summary: 'Get Video Manifest',
    description:
      'Retrieves the HLS manifest for a processed video, replacing segment URLs with presigned URLs for secure access.',
  })
  @ApiOkResponse({
    description: 'HLS Manifest retrieved successfully',
    content: {
      'application/vnd.apple.mpegurl': {
        schema: {
          type: 'string',
          example: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:10.0,
https://example.com/segment0.ts
#EXTINF:10.0,
https://example.com/segment1.ts
#EXT-X-ENDLIST`,
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getVideo(@Param('id') id: string, @Res() res: Response) {
    const bucket = 'streamcore';
    const folder = `processed/${id}`;
    const manifestKey = `${folder}/index.m3u8`;

    try {
      const stream = await this.minioClient.getObject(bucket, manifestKey);

      let manifest = '';

      stream.on('data', (chunk: Buffer) => {
        manifest += chunk.toString();
      });
      const handleStreamEnd = async () => {
        // Split manifest into lines
        const lines = manifest.split('\n');

        // Replace .ts lines with presigned URLs
        const updatedLines = await Promise.all(
          lines.map(async (line) => {
            if (line.trim().endsWith('.ts')) {
              const segmentKey = `${folder}/${line.trim()}`;

              // 10-minute expiry
              const url = await this.minioClient.presignedGetObject(
                bucket,
                segmentKey,
                600,
              );
              return url;
            }
            return line;
          }),
        );

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.send(updatedLines.join('\n'));
      };
      stream.on('end', () => {
        handleStreamEnd().catch((err) => {
          console.error('Error processing manifest', err);
        });
      });
      stream.on('error', (err) => {
        console.error('MinIO stream error', err);
        res.status(500).send('Error reading file');
      });
    } catch (err) {
      console.error('MinIO error', err);
      res.status(404).send('File not found');
    }
  }
  @ApiOperation({
    summary: 'Handle Video Processing Webhook',
    description:
      'Receives webhook notifications for video processing and enqueues them for further processing.',
  })
  @ApiOkResponse({
    description: 'Webhook received successfully',
    type: WebhookResponseDto,
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('webhook')
  async handleWebhook(@Body() body: unknown) {
    await this.videoQueue.add('process', body);
    return { message: 'webhook received' };
  }
}
