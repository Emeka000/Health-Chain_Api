import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabWorkflow, WorkflowStatus, WorkflowStepType } from '../entities/lab-workflow.entity';
import { CreateLabWorkflowDto, UpdateLabWorkflowDto } from '../dto/lab-workflow.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LabWorkflowService {
  constructor(
    @InjectRepository(LabWorkflow)
    private labWorkflowRepository: Repository<LabWorkflow>
  ) {}

  async create(createLabWorkflowDto: CreateLabWorkflowDto): Promise<LabWorkflow> {
    const labWorkflow = this.labWorkflowRepository.create(createLabWorkflowDto);
    return this.labWorkflowRepository.save(labWorkflow);
  }

  async findAll(query: any): Promise<{ data: LabWorkflow[]; total: number }> {
    const { page = 1, limit = 10, status, stepType, assignedTo } = query;
    
    const queryBuilder = this.labWorkflowRepository.createQueryBuilder('workflow')
      .leftJoinAndSelect('workflow.labOrder', 'order')
      .leftJoinAndSelect('order.patient', 'patient');

    if (status) queryBuilder.andWhere('workflow.status = :status', { status });
    if (stepType) queryBuilder.andWhere('workflow.stepType = :stepType', { stepType });
    if (assignedTo) queryBuilder.andWhere('workflow.assignedTo = :assignedTo', { assignedTo });

    const [data, total] = await queryBuilder
      .orderBy('workflow.sequenceOrder', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<LabWorkflow> {
    const labWorkflow = await this.labWorkflowRepository.findOne({
      where: { id },
      relations: ['labOrder', 'labOrder.patient']
    });

    if (!labWorkflow) {
      throw new NotFoundException('Lab workflow not found');
    }

    return labWorkflow;
  }

  async update(id: string, updateLabWorkflowDto: UpdateLabWorkflowDto): Promise<LabWorkflow> {
    const labWorkflow = await this.findOne(id);
    Object.assign(labWorkflow, updateLabWorkflowDto);
    return this.labWorkflowRepository.save(labWorkflow);
  }

  async remove(id: string): Promise<void> {
    const labWorkflow = await this.findOne(id);
    await this.labWorkflowRepository.remove(labWorkflow);
  }

  async startStep(id: string, startData: any): Promise<LabWorkflow> {
    const workflow = await this.findOne(id);
    
    workflow.status = WorkflowStatus.IN_PROGRESS;
    workflow.startedAt = new Date();
    workflow.assignedTo = startData.assignedTo;
    
    return this.labWorkflowRepository.save(workflow);
  }

  async completeStep(id: string, completionData: any): Promise<LabWorkflow> {
    const workflow = await this.findOne(id);
    
    workflow.status = WorkflowStatus.COMPLETED;
    workflow.completedAt = new Date();
    workflow.notes = completionData.notes;
    workflow.stepData = completionData.stepData;
    
    const savedWorkflow = await this.labWorkflowRepository.save(workflow);
    await this.triggerNextStep(workflow.labOrderId, workflow.sequenceOrder);
    
    return savedWorkflow;
  }

  async triggerAutomation(automationData: any): Promise<any> {
    const { orderId, stepType, automationRule } = automationData;
    
    switch (automationRule) {
      case 'auto_advance':
        return this.autoAdvanceWorkflow(orderId, stepType);
      case 'parallel_processing':
        return this.enableParallelProcessing(orderId);
      case 'priority_routing':
        return this.applyPriorityRouting(orderId);
      default:
        throw new Error('Unknown automation rule');
    }
  }

  async getOrderWorkflowStatus(orderId: string): Promise<any> {
    const workflows = await this.labWorkflowRepository.find({
      where: { labOrderId: orderId },
      order: { sequenceOrder: 'ASC' }
    });

    const totalSteps = workflows.length;
    const completedSteps = workflows.filter(w => w.status === WorkflowStatus.COMPLETED).length;
    const currentStep = workflows.find(w => w.status === WorkflowStatus.IN_PROGRESS);
    
    return {
      totalSteps,
      completedSteps,
      progress: (completedSteps / totalSteps) * 100,
      currentStep: currentStep?.stepName || 'Completed',
      workflows
    };
  }

  async completeWorkflowStep(orderId: string, stepType: WorkflowStepType): Promise<void> {
    const workflow = await this.labWorkflowRepository.findOne({
      where: { labOrderId: orderId, stepType }
    });

    if (workflow) {
      workflow.status = WorkflowStatus.COMPLETED;
      workflow.completedAt = new Date();
      await this.labWorkflowRepository.save(workflow);
    }
  }

  async startWorkflowStep(orderId: string, stepType: WorkflowStepType): Promise<void> {
    const workflow = await this.labWorkflowRepository.findOne({
      where: { labOrderId: orderId, stepType }
    });

    if (workflow) {
      workflow.status = WorkflowStatus.IN_PROGRESS;
      workflow.startedAt = new Date();
      await this.labWorkflowRepository.save(workflow);
    }
  }

  async completeAllWorkflowSteps(orderId: string): Promise<void> {
    await this.labWorkflowRepository.update(
      { labOrderId: orderId },
      { status: WorkflowStatus.COMPLETED, completedAt: new Date() }
    );
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorWorkflowSLA(): Promise<void> {
    const overdueWorkflows = await this.labWorkflowRepository.createQueryBuilder('workflow')
      .where('workflow.status IN (:...statuses)', { statuses: [WorkflowStatus.PENDING, WorkflowStatus.IN_PROGRESS] })
      .andWhere('workflow.dueDate < :now', { now: new Date() })
      .getMany();

    for (const workflow of overdueWorkflows) {
      await this.handleOverdueWorkflow(workflow);
    }
  }

  private async triggerNextStep(orderId: string, currentSequence: number): Promise<void> {
    const nextWorkflow = await this.labWorkflowRepository.findOne({
      where: { labOrderId: orderId, sequenceOrder: currentSequence + 1 }
    });

    if (nextWorkflow && nextWorkflow.status === WorkflowStatus.PENDING) {
      nextWorkflow.status = WorkflowStatus.PENDING;
      await this.labWorkflowRepository.save(nextWorkflow);
    }
  }

  private async autoAdvanceWorkflow(orderId: string, stepType: WorkflowStepType): Promise<void> {
    const workflow = await this.labWorkflowRepository.findOne({
      where: { labOrderId: orderId, stepType }
    });

    if (workflow && workflow.status === WorkflowStatus.PENDING) {
      workflow.status = WorkflowStatus.COMPLETED;
      workflow.completedAt = new Date();
      await this.labWorkflowRepository.save(workflow);
      await this.triggerNextStep(orderId, workflow.sequenceOrder);
    }
  }

  private async enableParallelProcessing(orderId: string): Promise<void> {
    const workflows = await this.labWorkflowRepository.find({
      where: { labOrderId: orderId, status: WorkflowStatus.PENDING }
    });

    for (const workflow of workflows) {
      if (this.canRunInParallel(workflow.stepType)) {
        workflow.status = WorkflowStatus.IN_PROGRESS;
        workflow.startedAt = new Date();
        await this.labWorkflowRepository.save(workflow);
      }
    }
  }

  private async applyPriorityRouting(orderId: string): Promise<void> {
    const workflows = await this.labWorkflowRepository.find({
      where: { labOrderId: orderId },
      relations: ['labOrder']
    });

    for (const workflow of workflows) {
      if (workflow.labOrder.priority === 'stat') {
        workflow.dueDate = new Date(Date.now() + 30 * 60 * 1000);
      } else if (workflow.labOrder.priority === 'urgent') {
        workflow.dueDate = new Date(Date.now() + 120 * 60 * 1000);
      }
      await this.labWorkflowRepository.save(workflow);
    }
  }

  private canRunInParallel(stepType: WorkflowStepType): boolean {
    return [
      WorkflowStepType.SAMPLE_PREPARATION,
      WorkflowStepType.TESTING
    ].includes(stepType);
  }

  private async handleOverdueWorkflow(workflow: LabWorkflow): Promise<void> {
    console.log(`Workflow ${workflow.id} is overdue`);
  }
}