import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

interface GoogleUser {
  email: string;
  name: string;
  googleId: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      emailVerified: false,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user, false);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      throw new UnauthorizedException(
        'Please login with Google or reset your password',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user, loginDto.rememberMe);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async googleLogin(req: { user: GoogleUser }) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    const { email, name, googleId } = req.user;

    // Find or create user
    let user = await this.userRepository.findOne({
      where: [{ email }, { googleId }],
    });

    if (!user) {
      // Create new user with Google account
      user = this.userRepository.create({
        email,
        name,
        googleId,
        emailVerified: true,
      });
      await this.userRepository.save(user);
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.emailVerified = true;
      await this.userRepository.save(user);
    }

    const tokens = await this.generateTokens(user, true);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists or not
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiration to 1 hour from now
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

    await this.userRepository.save(user);

    // Send email
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password?token=${resetToken}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to: user.email,
        subject: 'Password Reset Request - Job Tracker',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your Job Tracker account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new BadRequestException('Error sending reset email');
    }

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
      },
    });

    if (!user || !user.resetPasswordExpires) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired
    if (user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return { message: 'Password reset successful' };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async generateTokens(user: User, rememberMe: boolean = false) {
    const payload = { sub: user.id, email: user.email };
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // access token expires in 15 mins for tighter security
    const access_token = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: '15m',
    });

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || jwtSecret;
    const refresh_token = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: rememberMe ? '30d' : '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    user.refreshToken = hashedRefreshToken;
    await this.userRepository.save(user);

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') || jwtSecret;
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access Denied');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access Denied');
      }

      // If they had a long-lived refresh token, preserve `rememberMe` status roughly by issuing a new 30d one?
      // For simplicity, we can default to 7d, assuming user should log in again after a week if they didn't explicitly rememberMe on fresh login
      return await this.generateTokens(user, false);
    } catch (e) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
  }

  async logout(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = null;
      await this.userRepository.save(user);
    }
  }
}
