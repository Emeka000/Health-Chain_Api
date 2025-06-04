import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CommunicationService } from '../services/communication.service';

@Controller('api/patients/:patientId/communications')
@UseGuards(JwtAuthGuard)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post()
  async sendCommunication(
    @Param('patientId') patientId: string,
    @Body() body: { type: string; subject: string; content: string },
    @Request() req
  ) {
    return await this.communicationService.sendCommunication(
      patientId,
      body.type,
      body.subject,
      body.content,
      req.user.id
    );
  }

  @Get()
  async findByPatient(@Param('patientId') patientId: string) {
    return await this.communicationService.findByPatient(patientId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return await this.communicationService.markAsRead(id);
  }
}
