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
import { SignInDTO } from './dto/requests/login.request.dto';
import { SignUpDTO } from './dto/requests/signup.request.dto';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { RequestVerificationDto } from './dto//requests/request-verification.request.dto';
import { VerifyEmailDto } from './dto/requests/verify-email.request.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SignupResponseDto } from './dto/responses/signup.response.dto';
import { LoginResponseDto } from './dto/responses/login.response.dto';
import { GetProfileResponseDto } from './dto/responses/get-profile.response.dto';
import { RequestVerificationResponseDto } from './dto/responses/request-verification.response.dto';
import { VerifyEmailResponseDto } from './dto/responses/verify-email.response.dto';

type User = {
  id: string;
  email?: string;
};

interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private verificationService: EmailVerificationService,
  ) {}

  @ApiOperation({
    summary: 'User Signup',
    description:
      'Register a new user. Email address and password are required. Returns user profile information upon successful registration.',
  })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: SignupResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDTO) {
    return await this.authService.signUp(
      signUpDto.name,
      signUpDto.email,
      signUpDto.password,
    );
  }

  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate a user and initiate a session. Requires email and password. Returns an access token upon successful authentication.',
  })
  @ApiOkResponse({
    description: 'User signed in successfully',
    type: LoginResponseDto,
  })
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

  @ApiOperation({
    summary: 'Get User Profile',
    description:
      'Retrieve the profile information of the authenticated user. Requires a valid access token.',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: GetProfileResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @ApiOperation({
    summary: 'Request Email Verification',
    description:
      'Request a verification code to be sent to the specified email address.',
  })
  @ApiOkResponse({
    description: 'Verification code sent successfully',
    type: RequestVerificationResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('request-email-verification')
  async requestVerification(@Body() dto: RequestVerificationDto) {
    const code = await this.verificationService.requestCode(dto.email);
    return { message: 'Verification code sent', debugCode: code }; // remove debugCode in prod
  }

  @ApiOperation({
    summary: 'Verify Email Address',
    description:
      'Verify the email address using the provided verification code.',
  })
  @ApiOkResponse({
    description: 'Email verified successfully',
    type: VerifyEmailResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.verificationService.verifyCode(dto.email, dto.code);
    return { message: 'Email verified successfully' };
  }
}
