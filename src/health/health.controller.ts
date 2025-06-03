import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BackupService } from '../backup/backup.service';

@ApiTags('System Health')
@Controller('health')
export class HealthController {
  constructor(private readonly backupService: BackupService) {}

  @Get('backup-status')
  @ApiOperation({ summary: 'Check backup system health' })
  async checkBackupHealth() {
    try {
      const lastBackup = await this.backupService.getLastBackup();
      return {
        status: lastBackup?.success ? 'healthy' : 'critical',
        lastBackup: lastBackup?.timestamp,
        verified: lastBackup?.verified,
        message: lastBackup?.message || 'Backup system operational',
      };
    } catch (error) {
      return {
        status: 'critical',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
