import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'PresignedUrlResponse' })
export class PresignedUrlResponseDto {
  @ApiProperty({ example: 'video upload url generated' })
  message: string;

  @ApiProperty({
    example:
      'https://minio.example.com/streamcore/raw/video_1627891234567.mp4?...',
  })
  url: string;
}
