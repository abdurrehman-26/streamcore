import { Inject, Injectable, Logger } from '@nestjs/common';
import { FFmpegService } from '../ffmpeg/ffmpeg.service';
import path from 'path';
import fs from 'fs';
import * as Minio from 'minio';
import { InjectModel } from '@nestjs/mongoose';
import { VideoMetadata } from 'apps/api/src/schemas/video-metadata.schema';
import { Model } from 'mongoose';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    private readonly ffmpegService: FFmpegService,
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    @InjectModel(VideoMetadata.name)
    private videoMetadataModel: Model<VideoMetadata>,
  ) {}

  async processVideo(bucket: string, objectKey: string): Promise<void> {
    const key = decodeURIComponent(objectKey);

    // Extract only file name without extension: video_123
    const videoId = path.basename(key, path.extname(key));

    // Temp directories
    const tempRoot = path.resolve(process.cwd(), '..', 'streamcore-temp-files');
    const inputPath = path.join(tempRoot, `${videoId}.mp4`);
    const outputFolder = path.join(tempRoot, 'output', videoId);

    await fs.promises.mkdir(outputFolder, { recursive: true });

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

    // Run FFmpeg -> Generate HLS
    await this.ffmpegService.transcodeToHLS(
      inputPath,
      outputFolder,
      '1920*1080',
    );

    this.logger.log('Uploading processed video to MinIO...');

    // Upload all files in the outputFolder
    const files = fs.readdirSync(outputFolder);

    for (const f of files) {
      const localFile = path.join(outputFolder, f);
      const remoteKey = `videos/${videoId}/${f}`;

      await this.minioClient.fPutObject(bucket, remoteKey, localFile);
      this.logger.log('Uploaded:', remoteKey);
    }

    await this.videoMetadataModel.findOneAndUpdate(
      { videoId },
      {
        status: 'ready',
      },
    );

    this.logger.log('Processing complete:', videoId);
  }
}
