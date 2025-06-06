import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisController } from './diagnosis.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Diagnosis])],
  providers: [DiagnosisService],
  controllers: [DiagnosisController],
})
export class DiagnosisModule {}
