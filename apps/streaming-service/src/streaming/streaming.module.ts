import { Module } from '@nestjs/common';
import { MinioModule } from '@app/minio';
import { StreamingController } from './streaming.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MinioModule,
  ],
  controllers: [StreamingController],
  providers: [],
})
export class StreamingModule {}
