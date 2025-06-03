import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.encryptionKey = Buffer.from(key, 'base64');
  }

  /**
   * Encrypt sensitive healthcare data
   */
  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('healthcare-data', 'utf8'));

    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  }

  /**
   * Decrypt sensitive healthcare data
   */
  decrypt(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
  }): string {
    const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
    decipher.setAAD(Buffer.from('healthcare-data', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));

    let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash PHI for indexing while maintaining privacy
   */
  hashPhi(phi: string): string {
    return crypto
      .createHmac('sha256', this.encryptionKey)
      .update(phi)
      .digest('hex');
  }

  /**
   * Generate secure device certificate
   */
  generateDeviceCertificate(deviceId: string): {
    certificate: string;
    privateKey: string;
  } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    const certificate = this.signDeviceCertificate(deviceId, publicKey);

    return { certificate, privateKey };
  }

  private signDeviceCertificate(deviceId: string, publicKey: string): string {
    const certificateData = {
      deviceId,
      publicKey,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const signature = crypto
      .createSign('RSA-SHA256')
      .update(JSON.stringify(certificateData))
      .sign(this.encryptionKey, 'base64');

    return Buffer.from(
      JSON.stringify({ ...certificateData, signature }),
    ).toString('base64');
  }
}
