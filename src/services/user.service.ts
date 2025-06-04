import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreatePatientDto } from '../dto/create-patient.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: createUserDto.role === UserRole.PATIENT ? 
        UserStatus.ACTIVE : UserStatus.PENDING_VERIFICATION
    });

    return await this.userRepository.save(user);
  }

  async createPatient(userId: string, createPatientDto: CreatePatientDto): Promise<Patient> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.PATIENT) {
      throw new BadRequestException('User must have patient role');
    }

    // Generate unique MRN
    const mrn = await this.generateUniqueMRN();

    const patient = this.patientRepository.create({
      ...createPatientDto,
      mrn,
      userId,
      dateOfBirth: new Date(createPatientDto.dateOfBirth)
    });

    return await this.patientRepository.save(patient);
  }

  private async generateUniqueMRN(): Promise<string> {
    let mrn: string;
    let isUnique = false;

    while (!isUnique) {
      // Generate 10-digit MRN starting with hospital code
      const hospitalCode = '01'; // Hospital identifier
      const randomNumber = crypto.randomInt(10000000, 99999999);
      mrn = `${hospitalCode}${randomNumber}`;

      const existing = await this.patientRepository.findOne({ where: { mrn } });
      isUnique = !existing;
    }

    return mrn;
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return await this.userRepository.find({
      where: { role },
      relations: ['patient', 'medicalLicenses']
    });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['patient', 'medicalLicenses']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deactivateUser(userId: string, deactivatedBy: string, reason: string): Promise<User> {
    const user = await this.getUserById(userId);

    user.status = UserStatus.SUSPENDED;
    user.deactivatedAt = new Date();
    user.deactivatedBy = deactivatedBy;
    user.deactivationReason = reason;

    return await this.userRepository.save(user);
  }

  async reactivateUser(userId: string): Promise<User> {
    const user = await this.getUserById(userId);

    user.status = UserStatus.ACTIVE;
    user.deactivatedAt = null;
    user.deactivatedBy = null;
    user.deactivationReason = null;

    return await this.userRepository.save(user);
  }

  async updateUserPermissions(userId: string, permissions: string[]): Promise<User> {
    const user = await this.getUserById(userId);
    user.permissions = permissions;
    return await this.userRepository.save(user);
  }

  async verifyUserCredentials(userId: string, verifiedBy: string): Promise<User> {
    const user = await this.getUserById(userId);
    
    if (user.role === UserRole.PATIENT) {
      throw new BadRequestException('Patients do not require credential verification');
    }

    user.status = UserStatus.ACTIVE;
    return await this.userRepository.save(user);
  }
}
