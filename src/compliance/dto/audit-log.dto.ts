import {
    IsString,
    IsEnum,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsObject,
    IsIP,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import {
    AuditEventType,
    AuditSeverity,
  } from '../entities/audit-log.entity';
  
  export class CreateAuditLogDto {
    @ApiPropertyOptional({ description: 'User ID (null for system events)' })
    @IsOptional()
    @IsNumber()
    userId?: number;
  
    @ApiPropertyOptional({ description: 'Session ID' })
    @IsOptional()
    @IsString()
    sessionId?: string;
  
    @ApiProperty({ enum: AuditEventType })
    @IsEnum(AuditEventType)
    eventType: AuditEventType;
  
    @ApiPropertyOptional({ enum: AuditSeverity, default: AuditSeverity.INFO })
    @IsOptional()
    @IsEnum(AuditSeverity)
    severity?: AuditSeverity = AuditSeverity.INFO;
  
    @ApiProperty({ example: 'patient_record', description: 'Type of resource accessed' })
    @IsString()
    resourceType: string;
  
    @ApiPropertyOptional({ example: '12345', description: 'Resource identifier' })
    @IsOptional()
    @IsString()
    resourceId?: string;
  
    @ApiPropertyOptional({ description: 'Related regulation ID' })
    @IsOptional()
    @IsNumber()
    regulationId?: number;
  
    @ApiProperty({ example: 'User accessed patient record', description: 'Event description' })
    @IsString()
    description: string;
  
    @ApiProperty({ example: '192.168.1.100', description: 'IP address' })
    @IsIP()
    ipAddress: string;
  
    @ApiPropertyOptional({ description: 'User agent string' })
    @IsOptional()
    @IsString()
    userAgent?: string;
  
    @ApiPropertyOptional({ description: 'Additional event metadata' })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
  
    @ApiPropertyOptional({ default: false, description: 'Whether PHI was accessed' })
    @IsOptional()
    @IsBoolean()
    phiAccessed?: boolean = false;
  
    @ApiPropertyOptional({ description: 'Patient ID if PHI was accessed' })
    @IsOptional()
    @IsNumber()
    patientId?: number;
  
    @ApiPropertyOptional({ default: false, description: 'Whether activity is suspicious' })
    @IsOptional()
    @IsBoolean()
    suspicious?: boolean = false;
  
    @ApiPropertyOptional({ description: 'Risk score (0-100)' })
    @IsOptional()
    @IsNumber()
    riskScore?: number;
  }