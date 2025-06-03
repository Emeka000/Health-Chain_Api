// src/modules/laboratory/services/lab-order.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabOrder, LabOrderStatus } from '../entities/lab-order.entity';
import { LabWorkflow, WorkflowStepType, WorkflowStatus } from '../entities/lab-workflow.entity';
import { CreateLabOrderDto, UpdateLabOrderDto } from '../dto/lab-order.dto';
import { LabWorkflowService } from './lab-workflow.service';

@Injectable()
export class LabOrderService {
  constructor(
    @InjectRepository(LabOrder)
    private labOrderRepository: Repository<LabOrder>,
    @InjectRepository(LabWorkflow)
    private labWorkflowRepository: Repository<LabWorkflow>,
    private labWorkflowService: LabWorkflowService
  ) {}

  async create(createLabOrderDto: CreateLabOrderDto): Promise<LabOrder> {
    const orderNumber = await this.generateOrderNumber();
    
    const labOrder = this.labOrderRepository.create({
      ...createLabOrderDto,
      orderNumber,
      expectedCompletionDate: this.calculateExpectedCompletion(createLabOrderDto.priority)
    });

    const savedOrder = await this.labOrderRepository.save(labOrder);
    await this.initializeWorkflow(savedOrder.id);
    
    return savedOrder;
  }

  async findAll(query: any): Promise<{ data: LabOrder[]; total: number }> {
    const { page = 1, limit = 10, status, priority, patientId } = query;
    
    const queryBuilder = this.labOrderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.patient', 'patient')
      .leftJoinAndSelect('order.orderingPhysician', 'physician')
      .leftJoinAndSelect('order.results', 'results')
      .leftJoinAndSelect('order.workflows', 'workflows');

    if (status) queryBuilder.andWhere('order.status = :status', { status });
    if (priority) queryBuilder.andWhere('order.priority = :priority', { priority });
    if (patientId) queryBuilder.andWhere('order.patientId = :patientId', { patientId });

    const [data, total] = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<LabOrder> {
    const labOrder = await this.labOrderRepository.findOne({
      where: { id },
      relations: ['patient', 'orderingPhysician', 'results', 'workflows']
    });

    if (!labOrder) {
      throw new NotFoundException('Lab order not found');
    }

    return labOrder;
  }

  async update(id: string, updateLabOrderDto: UpdateLabOrderDto): Promise<LabOrder> {
    const labOrder = await this.findOne(id);
    Object.assign(labOrder, updateLabOrderDto);
    return this.labOrderRepository.save(labOrder);
  }

  async remove(id: string): Promise<void> {
    const labOrder = await this.findOne(id);
    await this.labOrderRepository.remove(labOrder);
  }

  async collectSample(id: string, collectionData: any): Promise<LabOrder> {
    const labOrder = await this.findOne(id);
    
    if (labOrder.status !== LabOrderStatus.PENDING) {
      throw new BadRequestException('Sample can only be collected for pending orders');
    }

    labOrder.status = LabOrderStatus.COLLECTED;
    labOrder.collectionDate = new Date();
    
    await this.labOrderRepository.save(labOrder);
    await this.labWorkflowService.completeWorkflowStep(id, WorkflowStepType.SAMPLE_COLLECTION);
    
    return labOrder;
  }

  async processOrder(id: string): Promise<LabOrder> {
    const labOrder = await this.findOne(id);
    
    if (labOrder.status !== LabOrderStatus.COLLECTED) {
      throw new BadRequestException('Order must be collected before processing');
    }

    labOrder.status = LabOrderStatus.PROCESSING;
    await this.labOrderRepository.save(labOrder);
    await this.labWorkflowService.startWorkflowStep(id, WorkflowStepType.TESTING);
    
    return labOrder;
  }

  async completeOrder(id: string, completionData: any): Promise<LabOrder> {
    const labOrder = await this.findOne(id);
    
    if (labOrder.status !== LabOrderStatus.PROCESSING) {
      throw new BadRequestException('Order must be in processing state to complete');
    }

    labOrder.status = LabOrderStatus.COMPLETED;
    await this.labOrderRepository.save(labOrder);
    await this.labWorkflowService.completeAllWorkflowSteps(id);
    
    return labOrder;
  }

  async getWorkflow(id: string): Promise<LabWorkflow[]> {
    return this.labWorkflowRepository.find({
      where: { labOrderId: id },
      order: { sequenceOrder: 'ASC' }
    });
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.labOrderRepository.count({
      where: { orderNumber: { $like: `LAB${today}%` } as any }
    });
    return `LAB${today}${String(count + 1).padStart(4, '0')}`;
  }

  private calculateExpectedCompletion(priority: string): Date {
    const now = new Date();
    const hours = priority === 'stat' ? 2 : priority === 'urgent' ? 6 : 24;
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }

  private async initializeWorkflow(orderId: string): Promise<void> {
    const workflowSteps = [
      { stepType: WorkflowStepType.SAMPLE_COLLECTION, stepName: 'Sample Collection', sequenceOrder: 1 },
      { stepType: WorkflowStepType.SAMPLE_PREPARATION, stepName: 'Sample Preparation', sequenceOrder: 2 },
      { stepType: WorkflowStepType.TESTING, stepName: 'Laboratory Testing', sequenceOrder: 3 },
      { stepType: WorkflowStepType.QUALITY_CONTROL, stepName: 'Quality Control', sequenceOrder: 4 },
      { stepType: WorkflowStepType.RESULT_VERIFICATION, stepName: 'Result Verification', sequenceOrder: 5 },
      { stepType: WorkflowStepType.REPORTING, stepName: 'Report Generation', sequenceOrder: 6 }
    ];

    for (const step of workflowSteps) {
      const workflow = this.labWorkflowRepository.create({
        labOrderId: orderId,
        ...step,
        status: step.sequenceOrder === 1 ? WorkflowStatus.PENDING : WorkflowStatus.PENDING
      });
      await this.labWorkflowRepository.save(workflow);
    }
  }
}