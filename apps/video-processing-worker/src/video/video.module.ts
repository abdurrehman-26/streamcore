import { Module } from '@nestjs/common';
import { VideoProcessor } from './video.processor';
import { VideoService } from './video.service';
import { FFmpegModule } from '../ffmpeg/ffmpeg.module';

@Module({
  imports: [FFmpegModule],
  providers: [VideoProcessor, VideoService],
})
export class VideoModule {}
