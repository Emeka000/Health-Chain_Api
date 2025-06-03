import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { NursesService } from './nurses.service';
import type { CreateNurseDto } from './dto/create-nurse.dto';
import type { UpdateNurseDto } from './dto/update-nurse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('nurses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nurses')
export class NursesController {
  constructor(private readonly nursesService: NursesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.NURSE_MANAGER)
  @ApiOperation({ summary: 'Create a new nurse' })
  @ApiResponse({ status: 201, description: 'Nurse created successfully' })
  create(@Body() createNurseDto: CreateNurseDto) {
    return this.nursesService.create(createNurseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all nurses' })
  @ApiResponse({ status: 200, description: 'List of nurses' })
  findAll(
    @Query('role') role?: string,
    @Query('specialty') specialty?: string,
    @Query('certification') certification?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.nursesService.findAll({
      role,
      specialty,
      certification,
      isActive,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get nurse by ID' })
  @ApiResponse({ status: 200, description: 'Nurse details' })
  findOne(@Param('id') id: string) {
    return this.nursesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.NURSE_MANAGER)
  @ApiOperation({ summary: 'Update nurse' })
  @ApiResponse({ status: 200, description: 'Nurse updated successfully' })
  update(@Param('id') id: string, @Body() updateNurseDto: UpdateNurseDto) {
    return this.nursesService.update(id, updateNurseDto);
  }
}
