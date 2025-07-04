import { Controller, Post, Body } from '@nestjs/common';
import { DepartmentWorkflowService } from './department-workflow.service';

@Controller('department-workflow')
export class DepartmentWorkflowController {
  constructor(private readonly workflowService: DepartmentWorkflowService) {}

  @Post('admit')
  admitPatientToBed(@Body() body: { bedId: string; patientId: string }) {
    return this.workflowService.admitPatientToBed(body.bedId, body.patientId);
  }

  @Post('discharge')
  dischargePatientFromBed(@Body() body: { bedId: string }) {
    return this.workflowService.dischargePatientFromBed(body.bedId);
  }

  @Post('transfer')
  transferPatient(
    @Body() body: { bedIdFrom: string; bedIdTo: string; patientId: string },
  ) {
    return this.workflowService.transferPatient(
      body.bedIdFrom,
      body.bedIdTo,
      body.patientId,
    );
  }
}
