import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'VerifyEmailResponse' })
export class VerifyEmailResponseDto {
  @ApiProperty({
    description: 'Message indicating the result of the email verification',
    example: 'Email verified successfully.',
  })
  message: string;
}
