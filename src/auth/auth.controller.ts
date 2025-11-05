import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SignInDTO } from '../auth/dto/signin-dto';
import { SignUpDTO } from './dto/signup-dto';

type User = {
  id: string;
  email?: string;
};

interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDTO) {
    return await this.authService.signUp(
      signUpDto.name,
      signUpDto.email,
      signUpDto.password,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: SignInDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginData = await this.authService.logIn(
      signInDto.email,
      signInDto.password,
    );
    res.cookie('access_token', loginData.access_token, { httpOnly: true });
    return loginData;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }
}
