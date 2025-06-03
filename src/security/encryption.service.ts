import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly algorithm: string;
  private readonly key: string;
  private readonly phiKey: string;

  constructor(private configService: ConfigService) {
    this.algorithm = this.configService.get(
      'ENCRYPTION_ALGORITHM',
      'aes-256-gcm',
    );
    this.key = this.configService.get<string>('FIELD_ENCRYPTION_KEY') || '';
    this.phiKey = this.configService.get<string>('PHI_ENCRYPTION_KEY') || '';

    if (!this.key || !this.phiKey) {
      throw new Error(
        'Encryption keys must be configured for HIPAA compliance',
      );
    }

    if (this.key.length !== 32 || this.phiKey.length !== 32) {
      throw new Error(
        'Encryption keys must be exactly 32 characters for AES-256',
      );
    }
  }

  /**
   * Encrypt PHI (Protected Health Information) data
   * Uses stronger encryption and separate key for PHI
   */
  encryptPHI(data: string): string {
    if (!data) return data;

    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.phiKey).toString();
      return `PHI:${encrypted}`;
    } catch (error) {
      throw new Error(`PHI encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt PHI data
   */
  decryptPHI(encryptedData: string): string {
    if (!encryptedData || !encryptedData.startsWith('PHI:')) {
      return encryptedData;
    }

    try {
      const encrypted = encryptedData.substring(4); // Remove 'PHI:' prefix
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.phiKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(`PHI decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt general sensitive data using modern crypto methods
   */
  encrypt(data: string): string {
    if (!data) return data;

    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        'aes-256-gcm',
        Buffer.from(this.key, 'hex'),
        iv,
      );

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt general sensitive data using modern crypto methods
   */
  decrypt(encryptedData: string): string {
    if (!encryptedData || encryptedData.startsWith('PHI:')) {
      return encryptedData;
    }

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        return encryptedData; // Return as-is if not encrypted format
      }

      const [ivHex, authTagHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(this.key, 'hex'),
        iv,
      );
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Hash sensitive data for indexing (one-way)
   */
  hashForIndex(data: string): string {
    if (!data) return data;

    return crypto.createHmac('sha256', this.key).update(data).digest('hex');
  }

  /**
   * Generate secure random key
   */
  generateSecureKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }

  /**
   * Validate encryption key strength
   */
  validateKeyStrength(key: string): boolean {
    return !!(
      key &&
      key.length >= 32 &&
      /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(key)
    );
  }
}
