import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { BullModule } from '@nestjs/bullmq';
import { MinioModule } from '@app/minio';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'videoProcessing',
    }),
    MinioModule,
  ],
  providers: [],
  controllers: [VideoController],
})
export class VideoModule {}
