import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { AuditLog } from './entities/audit-log.entity';
import { SecurityIncident } from './entities/security-incident.entity';
import { MedicalDevice } from './entities/medical-device.entity';

// Services
import { EncryptionService } from './services/encryption.service';
import { AuditService } from './services/audit.service';
import { SecurityIncidentService } from './services/security-incident.service';
import { BreachNotificationService } from './services/breach-notification.service';
import { MedicalDeviceAuthService } from './services/medical-device-auth.service';

// Guards and Interceptors
import { HipaaAccessGuard } from './guards/hipaa-access.guard';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { SecurityMonitoringInterceptor } from './interceptors/security-monitoring.interceptor';

// Controllers
import { SecurityController } from './controllers/security.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'healthcare-api',
            ttl: 60000, // 1 minute
            limit: 100, // 100 requests per minute for general API
          },
          {
            name: 'medical-data',
            ttl: 60000,
            limit: 20, // Stricter limits for medical data access
          },
          {
            name: 'device-auth',
            ttl: 300000, // 5 minutes
            limit: 10, // Very strict for device authentication
          },
        ],
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m', // Short expiration for healthcare data
          algorithm: 'RS256', // Use RSA for better security
        },
      }),
    }),
    TypeOrmModule.forFeature([AuditLog, SecurityIncident, MedicalDevice]),
  ],
  providers: [
    EncryptionService,
    AuditService,
    SecurityIncidentService,
    BreachNotificationService,
    MedicalDeviceAuthService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: HipaaAccessGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityMonitoringInterceptor,
    },
  ],
  controllers: [SecurityController],
  exports: [
    EncryptionService,
    AuditService,
    SecurityIncidentService,
    BreachNotificationService,
    MedicalDeviceAuthService,
  ],
})
export class HealthcareSecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
