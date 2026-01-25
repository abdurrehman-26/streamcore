import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignInDTO {
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(6, {
    message:
      'Password is too short. Minimum length is $constraint1 characters.',
  })
  password: string;
}
