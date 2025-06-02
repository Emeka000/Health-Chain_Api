import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
    ParseIntPipe,
    Logger,
    Req,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
  } from '@nestjs/swagger';
  import { Request } from 'express';
  import { TrainingService } from '../training/services/training.service';
  import { CreateTrainingProgramDto } from '../dto/create-training-program.dto';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../../auth/guards/roles.guard';
  import { Roles } from '../../auth/decorators/roles.decorator';
  
  interface AuthenticatedRequest extends Request {
    user: {
      id: number;
      roles: string[];
    };
  }
  
  @ApiTags('Training Management')
  @Controller('training')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class TrainingController {
    private readonly logger = new Logger(TrainingController.name);
  
    constructor(private readonly trainingService: TrainingService) {}
  
    @Post('programs')
    @Roles('admin', 'training_manager', 'hr_manager')
    @ApiOperation({ summary: 'Create a new training program' })
    @ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Training program created successfully',
    })
    async createProgram(
      @Body() createProgramDto: CreateTrainingProgramDto,
      @Req() req: AuthenticatedRequest,
    ) {
      this.logger.log(`Creating training program: ${createProgramDto.code}`);
      return this.trainingService.createTrainingProgram(createProgramDto, req.user.id);
    }
  
    @Post('assign')
    @Roles('admin', 'training_manager', 'hr_manager', 'supervisor')
    @ApiOperation({ summary: 'Assign training to an employee' })
    @ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Training assigned successfully',
    })
    async assignTraining(
      @Body() assignmentData: {
        employeeId: number;
        programId: number;
        dueDate?: string;
      },
      @Req() req: AuthenticatedRequest,
    ) {
      this.logger.log(`Assigning training ${assignmentData.programId} to employee ${assignmentData.employeeId}`);
      
      const dueDate = assignmentData.dueDate ? new Date(assignmentData.dueDate) : undefined;
      
      return this.trainingService.assignTrainingToEmployee(
        assignmentData.employeeId,
        assignmentData.programId,
        req.user.id,
        dueDate,
      );
    }
  
    @Put('records/:recordId/complete')
    @Roles('admin', 'training_manager', 'instructor', 'employee')
    @ApiOperation({ summary: 'Complete a training record' })
    @ApiParam({ name: 'recordId', description: 'Training record ID' })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Training completed successfully',
    })
    async completeTraining(
      @Param('recordId', ParseIntPipe) recordId: number,
      @Body() completionData: {
        score: number;
        timeSpentHours: number;
        instructorId?: number;
        notes?: string;
      },
    ) {
      this.logger.log(`Completing training record: ${recordId}`);
      return this.trainingService.completeTraining(recordId, completionData);
    }
  
    @Post('competency-assessments')
    @Roles('admin', 'training_manager', 'supervisor', 'assessor')
    @ApiOperation({ summary: 'Create a competency assessment' })
    @ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Competency assessment created successfully',
    })
    async createCompetencyAssessment(
      @Body() assessmentData: {
        employeeId: number;
        programId: number;
        competencyType: string;
        assessmentMethod: string;
        score: number;
        maximumScore: number;
        strengths?: string;
        improvementAreas?: string;
        developmentPlan?: string;
      },
      @Req() req: AuthenticatedRequest,
    ) {
      this.logger.log(`Creating competency assessment for employee ${assessmentData.employeeId}`);
      
      return this.trainingService.createCompetencyAssessment({
        ...assessmentData,
        assessorId: req.user.id,
      });
    }
  
    @Get('metrics')
    @Roles('admin', 'training_manager', 'hr_manager', 'manager')
    @ApiOperation({ summary: 'Get training metrics' })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Training metrics retrieved successfully',
    })
    async getTrainingMetrics() {
      this.logger.log('Getting training metrics');
      return this.trainingService.getTrainingMetrics();
    }
  
    @Get('employees/:employeeId/status')
    @Roles('admin', 'training_manager', 'hr_manager', 'supervisor', 'employee')
    @ApiOperation({ summary: 'Get employee training status' })
    @ApiParam({ name: 'employeeId', description: 'Employee ID' })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Employee training status retrieved successfully',
    })
    async getEmployeeTrainingStatus(
      @Param('employeeId', ParseIntPipe) employeeId: number,
    ) {
      this.logger.log(`Getting training status for employee: ${employeeId}`);
      return this.trainingService.getEmployeeTrainingStatus(employeeId);
    }
  }