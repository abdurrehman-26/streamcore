import { Module } from '@nestjs/common';
import { StreamingModule } from './streaming/streaming.module';

@Module({
  imports: [StreamingModule],
  controllers: [],
  providers: [],
})
export class StreamingServiceModule {}
