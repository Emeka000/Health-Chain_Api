import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BedService } from '../services/bed.service';
import { FilterQuery, ApiResponse as CustomApiResponse } from '../interfaces/common.interface';

@ApiTags('Bed Management')
@Controller('api/beds')
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Post()
  @ApiOperation({ summary: 'Create new bed' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Bed created successfully' })
  async create(@Body() createBedDto: any): Promise<CustomApiResponse<any>> {
    const bed = await this.bedService.create(createBedDto);
    return {
      success: true,
      data: bed,
      message: 'Bed created successfully'
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all beds' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(@Query() query: FilterQuery): Promise<CustomApiResponse<any[]>> {
    const result = await this.bedService.findAll(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available beds' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  async getAvailableBeds(@Query() query: FilterQuery): Promise<CustomApiResponse<any[]>> {
    const beds = await this.bedService.getAvailableBeds(query);
    return {
      success: true,
      data: beds
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bed by ID' })
  async findOne(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const bed = await this.bedService.findOne(id);
    return {
      success: true,
      data: bed
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bed' })
  async update(@Param('id') id: string, @Body() updateDto: any): Promise<CustomApiResponse<any>> {
    const bed = await this.bedService.update(id, updateDto);
    return {
      success: true,
      data: bed,
      message: 'Bed updated successfully'
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bed' })
  async remove(@Param('id') id: string): Promise<CustomApiResponse<null>> {
    await this.bedService.remove(id);
    return {
      success: true,
      data: null,
      message: 'Bed deleted successfully'
    };
  }

  @Post(':id/allocate')
  @ApiOperation({ summary: 'Allocate bed to patient' })
  async allocateBed(@Param('id') id: string, @Body() allocationDto: any): Promise<CustomApiResponse<any>> {
    const allocation = await this.bedService.allocateBed(id, allocationDto);
    return {
      success: true,
      data: allocation,
      message: 'Bed allocated successfully'
    };
  }

  @Post(':id/deallocate')
  @ApiOperation({ summary: 'Deallocate bed' })
  async deallocateBed(@Param('id') id: string, @Body() deallocationDto: any): Promise<CustomApiResponse<any>> {
    const result = await this.bedService.deallocateBed(id, deallocationDto);
    return {
      success: true,
      data: result,
      message: 'Bed deallocated successfully'
    };
  }

  @Get(':id/occupancy-history')
  @ApiOperation({ summary: 'Get bed occupancy history' })
  async getOccupancyHistory(@Param('id') id: string, @Query() query: any): Promise<CustomApiResponse<any[]>> {
    const history = await this.bedService.getOccupancyHistory(id, query);
    return {
      success: true,
      data: history
    };
  }
}