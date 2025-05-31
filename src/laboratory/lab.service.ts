import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabTest } from './entities/lab-test.entity';
import { LabOrder } from './entities/lab-order.entity';
import { LabResult } from './entities/lab-result.entity';
import { Specimen } from './entities/specimen.entity';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { OrderTestDto } from './dto/order-test.dto';
import { RecordResultDto } from './dto/record-result.dto';
import { UpdateSpecimenStatusDto } from './dto/update-specimen-status.dto';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(LabTest)
    private labTestRepo: Repository<LabTest>,

    @InjectRepository(LabOrder)
    private labOrderRepo: Repository<LabOrder>,

    @InjectRepository(LabResult)
    private labResultRepo: Repository<LabResult>,

    @InjectRepository(Specimen)
    private specimenRepo: Repository<Specimen>,
  ) {}

  createLabTest(dto: CreateLabTestDto) {
    const test = this.labTestRepo.create(dto);
    return this.labTestRepo.save(test);
  }

  getAllLabTests() {
    return this.labTestRepo.find();
  }

  async orderTests(dto: OrderTestDto) {
    const order = this.labOrderRepo.create({
      patientId: dto.patientId,
      testIds: dto.testIds,
      status: 'pending',
    });
    return this.labOrderRepo.save(order);
  }

  async recordResults(dto: RecordResultDto) {
    const order = await this.labOrderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Lab order not found');

    const results = dto.results.map((item) =>
      this.labResultRepo.create({
        orderId: dto.orderId,
        testId: item.testId,
        result: item.result,
        unit: item.unit,
        referenceRange: item.referenceRange,
      }),
    );

    await this.labResultRepo.save(results);
    order.status = 'completed';
    await this.labOrderRepo.save(order);

    return { message: 'Results recorded successfully' };
  }

  async updateSpecimenStatus(dto: UpdateSpecimenStatusDto) {
    const specimen = await this.specimenRepo.findOne({ where: { id: dto.specimenId } });
    if (!specimen) throw new NotFoundException('Specimen not found');

    specimen.status = dto.status;
    return this.specimenRepo.save(specimen);
  }

  trackSpecimensByPatient(patientId: string) {
    return this.specimenRepo.find({ where: { patientId } });
  }

  createSpecimen(data: { patientId: string; specimenType: string }) {
    const specimen = this.specimenRepo.create({
      ...data,
      status: 'collected',
    });
    return this.specimenRepo.save(specimen);
  }
}
