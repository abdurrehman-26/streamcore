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
import { S3Module } from '@app/s3';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoMetadata.name, schema: VideoMetadataSchema },
    ]),
    BullModule.registerQueue({
      name: 'videoProcessing',
    }),
    MinioModule,
    S3Module,
  ],
  providers: [VideoService],
  controllers: [VideoController],
})
export class VideoModule {}
