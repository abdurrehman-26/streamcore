import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VideoService } from './video.service';
import { Logger } from '@nestjs/common';
import { S3Event } from 'aws-lambda';

@Processor('videoProcessing')
export class VideoProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoProcessor.name);
  constructor(private readonly videoService: VideoService) {
    super();
  }
  async process(job: Job<S3Event, any, string>): Promise<any> {
    try {
      // Call service that does actual processing
      await this.videoService.processVideo(
        job.data.Records[0].s3.bucket.name,
        job.data.Records[0].s3.object.key,
      );

      this.logger.log(`✅ Job ${job.id} completed`);
    } catch (err) {
      this.logger.error(`❌ Job ${job.id} failed`, err);
      throw err; // Bullmq will automatically retry based on job options
    }
    return {};
  }
}
