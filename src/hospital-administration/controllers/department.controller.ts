import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DepartmentService } from '../services/department.service';
import { FilterQuery, ApiResponse as CustomApiResponse } from '../interfaces/common.interface';

@ApiTags('Department Management')
@Controller('api/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Department created successfully' })
  async create(@Body() createDepartmentDto: any): Promise<CustomApiResponse<any>> {
    const department = await this.departmentService.create(createDepartmentDto);
    return {
      success: true,
      data: department,
      message: 'Department created successfully'
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiQuery({ name: 'hospitalId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(@Query() query: FilterQuery): Promise<CustomApiResponse<any[]>> {
    const result = await this.departmentService.findAll(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  async findOne(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const department = await this.departmentService.findOne(id);
    return {
      success: true,
      data: department
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update department' })
  async update(@Param('id') id: string, @Body() updateDto: any): Promise<CustomApiResponse<any>> {
    const department = await this.departmentService.update(id, updateDto);
    return {
      success: true,
      data: department,
      message: 'Department updated successfully'
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department' })
  async remove(@Param('id') id: string): Promise<CustomApiResponse<null>> {
    await this.departmentService.remove(id);
    return {
      success: true,
      data: null,
      message: 'Department deleted successfully'
    };
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get department statistics' })
  async getStats(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const stats = await this.departmentService.getStats(id);
    return {
      success: true,
      data: stats
    };
  }
}
