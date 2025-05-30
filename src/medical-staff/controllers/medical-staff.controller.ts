import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from "@nestjs/common"
import { ApiTags, ApiOperation } from "@nestjs/swagger"
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { MedicalStaffService } from "../providers/medical-staff.service";
import { SchedulingService } from "../providers/scheduling.service";
import { PerformanceTrackingService } from "../providers/performance-tracking.service";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { CreateDoctorDto } from "../dto/create-doctor.dto";
import { UpdateDoctorDto } from "../dto/update-doctor.dto";
import { CreateScheduleDto } from "../dto/create-schedule.dto";
import { CreatePerformanceMetricDto } from "../dto/create-performance-metric.dto";
import { CreateContinuingEducationDto } from "../dto/o create-continuing-education.dto";
import { CreateDepartmentDto } from "../dto/create-department.dto";
import { CreateSpecialtyDto } from "../dto/create-specialty.dto";

@ApiTags("Medical Staff Management")
@Controller("medical-staff")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalStaffController {
  constructor(
    private readonly medicalStaffService: MedicalStaffService,
    private readonly schedulingService: SchedulingService,
    private readonly performanceTrackingService: PerformanceTrackingService,
  ) {}

  // Doctor Management
  @Post('doctors')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Create a new doctor profile' })
  async createDoctor(@Body() createDoctorDto: CreateDoctorDto) {
    return this.medicalStaffService.createDoctor(createDoctorDto);
  }

  @Get("doctors")
  @Roles("admin", "hr", "doctor")
  @ApiOperation({ summary: "Get all doctors with filters" })
  async getDoctors(
    @Query('departmentId') departmentId?: string,
    @Query('specialtyId') specialtyId?: string,
    @Query('status') status?: string,
  ) {
    return this.medicalStaffService.getDoctors({
      departmentId,
      specialtyId,
      status,
    })
  }

  @Get('doctors/:id')
  @Roles('admin', 'hr', 'doctor')
  @ApiOperation({ summary: 'Get doctor by ID' })
  async getDoctor(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalStaffService.getDoctor(id);
  }

  @Put("doctors/:id")
  @Roles("admin", "hr")
  @ApiOperation({ summary: "Update doctor profile" })
  async updateDoctor(@Param('id', ParseUUIDPipe) id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.medicalStaffService.updateDoctor(id, updateDoctorDto)
  }

  @Delete('doctors/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate doctor profile' })
  async deactivateDoctor(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalStaffService.deactivateDoctor(id);
  }

  // License Management
  @Get('doctors/:id/licenses')
  @Roles('admin', 'hr', 'doctor')
  @ApiOperation({ summary: 'Get doctor licenses' })
  async getDoctorLicenses(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalStaffService.getDoctorLicenses(id);
  }

  @Get('licenses/expiring')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Get licenses expiring soon' })
  async getExpiringLicenses(@Query('days') days: number = 90) {
    return this.medicalStaffService.getExpiringLicenses(days);
  }

  @Put("licenses/:id/renew")
  @Roles("admin", "hr")
  @ApiOperation({ summary: "Renew medical license" })
  async renewLicense(@Param('id', ParseUUIDPipe) id: string, @Body('newExpiryDate') newExpiryDate: Date) {
    return this.medicalStaffService.renewLicense(id, newExpiryDate)
  }

  // Scheduling
  @Post('schedules')
  @Roles('admin', 'hr', 'doctor')
  @ApiOperation({ summary: 'Create schedule entry' })
  async createSchedule(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulingService.createSchedule(createScheduleDto);
  }

  @Get("schedules")
  @Roles("admin", "hr", "doctor")
  @ApiOperation({ summary: "Get schedules with filters" })
  async getSchedules(
    @Query('doctorId') doctorId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.schedulingService.getSchedules({
      doctorId,
      departmentId,
      startDate,
      endDate,
    })
  }

  @Get("doctors/:id/availability")
  @Roles("admin", "hr", "doctor")
  @ApiOperation({ summary: "Check doctor availability" })
  async checkAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date: Date,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.schedulingService.checkAvailability(id, date, startTime, endTime)
  }

  @Get("schedules/conflicts")
  @Roles("admin", "hr")
  @ApiOperation({ summary: "Get scheduling conflicts" })
  async getSchedulingConflicts() {
    return this.schedulingService.getSchedulingConflicts()
  }

  // Performance Tracking
  @Post('performance-metrics')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Record performance metric' })
  async createPerformanceMetric(
    @Body() createMetricDto: CreatePerformanceMetricDto,
  ) {
    return this.performanceTrackingService.createPerformanceMetric(createMetricDto);
  }

  @Get("doctors/:id/performance")
  @Roles("admin", "hr", "doctor")
  @ApiOperation({ summary: "Get doctor performance metrics" })
  async getDoctorPerformance(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.performanceTrackingService.getDoctorPerformance(id, startDate, endDate)
  }

  @Get('performance/department-summary')
  @Roles('admin', 'hr')
  @ApiOperation({ summary: 'Get department performance summary' })
  async getDepartmentPerformanceSummary(
    @Query('departmentId') departmentId?: string,
  ) {
    return this.performanceTrackingService.getDepartmentPerformanceSummary(departmentId);
  }

  // Continuing Education
  @Post('continuing-education')
  @Roles('admin', 'hr', 'doctor')
  @ApiOperation({ summary: 'Record continuing education credit' })
  async recordContinuingEducation(
    @Body() createEducationDto: CreateContinuingEducationDto,
  ) {
    return this.medicalStaffService.recordContinuingEducation(createEducationDto);
  }

  @Get('doctors/:id/continuing-education')
  @Roles('admin', 'hr', 'doctor')
  @ApiOperation({ summary: 'Get doctor continuing education credits' })
  async getDoctorEducationCredits(@Param('id', ParseUUIDPipe) id: string) {
    return this.medicalStaffService.getDoctorEducationCredits(id);
  }

  @Get("continuing-education/compliance")
  @Roles("admin", "hr")
  @ApiOperation({ summary: "Get continuing education compliance report" })
  async getEducationCompliance() {
    return this.medicalStaffService.getEducationCompliance()
  }

  // Department and Specialty Management
  @Post('departments')
  @Roles('admin')
  @ApiOperation({ summary: 'Create department' })
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.medicalStaffService.createDepartment(createDepartmentDto);
  }

  @Get("departments")
  @Roles("admin", "hr", "doctor")
  @ApiOperation({ summary: "Get all departments" })
  async getDepartments() {
    return this.medicalStaffService.getDepartments()
  }

  @Post('specialties')
  @Roles('admin')
  @ApiOperation({ summary: 'Create specialty' })
  async createSpecialty(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.medicalStaffService.createSpecialty(createSpecialtyDto);
  }

  @Get("specialties")
  @Roles("admin", "hr", "doctor")
  @ApiOperation({ summary: "Get all specialties" })
  async getSpecialties() {
    return this.medicalStaffService.getSpecialties()
  }
}
