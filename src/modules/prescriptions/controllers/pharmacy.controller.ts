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
} from '@nestjs/common';
import { PharmacyService } from '../services/pharmacy.service';
import { CreatePharmacyDto } from '../dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from '../dto/update-pharmacy.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/enums/user-role.enum';

@Controller('pharmacies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacyService.create(createPharmacyDto);
  }

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST, UserRole.ADMIN)
  findAll(@Query('isActive') isActive?: boolean) {
    const filters: any = {};
    
    if (isActive !== undefined) {
      filters.isActive = isActive;
    }
    
    return this.pharmacyService.findAll(filters);
  }

  @Get('active')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findActive() {
    return this.pharmacyService.findActive();
  }

  @Get('integrated')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  getIntegratedPharmacies() {
    return this.pharmacyService.getIntegratedPharmacies();
  }

  @Get('search')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  searchNearby(@Query('zipCode') zipCode: string, @Query('radius') radius?: number) {
    return this.pharmacyService.searchNearby(zipCode, radius);
  }

  @Get(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
  update(@Param('id') id: string, @Body() updatePharmacyDto: UpdatePharmacyDto) {
    return this.pharmacyService.update(id, updatePharmacyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.pharmacyService.remove(id);
  }
}
