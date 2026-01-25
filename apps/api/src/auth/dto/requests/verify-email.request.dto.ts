import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

@ApiSchema({ name: 'VerifyEmailRequest' })
export class VerifyEmailDto {
  @ApiProperty({
    description: 'User email address to verify',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Verification code',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  code: string;
}
