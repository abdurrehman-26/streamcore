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
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

type User = {
  id: string;
  email?: string;
};

interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private verificationService: EmailVerificationService,
  ) {}

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

  @Post('request-email-verification')
  async requestVerification(@Body() dto: RequestVerificationDto) {
    const code = await this.verificationService.requestCode(dto.email);
    return { message: 'Verification code sent', debugCode: code }; // remove debugCode in prod
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.verificationService.verifyCode(dto.email, dto.code);
    return { message: 'Email verified successfully' };
  }
}
