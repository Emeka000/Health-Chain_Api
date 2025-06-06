import { Module } from '@nestjs/common';
import { DecisionSupportService } from './decision-support.service';
import { DecisionSupportController } from './decision-support.controller';

@Module({
  providers: [DecisionSupportService],
  controllers: [DecisionSupportController],
})
export class DecisionSupportModule {}
