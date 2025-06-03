mport { Module } from '@nestjs/common';
import { TelehealthController } from './telehealth.controller';
import { TelehealthService } from './telehealth.service';

@Module({
  controllers: [TelehealthController],
  providers: [TelehealthService],
})
export class TelehealthModule {}

// modules/telehealth/telehealth.controller.ts
import { Controller, Get, Post, Put, Body, Param, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../../guards/auth.guard';
import { TelehealthService } from './telehealth.service';
import { CreateSessionDto, UpdateSessionDto, RemoteMonitoringDto } from './dto/telehealth.dto';

@ApiTags('Telehealth')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('telehealth')
export class TelehealthController {
  constructor(private telehealthService: