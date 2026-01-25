import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@ApiSchema({ name: 'LoginRequest' })
export class SignInDTO {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'strongpassword123',
  })
  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(6, {
    message:
      'Password is too short. Minimum length is $constraint1 characters.',
  })
  password: string;
}
