import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalProcedure } from './entities/procedure.entity';
import { ProcedureService } from './procedure.service';
import { ProcedureController } from './procedure.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalProcedure])],
  providers: [ProcedureService],
  controllers: [ProcedureController],
})
export class ProcedureModule {}
