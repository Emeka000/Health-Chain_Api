import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HospitalService } from '../services/hospital.service';
import {
  CreateHospitalDto,
  UpdateHospitalDto,
} from '../dto/create-hospital.dto';
import {
  FilterQuery,
  ApiResponse as CustomApiResponse,
} from '../interfaces/common.interface';

@ApiTags('Hospital Management')
@Controller('api/hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post()
  @ApiOperation({ summary: 'Create new hospital' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hospital created successfully',
  })
  async create(
    @Body() createHospitalDto: CreateHospitalDto,
  ): Promise<CustomApiResponse<any>> {
    const hospital = await this.hospitalService.create(createHospitalDto);
    return {
      success: true,
      data: hospital,
      message: 'Hospital created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all hospitals with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @Query() query: FilterQuery,
  ): Promise<CustomApiResponse<any[]>> {
    const result = await this.hospitalService.findAll(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hospital by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital retrieved successfully',
  })
  async findOne(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const hospital = await this.hospitalService.findOne(id);
    return {
      success: true,
      data: hospital,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update hospital' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ): Promise<CustomApiResponse<any>> {
    const hospital = await this.hospitalService.update(id, updateHospitalDto);
    return {
      success: true,
      data: hospital,
      message: 'Hospital updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete hospital' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hospital deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<CustomApiResponse<null>> {
    await this.hospitalService.remove(id);
    return {
      success: true,
      data: null,
      message: 'Hospital deleted successfully',
    };
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get hospital dashboard statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const dashboardData = await this.hospitalService.getDashboardStats(id);
    return {
      success: true,
      data: dashboardData,
    };
  }
}
