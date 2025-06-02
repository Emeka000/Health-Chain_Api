import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Assignment } from "./entities/assignment.entity"
import type { CreateAssignmentDto } from "./dto/create-assignment.dto"
import type { UpdateAssignmentDto } from "./dto/update-assignment.dto"

@Injectable()
export class AssignmentsService {
  private assignmentsRepository: Repository<Assignment>
  constructor(
    @InjectRepository(Assignment)
    assignmentsRepository: Repository<Assignment>,
  ) {
    this.assignmentsRepository = assignmentsRepository;
  }

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.assignmentsRepository.create({
      ...createAssignmentDto,
      startTime: new Date(createAssignmentDto.startTime),
      endTime: createAssignmentDto.endTime ? new Date(createAssignmentDto.endTime) : null,
    })

    return this.assignmentsRepository.save(assignment)
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentsRepository.find({
      relations: ["nurse", "patient", "department"],
    })
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
      relations: ["nurse", "patient", "department"],
    })

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`)
    }

    return assignment
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto): Promise<Assignment> {
    const assignment = await this.findOne(id)

    if (updateAssignmentDto.startTime) {
      updateAssignmentDto.startTime = new Date(updateAssignmentDto.startTime) as any
    }

    if (updateAssignmentDto.endTime) {
      updateAssignmentDto.endTime = new Date(updateAssignmentDto.endTime) as any
    }

    Object.assign(assignment, updateAssignmentDto)
    return this.assignmentsRepository.save(assignment)
  }

  async findByNurse(nurseId: string): Promise<Assignment[]> {
    return this.assignmentsRepository.find({
      where: { nurseId },
      relations: ["patient", "department"],
    })
  }
}
