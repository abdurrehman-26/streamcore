import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'RequestVerificationResponse' })
export class RequestVerificationResponseDto {
  @ApiProperty({
    description: 'Message indicating the result of the verification request',
    example: 'Verification email sent successfully.',
  })
  message: string;
}
