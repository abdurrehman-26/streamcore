import { Inject, Injectable, Logger } from '@nestjs/common';
import { FFmpegService } from '../ffmpeg/ffmpeg.service';
import path from 'path';
import fs from 'fs';
import * as Minio from 'minio';
import { InjectModel } from '@nestjs/mongoose';
import { VideoMetadata } from 'apps/api/src/schemas/video-metadata.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'apps/api/src/types/env';

interface FFprobeStream {
  width: number;
  height: number;
}

interface FFprobeResult {
  programs: unknown[];
  stream_groups: unknown[];
  streams: FFprobeStream[];
}

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    private readonly ffmpegService: FFmpegService,
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    @InjectModel(VideoMetadata.name)
    private videoMetadataModel: Model<VideoMetadata>,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  async processVideo(bucket: string, objectKey: string): Promise<void> {
    const key = decodeURIComponent(objectKey);

    // Extract only file name without extension: video_123
    const videoId = path.basename(key, path.extname(key));

    // Temp directories
    const tempRoot = path.resolve(process.cwd(), '..', 'streamcore-temp-files');
    const inputPath = path.join(tempRoot, `${videoId}.mp4`);
    const outputFolder = path.join(tempRoot, 'output', videoId);

    // Download raw video to inputPath
    await this.minioClient.fGetObject(bucket, key, inputPath);

    await this.videoMetadataModel.findOneAndUpdate(
      {
        videoId,
      },
      {
        status: 'processing',
      },
    );

    const videoResolution = await this.ffmpegService.getResolution(inputPath);

    const parsedResolutionObject = (
      JSON.parse(videoResolution) as FFprobeResult
    ).streams[0];

    const orientation =
      parsedResolutionObject.height > parsedResolutionObject.width
        ? 'portrait'
        : parsedResolutionObject.width > parsedResolutionObject.height
          ? 'landscape'
          : 'square';

    const landscapeLadder = [
      { name: '1080p', width: 1920, height: 1080 },
      { name: '720p', width: 1280, height: 720 },
      { name: '480p', width: 854, height: 480 },
      { name: '360p', width: 640, height: 360 },
    ];

    const portraitLadder = [
      { name: '1080p', width: 1080, height: 1920 },
      { name: '720p', width: 720, height: 1280 },
      { name: '480p', width: 480, height: 854 },
      { name: '360p', width: 360, height: 640 },
    ];

    const ladder =
      orientation === 'portrait' ? portraitLadder : landscapeLadder;

    const availableVariants = ladder.filter(
      (v) =>
        v.width <= parsedResolutionObject.width &&
        v.height <= parsedResolutionObject.height,
    );

    // Run FFmpeg -> Generate HLS
    await Promise.all(
      availableVariants.map(async (variant) => {
        await fs.promises.mkdir(path.join(outputFolder, variant.name), {
          recursive: true,
        });
        console.log(variant);
        await this.ffmpegService.transcodeToHLS(
          inputPath,
          path.join(outputFolder, variant.name),
          `${variant.width}x${variant.height}`,
        );
        this.logger.log('Uploading processed video to MinIO...');

        // Upload processed files
        const files = fs.readdirSync(path.join(outputFolder, variant.name));

        for (const f of files) {
          const localFile = path.join(outputFolder, variant.name, f);
          const remoteKey = `videos/${videoId}/${variant.name}/${f}`;

          await this.minioClient.fPutObject(bucket, remoteKey, localFile);
          this.logger.log('Uploaded:', remoteKey);
        }
      }),
    );

    const masterLines = ['#EXTM3U'];

    // Bandwidth estimation based on resolution
    const estimateBandwidth = (w: number, h: number) => {
      const pixels = w * h;
      if (pixels >= 1920 * 1080) return 5000000;
      if (pixels >= 1280 * 720) return 2800000;
      if (pixels >= 854 * 480) return 1400000;
      return 800000;
    };

    for (const variant of availableVariants) {
      const bandwidth = estimateBandwidth(variant.width, variant.height);

      masterLines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${variant.width}x${variant.height}`,
      );
      masterLines.push(`${variant.name}/index.m3u8`);
    }

    const masterContent = masterLines.join('\n');

    const masterPath = path.join(outputFolder, 'master.m3u8');
    await fs.promises.writeFile(masterPath, masterContent);

    // Upload to MinIO
    await this.minioClient.fPutObject(
      bucket,
      `videos/${videoId}/master.m3u8`,
      masterPath,
    );

    this.logger.log('Uploaded master.m3u8');

    await this.videoMetadataModel.findOneAndUpdate(
      { videoId },
      {
        status: 'ready',
        manifestURL: `${this.configService.get('STREAMING_SERVICE_URL')}:${this.configService.get('STREAMING_SERVICE_PORT')}/video/${videoId}/master.m3u8`,
      },
    );

    this.logger.log('Processing complete:', videoId);
  }
}
