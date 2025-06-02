import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as argon2 from 'argon2';
import { MfaService } from './mfa.service';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable()
export class AuthService {
  private readonly logger: winston.Logger;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly PASSWORD_HISTORY_SIZE = 5;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mfaService: MfaService,
    private readonly configService: ConfigService,
  ) {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [new winston.transports.File({ filename: 'logs/auth.log' })],
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      this.logger.warn(`Failed login attempt for non-existent user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isLocked && user.lockoutUntil && user.lockoutUntil > new Date()) {
      this.logger.warn(`Attempted login to locked account: ${email}`);
      throw new UnauthorizedException(
        'Account is locked. Please try again later.',
      );
    }

    try {
      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        await this.handleFailedLogin(user);
        throw new UnauthorizedException('Invalid credentials');
      }

      user.loginAttempts = 0;
      user.lastLogin = new Date();
      await this.userRepository.save(user);

      this.logger.info(`Successful login for user: ${email}`);
      return user;
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`);
      throw new UnauthorizedException(
        'An error occurred during authentication',
      );
    }
  }

  private async handleFailedLogin(user: User): Promise<void> {
    user.loginAttempts += 1;
    user.lastLoginAttempt = new Date();

    if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      user.isLocked = true;
      user.lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
      this.logger.warn(`Account locked for user: ${user.email}`);
    }

    await this.userRepository.save(user);
  }

  async login(user: User) {
    if (user.requiresPasswordChange) {
      throw new BadRequestException('Password change required before login');
    }

    if (user.isMfaEnabled) {
      return {
        requiresMfa: true,
        tempToken: this.jwtService.sign(
          { email: user.email, isMfaAuthenticated: false },
          { expiresIn: '5m' },
        ),
      };
    }

    return this.generateAuthToken(user);
  }

  private async generateAuthToken(user: User) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      isMfaAuthenticated: user.isMfaEnabled ? true : undefined,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validatePassword(password: string): Promise<boolean> {
    if (password.length < 12) return false;

    if (!/[A-Z]/.test(password)) return false;

    if (!/[a-z]/.test(password)) return false;

    if (!/[0-9]/.test(password)) return false;

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

    return true;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await argon2.verify(
      user.password,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (!(await this.validatePassword(newPassword))) {
      throw new BadRequestException(
        'New password does not meet security requirements',
      );
    }

    const passwordHistory = user.passwordHistory
      ? JSON.parse(user.passwordHistory)
      : [];
    for (const oldPassword of passwordHistory) {
      if (await argon2.verify(oldPassword, newPassword)) {
        throw new BadRequestException(
          'New password cannot be the same as any of your last 5 passwords',
        );
      }
    }

    const hashedPassword = await argon2.hash(newPassword);

    passwordHistory.push(user.password);
    if (passwordHistory.length > this.PASSWORD_HISTORY_SIZE) {
      passwordHistory.shift();
    }

    user.password = hashedPassword;
    user.passwordHistory = JSON.stringify(passwordHistory);
    user.lastPasswordChange = new Date();
    user.requiresPasswordChange = false;

    await this.userRepository.save(user);
    this.logger.info(`Password changed successfully for user: ${user.email}`);
  }
}
