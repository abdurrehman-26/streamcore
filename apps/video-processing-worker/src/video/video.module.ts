import { Module } from '@nestjs/common';
import { VideoProcessor } from './video.processor';
import { VideoService } from './video.service';
import { FFmpegModule } from '../ffmpeg/ffmpeg.module';
import { MinioModule } from '@app/minio';

@Module({
  imports: [FFmpegModule, MinioModule],
  providers: [VideoProcessor, VideoService],
})
export class VideoModule {}
