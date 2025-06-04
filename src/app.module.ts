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
import { ComplianceModule } from './compliance/compliance.module';
import {
  getDatabaseConfig,
  getAuditDatabaseConfig,
} from './config/database.config';
import { EncryptionService } from './security/encryption.service';
import { AuditService } from './audit/audit.service';
import { AuditLog } from './audit/audit-log.entity';
import { LabModule } from './lab/lab.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { PharmacysModule } from './pharmacys/pharmacys.module';
import { MarModule } from './mar/mar.module';
import { EmergencyModule } from './emergency/emergency.module';
import helmet from 'helmet';
import * as compression from 'compression';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { NursesModule } from './modules/nurses/nurses.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { StaffModule } from './modules/staff/staff.module';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { QualityMetricsModule } from './modules/quality-metrics/quality-metrics.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { AuditModule } from './modules/audit/audit.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { InventoryModule } from './inventory/inventory.module';
import { VendorModule } from './vendor/vendor.module';
import { RecallModule } from './recall/recall.module';
import { WasteModule } from './waste/waste.module';
import { Drug } from './pharmacy/entities/drug.entity';
import { Vendor } from './vendor/entities/vendor.entity';
import { Recall } from './recall/entities/recall.entity';
import { RoleModule } from './role/role.module';
import { FhirModule } from './fhir/fhir.module';
import { ConsentModule } from './consent/consent.module';
import { EncryptionModule } from './modules/encryption/encryption.module';
import { PatientManagementModule } from './patient-management/patient-management.module';

@Module({
  imports: [
    // Global configuration
    ScheduleModule.forRoot(),
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
    TypeOrmModule.forFeature([AuditLog, Drug, Vendor, Recall], 'audit'),

    // Application modules
    BillingModule,
    MedicalStaffModule,
    // TODO: Fix this import or remove if not needed
    PharmacyModule,
    DataQualityModule,
    LabModule,
    PharmacysModule,
    ComplianceModule,
    MarModule,
    EmergencyModule,
    InventoryModule,
    VendorModule,
    RecallModule,
    WasteModule,
    RoleModule,
    FhirModule,
    ConsentModule,
    EncryptionModule,
    PrescriptionsModule,
    PatientManagementModule,
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

// This appears to be the active module configuration
// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: '.env',
//     }),
//     TypeOrmModule.forRootAsync({
//       useClass: DatabaseConfig,
//     }),
//     ScheduleModule.forRoot(),
//     EventEmitterModule.forRoot(),
//     AuthModule,
//     NursesModule,
//     ShiftsModule,
//     AssignmentsModule,
//     StaffModule,
//     DocumentationModule,
//     QualityMetricsModule,
//     PatientsModule,
//     DepartmentsModule,
//     AuditModule,
//     PrescriptionsModule,
//   ],
// })
// export class AppModule {}
