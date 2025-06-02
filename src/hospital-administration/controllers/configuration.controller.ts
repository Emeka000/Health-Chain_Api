import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigurationService } from '../services/configuration.service';
import { FilterQuery, ApiResponse as CustomApiResponse } from '../interfaces/common.interface';

@ApiTags('System Configuration')
@Controller('api/configuration')
@ApiBearerAuth()
// @UseGuards(AdminGuard)
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system configurations' })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllConfigurations(@Query() query: FilterQuery): Promise<CustomApiResponse<any[]>> {
    const result = await this.configurationService.getAllConfigurations(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  @Get('types')
  @ApiOperation({ summary: 'Get configuration types' })
  async getConfigurationTypes(): Promise<CustomApiResponse<any[]>> {
    const types = await this.configurationService.getConfigurationTypes();
    return {
      success: true,
      data: types
    };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get configuration by key' })
  async getConfiguration(@Param('key') key: string): Promise<CustomApiResponse<any>> {
    const config = await this.configurationService.getConfiguration(key);
    return {
      success: true,
      data: config
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new configuration' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Configuration created successfully' })
  async createConfiguration(@Body() createConfigDto: any): Promise<CustomApiResponse<any>> {
    const config = await this.configurationService.createConfiguration(createConfigDto);
    return {
      success: true,
      data: config,
      message: 'Configuration created successfully'
    };
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update configuration' })
  async updateConfiguration(
    @Param('key') key: string,
    @Body() updateDto: any
  ): Promise<CustomApiResponse<any>> {
    const config = await this.configurationService.updateConfiguration(key, updateDto);
    return {
      success: true,
      data: config,
      message: 'Configuration updated successfully'
    };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete configuration' })
  async deleteConfiguration(@Param('key') key: string): Promise<CustomApiResponse<null>> {
    await this.configurationService.deleteConfiguration(key);
    return {
      success: true,
      data: null,
      message: 'Configuration deleted successfully'
    };
  }

  @Post('reset-defaults')
  @ApiOperation({ summary: 'Reset configurations to default values' })
  async resetToDefaults(@Body() resetDto: { keys?: string[] }): Promise<CustomApiResponse<any>> {
    const result = await this.configurationService.resetToDefaults(resetDto.keys);
    return {
      success: true,
      data: result,
      message: 'Configurations reset to defaults successfully'
    };
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update configurations' })
  async bulkUpdateConfigurations(@Body() bulkUpdateDto: any[]): Promise<CustomApiResponse<any>> {
    const result = await this.configurationService.bulkUpdateConfigurations(bulkUpdateDto);
    return {
      success: true,
      data: result,
      message: 'Configurations updated successfully'
    };
  }

  @Get('audit/history')
  @ApiOperation({ summary: 'Get configuration change history' })
  @ApiQuery({ name: 'key', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  async getConfigurationHistory(@Query() query: FilterQuery): Promise<CustomApiResponse<any[]>> {
    const history = await this.configurationService.getConfigurationHistory(query);
    return {
      success: true,
      data: history
    };
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate configuration values' })
  async validateConfigurations(@Body() configsToValidate: any[]): Promise<CustomApiResponse<any>> {
    const validation = await this.configurationService.validateConfigurations(configsToValidate);
    return {
      success: true,
      data: validation
    };
  }

  @Post('backup')
  @ApiOperation({ summary: 'Create configuration backup' })
  async createBackup(): Promise<CustomApiResponse<any>> {
    const backup = await this.configurationService.createBackup();
    return {
      success: true,
      data: backup,
      message: 'Configuration backup created successfully'
    };
  }

  @Post('restore')
  @ApiOperation({ summary: 'Restore configuration from backup' })
  async restoreFromBackup(@Body() restoreDto: { backupId: string }): Promise<CustomApiResponse<any>> {
    const result = await this.configurationService.restoreFromBackup(restoreDto.backupId);
    return {
      success: true,
      data: result,
      message: 'Configuration restored successfully'
    };
  }

  // Specific configuration endpoints for common settings
  @Get('hospital/general')
  @ApiOperation({ summary: 'Get general hospital settings' })
  async getHospitalSettings(): Promise<CustomApiResponse<any>> {
    const settings = await this.configurationService.getHospitalSettings();
    return {
      success: true,
      data: settings
    };
  }

  @Put('hospital/general')
  @ApiOperation({ summary: 'Update general hospital settings' })
  async updateHospitalSettings(@Body() settingsDto: any): Promise<CustomApiResponse<any>> {
    const settings = await this.configurationService.updateHospitalSettings(settingsDto);
    return {
      success: true,
      data: settings,
      message: 'Hospital settings updated successfully'
    };
  }

  @Get('billing/settings')
  @ApiOperation({ summary: 'Get billing configuration' })
  async getBillingSettings(): Promise<CustomApiResponse<any>> {
    const settings = await this.configurationService.getBillingSettings();
    return {
      success: true,
      data: settings
    };
  }

  @Put('billing/settings')
  @ApiOperation({ summary: 'Update billing configuration' })
  async updateBillingSettings(@Body() settingsDto: any): Promise<CustomApiResponse<any>> {
    const settings = await this.configurationService.updateBillingSettings(settingsDto);
    return {
      success: true,
      data: settings,
      message: 'Billing settings updated successfully'
    };
  }

  @Get('notifications/settings')
  @ApiOperation({ summary: 'Get notification settings' })
  async getNotificationSettings(): Promise<CustomApiResponse<any>> {
    const settings = await this.configurationService.getNotificationSettings();
    return {
      success: true,
      data: settings
    };
  }

  @Put('notifications/settings')
  @ApiOperation({ summary: 'Update notification settings' })
  async updateNotificationSettings(@Body() settingsDto: any): Promise<CustomApiResponse<any>> {
    const settings = await this.configurationService.updateNotificationSettings(settingsDto);
    return {
      success: true,
      data: settings,
      message: 'Notification settings updated successfully'
    };
  }

  @Get('security/settings')
  @ApiOperation({ summary: 'Get security settings' })
  async getSecuritySettings(): Promise<CustomApiResponse<any>> {
    const settings = await this.configurationService.getSecuritySettings();
    return {
      success: true,
      data: settings
    };
  }

  @Put('security/settings')
  @ApiOperation({ summary: 'Update security settings' })
  async updateSecuritySettings(@Body() settingsDto: any): Promise<CustomApiResponse<any>> {
    const settings = await this.configurationService.updateSecuritySettings(settingsDto);
    return {
      success: true,
      data: settings,
      message: 'Security settings updated successfully'
    };
  }

  @Post('test-connection')
  @ApiOperation({ summary: 'Test external system connections' })
  async testConnections(@Body() testDto: { systems: string[] }): Promise<CustomApiResponse<any>> {
    const results = await this.configurationService.testConnections(testDto.systems);
    return {
      success: true,
      data: results
    };
  }

  @Get('system/health')
  @ApiOperation({ summary: 'Get system health status' })
  async getSystemHealth(): Promise<CustomApiResponse<any>> {
    const health = await this.configurationService.getSystemHealth();
    return {
      success: true,
      data: health
    };
  }
}