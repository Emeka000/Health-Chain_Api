import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Injectable()
export class BackupTasks { 
  constructor(private readonly backupService: BackupService) {}

  @Cron('0 0 * * *') // Every day at midnight
  async handleCron() {
    try {
      await this.backupService.createDatabaseBackup();
      console.log('Database backup created successfully');
    } catch (error) {
      console.error('Error creating database backup:', error);
    }
  }
}