import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { VideoModule } from './video/video.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'videoProcessing',
    }),
    VideoModule,
  ],
})
export class AppModule {}
