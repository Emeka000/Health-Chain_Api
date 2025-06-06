import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentOutcome } from './entities/outcome.entity';
import { OutcomeService } from './outcome.service';
import { OutcomeController } from './outcome.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TreatmentOutcome])],
  providers: [OutcomeService],
  controllers: [OutcomeController],
})
export class OutcomeModule {}
