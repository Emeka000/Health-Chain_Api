import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MedicationService } from './medication.service';

@Controller('medications')
@UseGuards(JwtAuthGuard)
export class MedicationController {
  constructor(private medicationService: MedicationService) {}

  @Get()
  async getMedications(@Request() req) {
    return this.medicationService.getPatientMedications(req.user.sub);
  }

  @Get('reminders/today')
  async getTodaysReminders(@Request() req) {
    return this.medicationService.getTodaysReminders(req.user.sub);
  }

  @Post()
  async addMedication(@Request() req, @Body() medicationData: any) {
    return this.medicationService.addMedication(req.user.sub, medicationData);
  }

  @Put(':id')
  async updateMedication(@Param('id') id: number, @Body() updateData: any) {
    return this.medicationService.updateMedication(id, updateData);
  }

  @Post(':id/adherence')
  async recordAdherence(@Param('id') id: number, @Body() { taken }: { taken: boolean }) {
    return this.medicationService.recordAdherence(id, taken);
  }
}
