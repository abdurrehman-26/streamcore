import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { VideoModule } from './video/video.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'videoProcessing',
    }),
    VideoModule,
  ],
})
export class AppModule {}
