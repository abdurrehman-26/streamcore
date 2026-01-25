import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Module({
  providers: [
    {
      provide: 'MINIO_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Minio.Client({
          endPoint: config.get<string>('MINIO_ENDPOINT') || 'localhost',
          port: config.get<number>('MINIO_PORT'),
          useSSL: config.get<string>('MINIO_USE_SSL') === 'true',
          accessKey: config.get<string>('MINIO_ACCESS_KEY'),
          secretKey: config.get<string>('MINIO_SECRET_KEY'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['MINIO_CLIENT'],
})
export class MinioModule {}
