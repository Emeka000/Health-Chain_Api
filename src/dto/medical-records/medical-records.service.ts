import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between, Like, In } from 'typeorm';
import {
  MedicalRecord,
  RecordStatus,
} from '../../entities/medical-record.entity';
import {
  MedicalRecordVersion,
  VersionChangeType,
} from '../../entities/medical-record-version.entity';
import {
  MedicalTimeline,
  TimelineEventType,
} from '../../entities/medical-timeline.entity';
import { CreateMedicalRecordDto } from '../../dto/medical-records/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '../../dto/medical-records/update-medical-record.dto';
import { SearchMedicalRecordsDto } from '../../dto/medical-records/search-medical-records.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(MedicalRecordVersion)
    private versionRepository: Repository<MedicalRecordVersion>,
    @InjectRepository(MedicalTimeline)
    private timelineRepository: Repository<MedicalTimeline>,
  ) {}

  async create(
    createMedicalRecordDto: CreateMedicalRecordDto,
    userId: string,
  ): Promise<MedicalRecord> {
    const recordNumber = await this.generateRecordNumber();

    const medicalRecord = this.medicalRecordRepository.create({
      ...createMedicalRecordDto,
      recordNumber,
      createdBy: userId,
      status: RecordStatus.DRAFT,
    });

    const savedRecord = await this.medicalRecordRepository.save(medicalRecord);

    // Create initial version
    await this.createVersion(
      savedRecord,
      VersionChangeType.CREATED,
      {},
      savedRecord,
      'Initial record creation',
      userId,
    );

    // Create timeline event
    await this.createTimelineEvent(savedRecord, userId);

    return savedRecord;
  }

  async update(
    id: string,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
    userId: string,
  ): Promise<MedicalRecord> {
    const existingRecord = await this.findOneById(id);

    if (existingRecord.status === RecordStatus.ARCHIVED) {
      throw new ConflictException('Cannot update archived medical record');
    }

    const previousData = { ...existingRecord };
    Object.assign(existingRecord, {
      ...updateMedicalRecordDto,
      lastModifiedBy: userId,
      updatedAt: new Date(),
    });

    const updatedRecord =
      await this.medicalRecordRepository.save(existingRecord);

    // Create version record
    await this.createVersion(
      updatedRecord,
      VersionChangeType.UPDATED,
      previousData,
      updatedRecord,
      'Record updated',
      userId,
    );

    return updatedRecord;
  }

  async findAll(searchDto: SearchMedicalRecordsDto): Promise<{
    records: MedicalRecord[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.createSearchQuery(searchDto);

    const [records, total] = await queryBuilder
      .skip((searchDto.page - 1) * searchDto.limit)
      .take(searchDto.limit)
      .getManyAndCount();

    return {
      records,
      total,
      page: searchDto.page,
      totalPages: Math.ceil(total / searchDto.limit),
    };
  }
  async findOneById(id: string): Promise<MedicalRecord> {
    const record = await this.medicalRecordRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'doctor',
        'clinicalNotes',
        'attachments',
        'consents',
        'versions',
      ],
    });

    if (!record) {
      throw new NotFoundException(`Medical record with ID ${id} not found`);
    }

    return record;
  }

  async getPatientMedicalHistory() {}
}
