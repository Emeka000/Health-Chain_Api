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
import { StaffService } from '../services/staff.service';
import {
  FilterQuery,
  ApiResponse as CustomApiResponse,
} from '../interfaces/common.interface';

@ApiTags('Staff Management')
@Controller('api/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Create new staff member' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Staff member created successfully',
  })
  async create(@Body() createStaffDto: any): Promise<CustomApiResponse<any>> {
    const staff = await this.staffService.create(createStaffDto);
    return {
      success: true,
      data: staff,
      message: 'Staff member created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all staff members' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @Query() query: FilterQuery,
  ): Promise<CustomApiResponse<any[]>> {
    const result = await this.staffService.findAll(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff member by ID' })
  async findOne(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const staff = await this.staffService.findOne(id);
    return {
      success: true,
      data: staff,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update staff member' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
  ): Promise<CustomApiResponse<any>> {
    const staff = await this.staffService.update(id, updateDto);
    return {
      success: true,
      data: staff,
      message: 'Staff member updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff member' })
  async remove(@Param('id') id: string): Promise<CustomApiResponse<null>> {
    await this.staffService.remove(id);
    return {
      success: true,
      data: null,
      message: 'Staff member deleted successfully',
    };
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Create staff schedule' })
  async createSchedule(
    @Param('id') id: string,
    @Body() scheduleDto: any,
  ): Promise<CustomApiResponse<any>> {
    const schedule = await this.staffService.createSchedule(id, scheduleDto);
    return {
      success: true,
      data: schedule,
      message: 'Schedule created successfully',
    };
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get staff schedule' })
  async getSchedule(
    @Param('id') id: string,
    @Query() query: any,
  ): Promise<CustomApiResponse<any>> {
    const schedule = await this.staffService.getSchedule(id, query);
    return {
      success: true,
      data: schedule,
    };
  }
}
