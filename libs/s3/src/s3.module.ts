import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'apps/api/src/types/env';

@Module({
  providers: [
    {
      provide: 'S3_CLIENT',
      useFactory: (config: ConfigService<EnvironmentVariables>) => {
        return new S3Client({
          region: 'auto',
          endpoint: config.get<string>('S3_ENDPOINT'),
          forcePathStyle: true,
          credentials: {
            accessKeyId: config.get<string>('S3_ACCESS_KEY') || '',
            secretAccessKey: config.get<string>('S3_SECRET_KEY') || '',
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['S3_CLIENT'],
})
export class S3Module {}
