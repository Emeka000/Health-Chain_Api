import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { MedicalLicense, LicenseStatus } from '../entities/medical-license.entity';
import { CreateMedicalLicenseDto } from '../dto/create-medical-license.dto';

@Injectable()
export class MedicalLicenseService {
  constructor(
    @InjectRepository(MedicalLicense)
    private licenseRepository: Repository<MedicalLicense>,
  ) {}

  async createLicense(userId: string, createLicenseDto: CreateMedicalLicenseDto): Promise<MedicalLicense> {
    const license = this.licenseRepository.create({
      ...createLicenseDto,
      userId,
      issuedDate: new Date(createLicenseDto.issuedDate),
      expirationDate: new Date(createLicenseDto.expirationDate)
    });

    return await this.licenseRepository.save(license);
  }

  async getLicensesByUser(userId: string): Promise<MedicalLicense[]> {
    return await this.licenseRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async verifyLicense(licenseId: string, verifiedBy: string): Promise<MedicalLicense> {
    const license = await this.licenseRepository.findOne({ where: { id: licenseId } });
    
    if (!license) {
      throw new NotFoundException('License not found');
    }

    license.verificationDate = new Date();
    license.verifiedBy = verifiedBy;

    return await this.licenseRepository.save(license);
  }

  async getExpiringLicenses(daysAhead: number = 30): Promise<MedicalLicense[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await this.licenseRepository.find({
      where: {
        expirationDate: LessThan(futureDate),
        status: LicenseStatus.ACTIVE
      },
      relations: ['user']
    });
  }

  async updateLicenseStatus(licenseId: string, status: LicenseStatus): Promise<MedicalLicense> {
    const license = await this.licenseRepository.findOne({ where: { id: licenseId } });
    
    if (!license) {
      throw new NotFoundException('License not found');
    }

    license.status = status;
    return await this.licenseRepository.save(license);
  }
}
