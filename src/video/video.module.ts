import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';

@Module({
  providers: [],
  controllers: [VideoController],
})
export class VideoModule {}
