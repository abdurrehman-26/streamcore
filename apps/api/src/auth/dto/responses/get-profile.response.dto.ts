import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'GetProfileResponse' })
export class GetProfileResponseDto {
  @ApiProperty({ example: '6919aeb461eb3e85bc65957f' })
  userId: string;
  @ApiProperty({ example: 'John Doe' })
  name: string;
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;
  @ApiProperty({ example: false })
  emailVerified: boolean;
}
