import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'WebhookResponse' })
export class WebhookResponseDto {
  @ApiProperty({ example: 'Webhook received successfully' })
  message: string;
}
