import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

interface UserRequest extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private setCookies(
    res: Response,
    access_token: string,
    refresh_token: string,
    rememberMe: boolean = false,
  ) {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto);
    this.setCookies(res, result.access_token, result.refresh_token, false);
    return { user: result.user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    this.setCookies(
      res,
      result.access_token,
      result.refresh_token,
      loginDto.rememberMe,
    );
    return { user: result.user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: UserRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.id);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED);
      return { message: 'Refresh token not found' };
    }
    try {
      const result = await this.authService.refreshTokens(refreshToken);
      this.setCookies(res, result.access_token, result.refresh_token, true); // Keep alive?
      return { message: 'Tokens refreshed' };
    } catch (error) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.status(HttpStatus.UNAUTHORIZED);
      return { message: 'Invalid refresh token' };
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req as any);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    this.setCookies(res, result.access_token, result.refresh_token, true);

    // Redirect to frontend dashboard or a success page that doesn't need token in URL
    res.redirect(`${frontendUrl}/dashboard`);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: UserRequest) {
    const {
      password,
      resetPasswordToken,
      resetPasswordExpires,
      refreshToken,
      ...user
    } = req.user as any;
    return user;
  }
}
