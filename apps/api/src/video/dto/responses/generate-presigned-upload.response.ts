import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'PresignedUrlResponse' })
export class PresignedUrlResponseDto {
  @ApiProperty({
    example:
      'https://s3.example.com/streamcore/raw/video_1627891234567.mp4?...',
  })
  url: string;
}
