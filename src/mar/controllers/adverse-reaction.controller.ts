import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AdverseReactionService } from '../services/adverse-reaction.service';
import { CreateAdverseDrugReactionDto } from '../dto/adverse-drug-reaction.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('adverse-reactions')
@UseGuards(JwtAuthGuard)
export class AdverseReactionController {
  constructor(
    private readonly adverseReactionService: AdverseReactionService,
  ) {}

  @Post()
  async reportAdverseReaction(@Body() adrDto: CreateAdverseDrugReactionDto) {
    return await this.adverseReactionService.reportAdverseReaction(adrDto);
  }

  @Get('patient/:patientId')
  async getPatientAdverseReactions(@Param('patientId') patientId: string) {
    return await this.adverseReactionService.getPatientAdverseReactions(
      patientId,
    );
  }

  @Post(':id/notify-physician')
  async notifyPhysician(@Param('id') adrId: string) {
    return await this.adverseReactionService.notifyPhysician(adrId);
  }
}
