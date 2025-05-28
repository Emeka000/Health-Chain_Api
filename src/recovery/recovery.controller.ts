import { Controller, Post, Body } from '@nestjs/common';
import { RecoveryService } from './recovery.service';

@Controller('recovery')
export class RecoveryController {
    constructor(private readonly recoveryService: RecoveryService) {}
    @post('restore')
    async restore(@Body() { backupId }: { backupId: string }) {
        return this.recoveryService.restoreBackup(backupId);
      }
    }