import { Module } from '@nestjs/common';
import { VideoProcessor } from './video.processor';
import { VideoService } from './video.service';
import { FFmpegModule } from '../ffmpeg/ffmpeg.module';
import { MinioModule } from '@app/minio';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VideoMetadata,
  VideoMetadataSchema,
} from 'apps/api/src/schemas/video-metadata.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoMetadata.name, schema: VideoMetadataSchema },
    ]),
    FFmpegModule,
    MinioModule,
  ],
  providers: [VideoProcessor, VideoService],
})
export class VideoModule {}
