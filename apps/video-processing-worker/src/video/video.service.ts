import { Inject, Injectable, Logger } from '@nestjs/common';
import { FFmpegService } from '../ffmpeg/ffmpeg.service';
import path from 'path';
import fs from 'fs';
import * as Minio from 'minio';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  constructor(
    private readonly ffmpegService: FFmpegService,
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
  ) {}

  async processVideo(bucket: string, objectKey: string): Promise<void> {
    const key = decodeURIComponent(objectKey);

    // Extract only file name without extension: video_123
    const fileName = path.basename(key, path.extname(key));

    // Temp directories
    const tempRoot = path.resolve(process.cwd(), '..', 'streamcore-temp-files');
    const inputPath = path.join(tempRoot, `${fileName}.mp4`);
    const outputFolder = path.join(tempRoot, 'output', fileName);

    await fs.promises.mkdir(outputFolder, { recursive: true });

    // Download raw video to inputPath
    await this.minioClient.fGetObject(bucket, key, inputPath);

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
      const remoteKey = `processed/${fileName}/${f}`;

      await this.minioClient.fPutObject(bucket, remoteKey, localFile);
      this.logger.log('Uploaded:', remoteKey);
    }

    this.logger.log('Processing complete:', fileName);
  }
}
