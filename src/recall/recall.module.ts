import { Module } from '@nestjs/common';
import { Recall } from './recall';

@Module({
  providers: [Recall]
})
export class RecallModule {}
