import { Module } from '@nestjs/common';
import { PharmacysService } from './pharmacys.service';
import { PharmacysController } from './pharmacys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlledSubstanceController } from './controller/controlled-substance.controller';
import { DrugController } from './controller/drug.controller';
import { InventoryController } from './controller/inventory.controller';
import { PatientController } from './controller/patient.controller';
import { PrescriptionController } from './controller/prescription.controller';
import { SafetyAlertController } from './controller/safety-alert.controller';
import { ControlledSubstanceLog } from './entities/controlled-substance-log.entity';
import { Drug } from './entities/drug.entity';
import { InventoryItem } from './entities/inventory-item.entity';
import { Patient } from './entities/patient.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { Prescription } from './entities/prescription.entity';
import { SafetyAlert } from './entities/safety-alert.entity';
import { ControlledSubstanceService } from './services/controlled-substance.service';
import { DrugService } from './services/drug.service';
import { InventoryService } from './services/inventory.service';
import { PrescriptionService } from './services/prescription.service';
import { SafetyAlertService } from './services/safety-alert.service';

@Module({
   imports: [
    TypeOrmModule.forFeature([
      Drug,
      InventoryItem,
      Prescription,
      PrescriptionItem,
      Patient,
      SafetyAlert,
      ControlledSubstanceLog,
    ]),
  ],
  controllers: [
    DrugController,
    InventoryController,
    PrescriptionController,
    SafetyAlertController,
    ControlledSubstanceController,
    PatientController,
    PharmacysController
  ],
  providers: [
    DrugService,
    InventoryService,
    PrescriptionService,
    SafetyAlertService,
    ControlledSubstanceService,
  ],
  exports: [
    DrugService,
    InventoryService,
    PrescriptionService,
    SafetyAlertService,
    ControlledSubstanceService,
    PharmacysService
  ],
})
export class PharmacysModule {}
