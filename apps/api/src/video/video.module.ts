import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { BullModule } from '@nestjs/bullmq';
import { MinioModule } from '@app/minio';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VideoMetadata,
  VideoMetadataSchema,
} from '../schemas/video-metadata.schema';
import { VideoService } from './video.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoMetadata.name, schema: VideoMetadataSchema },
    ]),
    BullModule.registerQueue({
      name: 'videoProcessing',
    }),
    MinioModule,
  ],
  providers: [VideoService],
  controllers: [VideoController],
})
export class VideoModule {}
