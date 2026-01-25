import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'videoProcessing',
    }),
  ],
  providers: [],
  controllers: [VideoController],
})
export class VideoModule {}
