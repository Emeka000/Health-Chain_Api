import { Get } from '@nestjs/common';
import { BackupService } from '../backup/backup.service';

@Get('backup-status')
async checkBackupHealth() 