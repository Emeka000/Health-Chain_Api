import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [BackupService],
})
export class BackupModule {}
