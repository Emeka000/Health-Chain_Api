import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { MedicalLicenseService } from '../services/medical-license.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { CreateMedicalLicenseDto } from '../dto/create-medical-license.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly licenseService: MedicalLicenseService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  @Post(':userId/patient')
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  async createPatientProfile(
    @Param('userId') userId: string,
    @Body() createPatientDto: CreatePatientDto
  ) {
    return await this.userService.createPatient(userId, createPatientDto);
  }

  @Post(':userId/licenses')
  @Roles(UserRole.ADMIN)
  async addMedicalLicense(
    @Param('userId') userId: string,
    @Body() createLicenseDto: CreateMedicalLicenseDto
  ) {
    return await this.licenseService.createLicense(userId, createLicenseDto);
  }

  @Get('role/:role')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.SPECIALIST)
  async getUsersByRole(@Param('role') role: UserRole) {
    const users = await this.userService.getUsersByRole(role);
    return users.map(({ password, ...user }) => user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.SPECIALIST, UserRole.NURSE)
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    const { password, ...result } = user;
    return result;
  }

  @Put(':id/deactivate')
  @Roles(UserRole.ADMIN)
  async deactivateUser(
    @Param('id') id: string,
    @Body() body: { reason: string },
    @Request() req: any
  ) {
    return await this.userService.deactivateUser(id, req.user.id, body.reason);
  }

  @Put(':id/reactivate')
  @Roles(UserRole.ADMIN)
  async reactivateUser(@Param('id') id: string) {
    return await this.userService.reactivateUser(id);
  }

  @Put(':id/permissions')
  @Roles(UserRole.ADMIN)
  async updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissions: string[] }
  ) {
    return await this.userService.updateUserPermissions(id, body.permissions);
  }

  @Put(':id/verify')
  @Roles(UserRole.ADMIN)
  async verifyCredentials(
    @Param('id') id: string,
    @Request() req: any
  ) {
    return await this.userService.verifyUserCredentials(id, req.user.id);
  }

  @Get(':id/licenses')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.SPECIALIST)
  async getUserLicenses(@Param('id') id: string) {
    return await this.licenseService.getLicensesByUser(id);
  }

  @Put('licenses/:licenseId/verify')
  @Roles(UserRole.ADMIN)
  async verifyLicense(
    @Param('licenseId') licenseId: string,
    @Request() req: any
  ) {
    return await this.licenseService.verifyLicense(licenseId, req.user.id);
  }

  @Get('licenses/expiring')
  @Roles(UserRole.ADMIN)
  async getExpiringLicenses() {
    return await this.licenseService.getExpiringLicenses();
  }
}
