import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpDTO {
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(6, {
    message:
      'Password is too short. Minimum length is $constraint1 characters.',
  })
  password: string;

  @IsNotEmpty({ message: 'Name should not be empty.' })
  name: string;
}
