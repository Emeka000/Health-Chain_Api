import { Get } from '@nestjs/common';
import { BackupService } from '../backup/backup.service';

@Get('backup-status')
async checkBackupHealth() {
    const lastBackup = await this.backupService.getLastBackup();
  return {
    status: lastBackup?.success ? 'healthy' : 'critical',
    lastBackup: lastBackup?.timestamp,
    verified: lastBackup?.verified
  };
}
}