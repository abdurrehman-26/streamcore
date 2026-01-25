import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'GetVideoManifestResponse' })
export class GetVideoManifestResponseDto {
  @ApiProperty({
    description: 'The .m3u8 manifest content as text',
    example: '#EXTM3U\n#EXT-X-VERSION:3\n...',
  })
  content: string;

  @ApiProperty({
    description: 'MIME type of the manifest',
    example: 'application/vnd.apple.mpegurl',
  })
  contentType: string;

  @ApiProperty({
    description: 'Filename of the manifest',
    example: 'video.m3u8',
  })
  filename: string;
}
