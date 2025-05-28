import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BackupService {
  constructor(private config: ConfigService) {}
  async createDatabaseBackup() {
    const backupDir = this.config.get('BACKUP_DIR') || './backups';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `medical-backup-${timestamp}.sql`;
    const backupPath = path.join(backupDir, filename);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }