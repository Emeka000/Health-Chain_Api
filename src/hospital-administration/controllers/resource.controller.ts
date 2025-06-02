import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ResourceService } from '../services/resource.service';
import { FilterQuery, ApiResponse as CustomApiResponse } from '../interfaces/common.interface';

@ApiTags('Resource Management')
@Controller('api/resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @ApiOperation({ summary: 'Create new resource' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Resource created successfully' })
  async create(@Body() createResourceDto: any): Promise<CustomApiResponse<any>> {
    const resource = await this.resourceService.create(createResourceDto);
    return {
      success: true,
      data: resource,
      message: 'Resource created successfully'
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all resources' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(@Query() query: FilterQuery): Promise<CustomApiResponse<any[]>> {
    const result = await this.resourceService.findAll(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get resources with low stock' })
  async getLowStockResources(@Query() query: FilterQuery): Promise<CustomApiResponse<any[]>> {
    const resources = await this.resourceService.getLowStockResources(query);
    return {
      success: true,
      data: resources
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  async findOne(@Param('id') id: string): Promise<CustomApiResponse<any>> {
    const resource = await this.resourceService.findOne(id);
    return {
      success: true,
      data: resource
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update resource' })
  async update(@Param('id') id: string, @Body() updateDto: any): Promise<CustomApiResponse<any>> {
    const resource = await this.resourceService.update(id, updateDto);
    return {
      success: true,
      data: resource,
      message: 'Resource updated successfully'
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete resource' })
  async remove(@Param('id') id: string): Promise<CustomApiResponse<null>> {
    await this.resourceService.remove(id);
    return {
      success: true,
      data: null,
      message: 'Resource deleted successfully'
    };
  }

  @Post(':id/allocate')
  @ApiOperation({ summary: 'Allocate resource' })
  async allocateResource(@Param('id') id: string, @Body() allocationDto: any): Promise<CustomApiResponse<any>> {
    const allocation = await this.resourceService.allocateResource(id, allocationDto);
    return {
      success: true,
      data: allocation,
      message: 'Resource allocated successfully'
    };
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Return allocated resource' })
  async returnResource(@Param('id') id: string, @Body() returnDto: any): Promise<CustomApiResponse<any>> {
    const result = await this.resourceService.returnResource(id, returnDto);
    return {
      success: true,
      data: result,
      message: 'Resource returned successfully'
    };
  }

  @Get(':id/allocation-history')
  @ApiOperation({ summary: 'Get resource allocation history' })
  async getAllocationHistory(@Param('id') id: string, @Query() query: any): Promise<CustomApiResponse<any[]>> {
    const history = await this.resourceService.getAllocationHistory(id, query);
    return {
      success: true,
      data: history
    };
  }

  @Post(':id/adjust-stock')
  @ApiOperation({ summary: 'Adjust resource stock quantity' })
  async adjustStock(@Param('id') id: string, @Body() adjustmentDto: any): Promise<CustomApiResponse<any>> {
    const result = await this.resourceService.adjustStock(id, adjustmentDto);
    return {
      success: true,
      data: result,
      message: 'Stock adjusted successfully'
    };
  }
}