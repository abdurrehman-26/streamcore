import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(name: string, email: string, password: string) {
    const userExists = await this.usersService.findUserByEmail(email);
    if (userExists) {
      throw new UnauthorizedException('User with this email already exists.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return this.usersService.createUser(name, email, passwordHash);
  }

  async logIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    const isPasswordMatching = await bcrypt.compare(
      password,
      user.passwordHash,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException();
    }
    if (!isPasswordMatching) {
      throw new UnauthorizedException();
    }
    const payload = { userId: user._id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
