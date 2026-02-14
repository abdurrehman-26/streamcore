import { Controller, Get, Header, Inject, Param, Res } from '@nestjs/common';
import * as Minio from 'minio';
import type { Response } from 'express';

@Controller('video')
export class StreamingController {
  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
  ) {}

  @Get(':id/master.m3u8')
  @Header('Content-Type', 'application/vnd.apple.mpegurl')
  async getmastermanifest(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const datastream = await this.minioClient.getObject(
      'streamcore',
      `videos/${id}/master.m3u8`,
    );
    datastream.pipe(res);
  }

  @Get(':id/:stream_quality/index.m3u8')
  @Header('Content-Type', 'application/vnd.apple.mpegurl')
  async getmanifest(
    @Param('stream_quality') stream_quality: string,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const datastream = await this.minioClient.getObject(
      'streamcore',
      `videos/${id}/${stream_quality}/index.m3u8`,
    );
    datastream.pipe(res);
  }

  @Get(':id/:stream_quality/:segment.ts')
  async getVideoSegment(
    @Param('stream_quality') stream_quality: string,
    @Param('id') id: string,
    @Param('segment') segment: string,
    @Res() res: Response,
  ): Promise<void> {
    const datastream = await this.minioClient.getObject(
      'streamcore',
      `videos/${id}/${stream_quality}/${segment}.ts`,
    );
    datastream.pipe(res);
  }
}
