import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

@ApiSchema({ name: 'RequestVerificationRequest' })
export class RequestVerificationDto {
  @ApiProperty({
    description: 'User email address to request verification for',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
