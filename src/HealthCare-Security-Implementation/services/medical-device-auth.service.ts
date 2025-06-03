import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalDevice } from '../entities/medical-device.entity';
import { EncryptionService } from './encryption.service';
import { AuditService } from './audit.service';
import * as crypto from 'crypto';

@Injectable()
export class MedicalDeviceAuthService {
  constructor(
    @InjectRepository(MedicalDevice)
    private deviceRepository: Repository<MedicalDevice>,
    private encryptionService: EncryptionService,
    private auditService: AuditService,
  ) {}

  async registerDevice(deviceData: {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    manufacturer: string;
    model: string;
    serialNumber?: string;
    associatedFacilityId: string;
  }): Promise<{
    device: MedicalDevice;
    certificate: string;
    privateKey: string;
  }> {
    const { certificate, privateKey } =
      this.encryptionService.generateDeviceCertificate(deviceData.deviceId);

    const device = this.deviceRepository.create({
      ...deviceData,
      certificateHash: crypto
        .createHash('sha256')
        .update(certificate)
        .digest('hex'),
      certificateExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    const savedDevice = await this.deviceRepository.save(device);

    await this.auditService.logAccess({
      userId: 'system',
      userRole: 'system',
      action: 'DEVICE_REGISTERED',
      resource: `device:${deviceData.deviceId}`,
      ipAddress: '127.0.0.1',
      details: `Medical device ${deviceData.deviceName} registered`,
      successful: true,
      deviceId: deviceData.deviceId,
    });

    return { device: savedDevice, certificate, privateKey };
  }

  async authenticateDevice(
    deviceId: string,
    certificate: string,
    signature: string,
    challenge: string,
  ): Promise<boolean> {
    const device = await this.deviceRepository.findOne({
      where: { deviceId, isActive: true },
    });

    if (!device) {
      await this.auditService.logAccess({
        userId: 'system',
        userRole: 'system',
        action: 'DEVICE_AUTH_FAILED',
        resource: `device:${deviceId}`,
        ipAddress: '127.0.0.1',
        details: 'Device not found or inactive',
        successful: false,
        deviceId,
        reason: 'Device not found',
      });
      throw new UnauthorizedException('Device not found or inactive');
    }

    // Verify certificate hasn't expired
    if (
      device.certificateExpiresAt &&
      device.certificateExpiresAt < new Date()
    ) {
      await this.auditService.logAccess({
        userId: 'system',
        userRole: 'system',
        action: 'DEVICE_AUTH_FAILED',
        resource: `device:${deviceId}`,
        ipAddress: '127.0.0.1',
        details: 'Device certificate expired',
        successful: false,
        deviceId,
        reason: 'Certificate expired',
      });
      throw new UnauthorizedException('Device certificate expired');
    }

    // Verify certificate hash matches
    const certificateHash = crypto
      .createHash('sha256')
      .update(certificate)
      .digest('hex');
    if (certificateHash !== device.certificateHash) {
      await this.auditService.logAccess({
        userId: 'system',
        userRole: 'system',
        action: 'DEVICE_AUTH_FAILED',
        resource: `device:${deviceId}`,
        ipAddress: '127.0.0.1',
        details: 'Invalid certificate',
        successful: false,
        deviceId,
        reason: 'Invalid certificate',
      });
      throw new UnauthorizedException('Invalid certificate');
    }

    // Verify signature
    const isValidSignature = this.verifyDeviceSignature(
      certificate,
      challenge,
      signature,
    );

    if (!isValidSignature) {
      await this.auditService.logAccess({
        userId: 'system',
        userRole: 'system',
        action: 'DEVICE_AUTH_FAILED',
        resource: `device:${deviceId}`,
        ipAddress: '127.0.0.1',
        details: 'Invalid signature',
        successful: false,
        deviceId,
        reason: 'Invalid signature',
      });
      throw new UnauthorizedException('Invalid signature');
    }

    // Update last authenticated timestamp
    await this.deviceRepository.update(device.id, {
      lastAuthenticated: new Date(),
    });

    await this.auditService.logAccess({
      userId: 'system',
      userRole: 'system',
      action: 'DEVICE_AUTHENTICATED',
      resource: `device:${deviceId}`,
      ipAddress: '127.0.0.1',
      details: 'Device successfully authenticated',
      successful: true,
      deviceId,
    });

    return true;
  }

  private verifyDeviceSignature(
    certificate: string,
    challenge: string,
    signature: string,
  ): boolean {
    try {
      const certData = JSON.parse(
        Buffer.from(certificate, 'base64').toString(),
      );
      const publicKey = certData.publicKey;

      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(challenge);
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      return false;
    }
  }

  async revokeDevice(deviceId: string): Promise<void> {
    await this.deviceRepository.update(
      { deviceId },
      { isActive: false, updatedAt: new Date() },
    );

    await this.auditService.logAccess({
      userId: 'system',
      userRole: 'system',
      action: 'DEVICE_REVOKED',
      resource: `device:${deviceId}`,
      ipAddress: '127.0.0.1',
      details: 'Device access revoked',
      successful: true,
      deviceId,
    });
  }
}
