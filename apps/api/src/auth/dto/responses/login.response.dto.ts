import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'LoginResponse' })
export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTE5YWViNDYxZWIzZTg1YmM2NTk1N2YiLCJlbWFpbCI6ImFyMjUyMjAwNkBnbWFpbC5jb20iLCJpYXQiOjE3NjkzNTgzMjQsImV4cCI6MTc2OTM1ODM4NH0.5iQFgqU7QgWJiGXysuZ9O-bClpAPQHayw5rqmyJo9Ug',
  })
  access_token: string;
}
