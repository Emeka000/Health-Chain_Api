import { Injectable, ConflictException } from "@nestjs/common"
import { type Repository, Between } from "typeorm"
import { Schedule } from "../entities/schedule.entity"
import { Doctor } from "../entities/doctor.entity"
import { CreateScheduleDto } from "../dto/create-schedule.dto"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class SchedulingService {
    constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,

    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async createSchedule(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    // Check for conflicts
    const conflicts = await this.checkForConflicts(
      createScheduleDto.doctorId,
      createScheduleDto.startTime,
      createScheduleDto.endTime,
    )

    if (conflicts.length > 0) {
      throw new ConflictException("Schedule conflicts with existing appointments")
    }

    const schedule = this.scheduleRepository.create(createScheduleDto)
    return this.scheduleRepository.save(schedule)
  }

  async getSchedules(filters: {
    doctorId?: string
    departmentId?: string
    startDate?: Date
    endDate?: Date
  }): Promise<Schedule[]> {
    const query = this.scheduleRepository
      .createQueryBuilder("schedule")
      .leftJoinAndSelect("schedule.doctor", "doctor")
      .leftJoinAndSelect("doctor.department", "department")

    if (filters.doctorId) {
      query.andWhere("schedule.doctorId = :doctorId", {
        doctorId: filters.doctorId,
      })
    }

    if (filters.departmentId) {
      query.andWhere("doctor.departmentId = :departmentId", {
        departmentId: filters.departmentId,
      })
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere("schedule.startTime BETWEEN :startDate AND :endDate", {
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
    }

    return query.orderBy("schedule.startTime", "ASC").getMany()
  }

  async checkAvailability(
    doctorId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<{
    available: boolean
    conflicts: Schedule[]
    suggestions: Date[]
  }> {
    const startDateTime = new Date(`${date.toDateString()} ${startTime}`)
    const endDateTime = new Date(`${date.toDateString()} ${endTime}`)

    const conflicts = await this.checkForConflicts(doctorId, startDateTime, endDateTime)

    const suggestions =
      conflicts.length > 0 ? await this.suggestAlternativeTimes(doctorId, date, startDateTime, endDateTime) : []

    return {
      available: conflicts.length === 0,
      conflicts,
      suggestions,
    }
  }

  async getSchedulingConflicts(): Promise<{
    conflicts: Array<{
      doctor: Doctor
      conflictingSchedules: Schedule[]
    }>
    summary: {
      totalConflicts: number
      affectedDoctors: number
    }
  }> {
    const allSchedules = await this.scheduleRepository.find({
      relations: ["doctor"],
      order: { startTime: "ASC" },
    })

    const conflictMap = new Map<string, Schedule[]>()

    // Group schedules by doctor
    const doctorSchedules = new Map<string, Schedule[]>()
    for (const schedule of allSchedules) {
      if (!doctorSchedules.has(schedule.doctorId)) {
        doctorSchedules.set(schedule.doctorId, [])
      }
      doctorSchedules.get(schedule.doctorId)!.push(schedule)
    }

    // Check for overlaps within each doctor's schedule
    for (const [doctorId, schedules] of doctorSchedules) {
      const conflicts: Schedule[] = []

      for (let i = 0; i < schedules.length; i++) {
        for (let j = i + 1; j < schedules.length; j++) {
          if (this.schedulesOverlap(schedules[i], schedules[j])) {
            conflicts.push(schedules[i], schedules[j])
          }
        }
      }

      if (conflicts.length > 0) {
        conflictMap.set(doctorId, [...new Set(conflicts)])
      }
    }

    const conflicts = Array.from(conflictMap.entries()).map(([doctorId, schedules]) => ({
      doctor: schedules[0].doctor,
      conflictingSchedules: schedules,
    }))

    return {
      conflicts,
      summary: {
        totalConflicts: conflicts.reduce((sum, c) => sum + c.conflictingSchedules.length, 0),
        affectedDoctors: conflicts.length,
      },
    }
  }

  private async checkForConflicts(doctorId: string, startTime: Date, endTime: Date): Promise<Schedule[]> {
    return this.scheduleRepository
      .createQueryBuilder("schedule")
      .where("schedule.doctorId = :doctorId", { doctorId })
      .andWhere("(schedule.startTime < :endTime AND schedule.endTime > :startTime)", { startTime, endTime })
      .getMany()
  }

  private schedulesOverlap(schedule1: Schedule, schedule2: Schedule): boolean {
    return schedule1.startTime < schedule2.endTime && schedule1.endTime > schedule2.startTime
  }

  private async suggestAlternativeTimes(
    doctorId: string,
    date: Date,
    requestedStart: Date,
    requestedEnd: Date,
  ): Promise<Date[]> {
    const duration = requestedEnd.getTime() - requestedStart.getTime()
    const suggestions: Date[] = []

    // Get all schedules for the day
    const dayStart = new Date(date)
    dayStart.setHours(8, 0, 0, 0) // Start at 8 AM
    const dayEnd = new Date(date)
    dayEnd.setHours(18, 0, 0, 0) // End at 6 PM

    const daySchedules = await this.scheduleRepository.find({
      where: {
        doctorId,
        startTime: Between(dayStart, dayEnd),
      },
      order: { startTime: "ASC" },
    })

    // Find gaps in the schedule
    let currentTime = dayStart
    for (const schedule of daySchedules) {
      if (currentTime.getTime() + duration <= schedule.startTime.getTime()) {
        suggestions.push(new Date(currentTime))
      }
      currentTime = new Date(Math.max(currentTime.getTime(), schedule.endTime.getTime()))
    }

    // Check if there's time at the end of the day
    if (currentTime.getTime() + duration <= dayEnd.getTime()) {
      suggestions.push(new Date(currentTime))
    }

    return suggestions.slice(0, 3) // Return up to 3 suggestions
  }
}
