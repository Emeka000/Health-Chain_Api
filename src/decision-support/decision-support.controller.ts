import { Controller, Get, Param } from '@nestjs/common';
import { DecisionSupportService } from './decision-support.service';

@Controller('decision-support')
export class DecisionSupportController {
  constructor(private readonly service: DecisionSupportService) {}

  @Get(':code')
  getRecommendations(@Param('code') code: string) {
    return {
      icd10Code: code,
      recommendations: this.service.getRecommendations(code),
    };
  }
}
