import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';

@Injectable()
export class MfaService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateMfaSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'HealthChain', secret);

    user.mfaSecret = secret;
    await this.userRepository.save(user);

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  async verifyMfaToken(user: User, token: string): Promise<boolean> {
    if (!user.mfaSecret) {
      return false;
    }

    return authenticator.verify({
      token,
      secret: user.mfaSecret,
    });
  }

  async enableMfa(user: User, token: string): Promise<boolean> {
    const isValid = await this.verifyMfaToken(user, token);

    if (isValid) {
      user.isMfaEnabled = true;
      await this.userRepository.save(user);
      return true;
    }

    return false;
  }

  async disableMfa(user: User): Promise<void> {
    user.isMfaEnabled = false;
    user.mfaSecret = '';
    await this.userRepository.save(user);
  }
}
