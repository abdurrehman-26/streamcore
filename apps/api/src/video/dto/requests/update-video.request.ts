import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

@ApiSchema({ name: 'UpdateVideoDTO' })
export class UpdateVideoDto {
  @IsOptional()
  @IsString({ message: 'Title is Required' })
  @ApiProperty({ example: 'What a banger!' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description is Required' })
  @ApiProperty({ example: 'Just dive deep and find your way, it is so easy!' })
  description: string;
}
