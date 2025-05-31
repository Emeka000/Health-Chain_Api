import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BillingModule } from './modules/billing/billing.module';
import { MedicalStaffModule } from './medical-staff/medical-staff.module';
import { DataQualityModule } from './data-quality/data-quality.module';
import {
  getDatabaseConfig,
  getAuditDatabaseConfig,
} from './config/database.config';
import { EncryptionService } from './security/encryption.service';
import { AuditService } from './audit/audit.service';
import { AuditLog } from './audit/audit-log.entity';
import helmet from 'helmet';
import * as compression from 'compression';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),

    // Main database with HIPAA compliance
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Separate audit database
    TypeOrmModule.forRootAsync({
      name: 'audit',
      imports: [ConfigModule],
      useFactory: getAuditDatabaseConfig,
      inject: [ConfigService],
    }),

    // Rate limiting for security - Fixed API for v6.x
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: parseInt(configService.get('THROTTLE_TTL', '60'), 10) * 1000,
          limit: parseInt(configService.get('THROTTLE_LIMIT', '10'), 10),
        },
        {
          name: 'long',
          ttl: parseInt(configService.get('RATE_LIMIT_TTL', '60'), 10) * 1000,
          limit: parseInt(configService.get('RATE_LIMIT_LIMIT', '100'), 10),
        },
      ],
      inject: [ConfigService],
    }),

    // Scheduled tasks for maintenance
    ScheduleModule.forRoot(),

    // Audit log repository
    TypeOrmModule.forFeature([AuditLog], 'audit'),

    // Application modules
    BillingModule,
    MedicalStaffModule,
    DataQualityModule,
  ],
  controllers: [AppController],
  providers: [AppService, EncryptionService, AuditService],
  exports: [EncryptionService, AuditService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Security middleware
    consumer
      .apply(
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:'],
            },
          },
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
        }),
        compression({
          level: 6,
          threshold: 1024,
        }),
      )
      .forRoutes('*');
  }
}
