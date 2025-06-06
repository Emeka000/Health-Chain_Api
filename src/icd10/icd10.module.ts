import { Module } from '@nestjs/common';
import { Icd10Service } from './icd10.service';
import { Icd10Controller } from './icd10.controller';

@Module({
  providers: [Icd10Service],
  controllers: [Icd10Controller],
  exports: [Icd10Service],
})
export class Icd10Module {}
