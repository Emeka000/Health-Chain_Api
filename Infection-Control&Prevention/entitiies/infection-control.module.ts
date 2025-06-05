import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfectionControlController } from './infection-control.controller';
import { InfectionControlService } from './infection-control.service';
import { 
  Infection, 
  IsolationPrecaution, 
  AntibioticUsage, 
  Policy, 
  Outbreak, 
  HandHygieneCompliance 
} from './entities';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([
      Infection,
      IsolationPrecaution,
      AntibioticUsage,
      Policy,
      Outbreak,
      HandHygieneCompliance
    ])
  ],
  controllers: [InfectionControlController],
  providers: [InfectionControlService],
  exports: [InfectionControlService]
})
export class InfectionControlModule {}
