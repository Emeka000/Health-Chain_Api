import { Module } from '@nestjs/common';
import { FhirController } from './fhir.controller';
import { FhirService } from './fhir.service';
import { EncryptionModule } from '../common/encryption/encryption.module';

@Module({
  imports: [EncryptionModule],
  controllers: [FhirController],
  providers: [FhirService],
})
export class FhirModule {}
