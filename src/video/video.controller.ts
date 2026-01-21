import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/types/env';

@Controller('video')
export class VideoController {
  private minioClient: Minio.Client;
  constructor(
    @InjectQueue('videoProcessing') private videoQueue: Queue,
    private configService: ConfigService<EnvironmentVariables>,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT') || 'localhost',
      port: this.configService.get('MINIO_PORT'),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
  }
  @HttpCode(HttpStatus.CREATED)
  @Post('upload')
  async uploadVideo() {
    const presignedUrl = await this.minioClient.presignedPutObject(
      'streamcore',
      `raw/video_${Date.now()}.mp4`,
    );
    return { message: 'video upload url generated', url: presignedUrl };
  }

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
  @Post('webhook')
  async handleWebhook(@Body() body: unknown) {
    await this.videoQueue.add('process', {
      name: 'videoProcessingJob',
      data: body,
    });
    return { message: 'webhook received', body };
  }
}
