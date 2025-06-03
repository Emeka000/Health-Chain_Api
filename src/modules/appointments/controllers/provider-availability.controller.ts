import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProviderAvailabilityService } from '../services/provider-availability.service';
import { CreateProviderAvailabilityDto } from '../dto/create-provider-availability.dto';
import { UpdateProviderAvailabilityDto } from '../dto/update-provider-availability.dto';
import { ProviderAvailability } from '../entities/provider-availability.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('provider-availability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('provider-availability')
export class ProviderAvailabilityController {
  constructor(
    private readonly providerAvailabilityService: ProviderAvailabilityService,
  ) {}

  @Post()
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Create a new provider availability' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The provider availability has been successfully created.',
    type: ProviderAvailability,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid provider availability data.',
  })
  create(
    @Body() createProviderAvailabilityDto: CreateProviderAvailabilityDto,
  ): Promise<ProviderAvailability> {
    return this.providerAvailabilityService.create(
      createProviderAvailabilityDto,
    );
  }

  @Get()
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({
    summary: 'Get all provider availabilities with optional filtering',
  })
  @ApiQuery({
    name: 'providerId',
    required: false,
    description: 'Filter by provider ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (ISO format)',
  })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    description: 'Filter by availability status',
  })
  @ApiQuery({
    name: 'isTelemedicineAvailable',
    required: false,
    description: 'Filter by telemedicine availability',
  })
  @ApiQuery({
    name: 'specialtiesAvailable',
    required: false,
    description: 'Filter by specialties (comma-separated)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of provider availabilities',
    type: [ProviderAvailability],
  })
  findAll(
    @Query('providerId') providerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('isAvailable') isAvailable?: string | boolean,
    @Query('isTelemedicineAvailable')
    isTelemedicineAvailable?: string | boolean,
    @Query('specialtiesAvailable') specialtiesAvailable?: string,
  ): Promise<ProviderAvailability[]> {
    const filters: any = {};

    if (providerId) filters.providerId = providerId;
    if (isAvailable !== undefined) {
      filters.isAvailable =
        isAvailable === true || isAvailable === 'true' || isAvailable === '1';
    }
    if (isTelemedicineAvailable !== undefined) {
      filters.isTelemedicineAvailable =
        isTelemedicineAvailable === true ||
        isTelemedicineAvailable === 'true' ||
        isTelemedicineAvailable === '1';
    }
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (specialtiesAvailable)
      filters.specialtiesAvailable = specialtiesAvailable.split(',');

    return this.providerAvailabilityService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get provider availability by ID' })
  @ApiParam({ name: 'id', description: 'Provider availability ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The provider availability',
    type: ProviderAvailability,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider availability not found',
  })
  findOne(@Param('id') id: string): Promise<ProviderAvailability> {
    return this.providerAvailabilityService.findOne(id);
  }

  @Get('provider/:providerId/date-range')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get provider availability by date range' })
  @ApiParam({ name: 'providerId', description: 'Provider ID' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date (ISO format)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of provider availabilities for the date range',
    type: [ProviderAvailability],
  })
  findByDateRange(
    @Param('providerId') providerId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ProviderAvailability[]> {
    return this.providerAvailabilityService.findByDateRange(
      providerId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('specialty/:specialty')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({
    summary: 'Find available providers by specialty and date range',
  })
  @ApiParam({ name: 'specialty', description: 'Medical specialty' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date (ISO format)',
  })
  @ApiQuery({
    name: 'isTelemedicine',
    required: false,
    description: 'Filter by telemedicine availability',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of provider availabilities matching the criteria',
    type: [ProviderAvailability],
  })
  findAvailableProvidersBySpecialty(
    @Param('specialty') specialty: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('isTelemedicine') isTelemedicine?: string | boolean,
  ): Promise<ProviderAvailability[]> {
    const isTelemed =
      isTelemedicine === true ||
      isTelemedicine === 'true' ||
      isTelemedicine === '1';

    return this.providerAvailabilityService.findAvailableProvidersBySpecialty(
      specialty,
      new Date(startDate),
      new Date(endDate),
      isTelemed,
    );
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update a provider availability' })
  @ApiParam({ name: 'id', description: 'Provider availability ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The provider availability has been successfully updated.',
    type: ProviderAvailability,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider availability not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid provider availability data',
  })
  update(
    @Param('id') id: string,
    @Body() updateProviderAvailabilityDto: UpdateProviderAvailabilityDto,
  ): Promise<ProviderAvailability> {
    return this.providerAvailabilityService.update(
      id,
      updateProviderAvailabilityDto,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Delete a provider availability' })
  @ApiParam({ name: 'id', description: 'Provider availability ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The provider availability has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Provider availability not found',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.providerAvailabilityService.remove(id);
  }
}
