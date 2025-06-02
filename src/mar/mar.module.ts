import { Module } from '@nestjs/common';
import { MarController } from './controllers/mar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdverseDrugReaction } from './entities/adverse-drug-reaction.entity';
import { MedicationAdministration } from './entities/medication-administration.entity';
import { MedicationOrder } from './entities/medication-order.entity';
import { MedicationReconciliation } from './entities/medication-reconciliation.entity';
import { Medication } from './entities/medication.entity';
import { Patient } from './entities/patient.entity';
import { AdverseReactionController } from './controllers/adverse-reaction.controller';
import { AdverseReactionService } from './services/adverse-reaction.service';
import { MarService } from './services/mar.service';
import { MedicationReconciliationService } from './services/medication-reconciliation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Medication,
      MedicationOrder,
      MedicationAdministration,
      AdverseDrugReaction,
      MedicationReconciliation,
    ]),
  ],
  controllers: [MarController, AdverseReactionController],
  providers: [
    MarService,
    AdverseReactionService,
    MedicationReconciliationService,
  ],
})
export class MarModule {}
