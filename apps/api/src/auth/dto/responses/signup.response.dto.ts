import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'SignupResponse' })
export class SignupResponseDto {
  @ApiProperty({ example: 'John Doe' })
  name: string;
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;
  @ApiProperty({ example: false })
  emailVerified: boolean;
}
