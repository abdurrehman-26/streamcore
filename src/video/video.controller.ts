import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';

@Controller('video')
export class VideoController {
  // Video-related endpoints will be defined here
  @HttpCode(HttpStatus.CREATED)
  @Post('create_video')
  signUp() {
    return { message: 'working' };
  }
  @Post('upload_video')
  uploadVideo() {
    return { message: 'video uploaded successfully' };
  }
  @Get('get_all_videos')
  getAllVideos() {
    return { message: 'all videos' };
  }
  @Get('get_video_by_id/:id')
  getVideoById(@Param('id') id: string) {
    return { message: `video by id: ${id}` };
  }
}
