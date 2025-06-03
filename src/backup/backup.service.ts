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
    const command = `pg_dump -U ${this.config.get('DB_USERNAME')} -h ${this.config.get('DB_HOST')} ${this.config.get('DB_NAME')} > ${backupPath}`;

    return new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) reject(`Backup failed: ${error.message}`);
        else this.encryptBackup(backupPath).then(resolve).catch(reject);
      });
    });
  }
  private async encryptBackup(filePath: string) {
    // Implement AES-256 encryption (HIPAA requirement)
    const { encryptFile } = await import('crypto-utils');
    return encryptFile(filePath, this.config.get('BACKUP_ENCRYPTION_KEY'));
  }

  async getLastBackup(): Promise<{
    success: boolean;
    timestamp: string;
    verified?: boolean;
    message?: string;
  }> {
    // TODO: Implement actual logic to retrieve the last backup info
    return {
      success: true,
      timestamp: new Date().toISOString(),
      verified: true,
      message: 'Last backup was successful',
    };
  }
}
