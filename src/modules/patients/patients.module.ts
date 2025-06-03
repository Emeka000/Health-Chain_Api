import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';
import { PatientIdentityService } from './services/patient-identity.service';
import { PatientDocumentService } from './services/patient-document.service';

@Module({
  imports: [TypeOrmModule.forFeature([Patient])],
  controllers: [PatientsController],
  providers: [PatientsService, PatientIdentityService, PatientDocumentService],
  exports: [PatientsService],
})
export class PatientsModule {}
