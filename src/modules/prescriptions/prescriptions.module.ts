import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Prescription } from './entities/prescription.entity';
import { MedicationAdministration } from './entities/medication-administration.entity';
import { DrugInteractionAlert } from './entities/drug-interaction-alert.entity';
import { PatientMedicationAllergy } from './entities/patient-medication-allergy.entity';
import { Pharmacy } from './entities/pharmacy.entity';

// Services
import { PrescriptionsService } from './services/prescriptions.service';
import { MedicationAdministrationService } from './services/medication-administration.service';
import { DrugInteractionService } from './services/drug-interaction.service';
import { PatientMedicationAllergyService } from './services/patient-medication-allergy.service';
import { PharmacyService } from './services/pharmacy.service';

// Controllers
import { PrescriptionsController } from './controllers/prescriptions.controller';
import { MedicationAdministrationController } from './controllers/medication-administration.controller';
import { DrugInteractionAlertController } from './controllers/drug-interaction-alert.controller';
import { PatientMedicationAllergyController } from './controllers/patient-medication-allergy.controller';
import { PharmacyController } from './controllers/pharmacy.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prescription,
      MedicationAdministration,
      DrugInteractionAlert,
      PatientMedicationAllergy,
      Pharmacy,
    ]),
  ],
  controllers: [
    PrescriptionsController,
    MedicationAdministrationController,
    DrugInteractionAlertController,
    PatientMedicationAllergyController,
    PharmacyController,
  ],
  providers: [
    PrescriptionsService,
    MedicationAdministrationService,
    DrugInteractionService,
    PatientMedicationAllergyService,
    PharmacyService,
  ],
  exports: [
    PrescriptionsService,
    MedicationAdministrationService,
    DrugInteractionService,
    PatientMedicationAllergyService,
    PharmacyService,
  ],
})
export class PrescriptionsModule {}
