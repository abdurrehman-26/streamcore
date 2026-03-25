import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PresignedUrlResponseDto } from './dto/responses/generate-presigned-upload.response';
import { WebhookResponseDto } from './dto/responses/webhook.response.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  VideoMetadata,
  VideoMetadataDocument,
} from '../schemas/video-metadata.schema';
import { Model } from 'mongoose';
import { VideoService } from './video.service';
import { UpdateVideoResponseDto } from './dto/responses/update-video.response.dto';
import { UpdateVideoDto } from './dto/requests/update-video.request';
import { RequireBodyPipe } from 'shared/pipes/require-body.pipe';

@ApiTags('Video')
@Controller('videos')
export class VideoController {
  constructor(
    @InjectQueue('videoProcessing') private videoQueue: Queue,
    @InjectModel(VideoMetadata.name)
    private videoMetadataModel: Model<VideoMetadata>,
    private readonly videoservice: VideoService,
  ) {}

  @ApiOperation({
    summary: 'Get all videos',
    description: 'Retrieves metadata for all videos.',
  })
  @ApiOkResponse({
    description: 'Videos retrieved successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Get('all')
  getAllVideos(): Promise<VideoMetadataDocument[]> {
    return this.videoservice.getAllVideos();
  }

  @ApiOperation({
    summary: 'Create Video Upload URL',
    description:
      'Creates a presigned URL for uploading a video file to the storage bucket.',
  })
  @ApiCreatedResponse({
    description: 'Presigned URL created successfully',
    type: PresignedUrlResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('create-put-upload')
  async createUploadUrl() {
    return await this.videoservice.createPutVideoUpload();
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
