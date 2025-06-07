import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurgicalCase } from './entities/surgical-case.entity';
import { SurgicalCaseService } from './surgical-case.service';
import { SurgicalCaseController } from './surgical-case.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SurgicalCase])],
  providers: [SurgicalCaseService],
  controllers: [SurgicalCaseController],
})
export class SurgicalCaseModule {}