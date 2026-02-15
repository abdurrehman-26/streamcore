import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import * as Minio from 'minio';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PresignedUrlResponseDto } from './dto/responses/generate-presigned-upload.response';
import { WebhookResponseDto } from './dto/responses/webhook.response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { VideoMetadata } from '../schemas/video-metadata.schema';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { VideoService } from './video.service';
import { UpdateVideoResponseDto } from './dto/responses/update-video.response.dto';
import { UpdateVideoDto } from './dto/requests/update-video.request';
import { RequireBodyPipe } from 'shared/pipes/require-body.pipe';

@ApiTags('Video')
@Controller('video')
export class VideoController {
  constructor(
    @InjectQueue('videoProcessing') private videoQueue: Queue,
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    @InjectModel(VideoMetadata.name)
    private videoMetadataModel: Model<VideoMetadata>,
    private readonly videoservice: VideoService,
  ) {}
  @ApiOperation({
    summary: 'Generate Video Upload URL',
    description:
      'Generates a presigned URL for uploading a video file to the storage bucket.',
  })
  @ApiCreatedResponse({
    description: 'Presigned URL generated successfully',
    type: PresignedUrlResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('generate-upload-url')
  async generateUploadUrl() {
    const videoId = nanoid(12);
    await this.videoMetadataModel.create({
      videoId,
      status: 'uploading',
    });
    const presignedUrl = await this.minioClient.presignedPutObject(
      'streamcore',
      `raw/${videoId}.mp4`,
    );
    return { message: 'video upload url generated', url: presignedUrl };
  }

  @ApiOperation({
    summary: 'Update video details',
    description:
      'This endpoint updates videodata. Requires updated video data in JSON format',
  })
  @ApiOkResponse({
    description: 'Video details updated successfully',
    type: UpdateVideoResponseDto,
  })
  @Patch(':id')
  async updateVideoData(
    @Param('id') id: string,
    @Body(new RequireBodyPipe()) videoData: UpdateVideoDto,
  ) {
    return this.videoservice.updateVideo(id, videoData);
  }

  @ApiOperation({
    summary: 'Get Video Manifest',
    description:
      'Retrieves the HLS manifest for a processed video, replacing segment URLs with presigned URLs for secure access.',
  })
  @ApiOkResponse({
    description: 'HLS Manifest retrieved successfully',
    content: {
      'application/vnd.apple.mpegurl': {
        schema: {
          type: 'string',
          example: `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:10.0,
https://example.com/segment0.ts
#EXTINF:10.0,
https://example.com/segment1.ts
#EXT-X-ENDLIST`,
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getVideo(@Param('id') id: string) {
    const videodata = await this.videoMetadataModel
      .findOne({
        videoId: id,
      })
      .select('-_id -__v -updatedAt');
    return videodata;
  }
  @ApiOperation({
    summary: 'Handle Video Processing Webhook',
    description:
      'Receives webhook notifications for video processing and enqueues them for further processing.',
  })
  @ApiOkResponse({
    description: 'Webhook received successfully',
    type: WebhookResponseDto,
  })
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('webhook')
  async handleWebhook(@Body() body: unknown) {
    await this.videoQueue.add('process', body);
    return { message: 'webhook received' };
  }
}
