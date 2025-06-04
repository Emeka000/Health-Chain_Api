import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Patient } from './entities/patient.entity';
import { MedicalLicense } from './entities/medical-license.entity';
import { UserService } from './services/user.service';
import { MedicalLicenseService } from './services/medical-license.service';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Patient, MedicalLicense])
  ],
  controllers: [UserController],
  providers: [UserService, MedicalLicenseService],
  exports: [UserService, MedicalLicenseService]
})
export class UserModule {}