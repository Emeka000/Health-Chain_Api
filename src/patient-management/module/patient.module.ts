import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentController } from 'src/appointment/appointment.controller';
import { AppointmentService } from 'src/appointment/appointment.service';
import { ConsentController } from 'src/consent/consent.controller';
import { ConsentService } from 'src/consent/consent.service';
import { Appointment } from 'src/entities/appointment.entity';
import { Patient } from 'src/entities/patient.entity';
import { PatientService } from 'src/patient/services/patient.service';
import { CommunicationController } from '../controllers/communication.controller';
import { MedicalRecordController } from '../controllers/medical-record.controller';
import { PatientController } from '../controllers/patient.controller';
import { MedicalRecord } from '../entities/medical-record.entity';
import { PatientCommunication } from '../entities/patient-communication.entity';
import { PatientConsent } from '../entities/patient-consent.entity';
import { CommunicationService } from '../services/communication.service';
import { MedicalRecordService } from '../services/medical-record.service';
// import { Patient } from './entities/patient.entity';
// import { MedicalRecord } from './entities/medical-record.entity';
// import { Appointment } from './entities/appointment.entity';
// import { PatientCommunication } from './entities/patient-communication.entity';
// import { PatientConsent } from './entities/patient-consent.entity';
// import { PatientController } from './patient.controller';
// import { MedicalRecordController } from './medical-record.controller';
// import { AppointmentController } from './appointment.controller';
// import { CommunicationController } from './communication.controller';
// import { ConsentController } from './consent.controller';
// import { PatientService } from './patient.service';
// import { MedicalRecordService } from './medical-record.service';
// import { AppointmentService } from './appointment.service';
// import { CommunicationService } from './communication.service';
// import { ConsentService } from './consent.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      MedicalRecord,
      Appointment,
      PatientCommunication,
      PatientConsent
    ])
  ],
  controllers: [
    PatientController,
    MedicalRecordController,
    AppointmentController,
    CommunicationController,
    ConsentController
  ],
  providers: [
    PatientService,
    MedicalRecordService,
    AppointmentService,
    CommunicationService,
    ConsentService
  ],
  exports: [
    PatientService,
    MedicalRecordService,
    AppointmentService,
    CommunicationService,
    ConsentService
  ]
})
export class PatientModule {}
