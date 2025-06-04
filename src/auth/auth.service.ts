import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private jwtService: JwtService,
  ) {}

  async register(patientData: any) {
    const hashedPassword = await bcrypt.hash(patientData.password, 10);
    const patient = this.patientRepository.create({
      ...patientData,
      password: hashedPassword,
    });
    
    const savedPatient = await this.patientRepository.save(patient);
    return this.generateToken(savedPatient);
  }

  async login(email: string, password: string) {
    const patient = await this.patientRepository.findOne({ where: { email } });
    
    if (!patient || !(await bcrypt.compare(password, patient.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(patient);
  }

  private generateToken(patient: Patient) {
    const payload = { sub: patient.id, email: patient.email };
    return {
      access_token: this.jwtService.sign(payload),
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
      },
    };
  }
}