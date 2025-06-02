import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabResult } from '../entities/lab-result.entity';
import { LabTest } from '../entities/lab-test.entity';
import { QualityControl } from '../entities/quality-control.entity';
import { Specimen } from '../entities/specimen.entity';
import { TestOrder } from '../entities/test-order.entity';
import { CreateLabTestDto } from '../dto/create-lab-test.dto';
import { CreateSpecimenDto } from '../dto/create-specimen.dto';
import { EnterLabResultDto } from '../dto/enter-lab-result.dto';
import { ScheduleTestDto } from '../dto/schedule-test.dto';
import { UpdateLabTestDto } from '../dto/update-lab-test.dto';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(LabTest)
    private readonly labTestRepo: Repository<LabTest>,

    @InjectRepository(Specimen)
    private readonly specimenRepo: Repository<Specimen>,

    @InjectRepository(TestOrder)
    private readonly testOrderRepo: Repository<TestOrder>,

    @InjectRepository(LabResult)
    private readonly labResultRepo: Repository<LabResult>,

    @InjectRepository(QualityControl)
    private readonly qcRepo: Repository<QualityControl>,
  ) {}

  // Create a new lab test
  async createLabTest(dto: CreateLabTestDto) {
    const test = this.labTestRepo.create(dto);
    return this.labTestRepo.save(test);
  }

  async updateLabTest(id: number, dto: UpdateLabTestDto) {
    await this.labTestRepo.update(id, dto);
    return this.labTestRepo.findOneBy({ id });
  }

  // Create and track a specimen
  async collectSpecimen(dto: CreateSpecimenDto) {
    const labTest = await this.labTestRepo.findOneBy({ id: dto.labTestId });
    if (!labTest) throw new NotFoundException('Lab test not found');
    const specimen = this.specimenRepo.create({
      ...dto,
      labTest,
      status: 'collected',
    });
    return this.specimenRepo.save(specimen);
  }

  // Order and schedule a test
  async scheduleTest(dto: ScheduleTestDto) {
    const labTest = await this.labTestRepo.findOneBy({ id: dto.labTestId });
    const specimen = await this.specimenRepo.findOneBy({ id: dto.specimenId });

    if (!labTest || !specimen)
      throw new NotFoundException('Invalid test or specimen');

    const order = this.testOrderRepo.create({
      labTest,
      specimen,
      patientId: dto.patientId,
      scheduledAt: dto.scheduledAt,
      status: 'pending',
    });
    return this.testOrderRepo.save(order);
  }

  // Enter lab results
  async enterLabResult(dto: EnterLabResultDto) {
    const testOrder = await this.testOrderRepo.findOne({
      where: { id: dto.testOrderId },
      relations: ['labTest'],
    });
    if (!testOrder) throw new NotFoundException('Test order not found');

    const result = this.labResultRepo.create({
      testOrder,
      results: dto.results,
      isValidated: false,
    });
    return this.labResultRepo.save(result);
  }

  // Validate lab results
  async validateLabResult(resultId: number, validatorId: string) {
    const result = await this.labResultRepo.findOne({
      where: { id: resultId },
      relations: ['testOrder', 'testOrder.labTest'],
    });
    if (!result) throw new NotFoundException('Result not found');

    const { results } = result;
    const parameters = result.testOrder.labTest.parameters;

    // Optional: check for critical values here (if you later add notifications)

    result.isValidated = true;
    result.validatedBy = validatorId;
    return this.labResultRepo.save(result);
  }

  // Record a quality control run
  async recordQualityControl(
    testCode: string,
    controlType: string,
    controlResults: Record<string, number>,
  ) {
    const qc = this.qcRepo.create({
      testCode,
      controlType,
      controlResults,
      date: new Date(),
      passed: true, // You can add real validation logic here
    });
    return this.qcRepo.save(qc);
  }
}
