import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'UpdateVideoResponse' })
export class UpdateVideoResponseDto {
  @ApiProperty({ example: 'mG0Rqrgb9Cjd' })
  videoId: string;

  @ApiProperty({ example: 'ready' })
  status: string;

  @ApiProperty({ example: '2026-02-15T06:37:59.831Z' })
  createdAt: string;

  @ApiProperty({ example: 'What a banger!' })
  title: string;

  @ApiProperty({ example: 'Just dive deep and find your way, it is so easy!' })
  description: string;
}
