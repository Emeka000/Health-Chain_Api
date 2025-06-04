import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto, prescriberId: string): Promise<Prescription> {
    const prescriber = await this.userRepository.findOne({ where: { id: prescriberId } });
    const patient = await this.userRepository.findOne({ where: { id: createPrescriptionDto.patientId } });

    if (!prescriber || prescriber.role !== UserRole.DOCTOR) {
      throw new BadRequestException('Only doctors can prescribe medications');
    }

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const prescription = this.prescriptionRepository.create({
      ...createPrescriptionDto,
      patient,
      prescriber,
    });

    return this.prescriptionRepository.save(prescription);
  }

  async sendToPharmacy(id: string, pharmacyData: { name: string; phone: string }): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      