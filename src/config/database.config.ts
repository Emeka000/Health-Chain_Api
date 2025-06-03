import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Injectable } from '@nestjs/common';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const sslEnabled = configService.get('DB_SSL_ENABLED') === 'true';

  let sslConfig: any = undefined;

  // SSL Configuration for HIPAA Compliance
  if (sslEnabled) {
    const caPath = configService.get<string>('DB_SSL_CA_PATH');
    const certPath = configService.get<string>('DB_SSL_CERT_PATH');
    const keyPath = configService.get<string>('DB_SSL_KEY_PATH');

    sslConfig = {
      rejectUnauthorized:
        configService.get('DB_SSL_REJECT_UNAUTHORIZED') === 'true',
      ca: caPath ? readFileSync(caPath).toString() : undefined,
      cert: certPath ? readFileSync(certPath).toString() : undefined,
      key: keyPath ? readFileSync(keyPath).toString() : undefined,
    };
  }

  const dbPort = configService.get<string>('DB_PORT');
  const dbHost = configService.get<string>('DB_HOST');
  const dbUsername = configService.get<string>('DB_USERNAME');
  const dbPassword = configService.get<string>('DB_PASSWORD');
  const dbName = configService.get<string>('DB_NAME');

  return {
    type: 'postgres',
    host: dbHost || 'localhost',
    port: dbPort ? parseInt(dbPort, 10) : 5432,
    username: dbUsername || 'postgres',
    password: dbPassword || '',
    database: dbName || 'healthchain_db',

    // SSL Configuration
    ssl: sslConfig,

    // Connection Security
    extra: {
      // Connection pool configuration for security
      max: 10, // Maximum number of connections
      min: 2, // Minimum number of connections
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 5000, // Connection timeout

      // Security settings
      application_name: 'HealthChain-HIPAA-API',
      statement_timeout: 30000, // 30 second query timeout
      idle_in_transaction_session_timeout: 60000, // 1 minute idle transaction timeout
    },

    // Entity and migration configuration
    entities: [join(process.cwd(), 'src/**/*.entity{.ts,.js}')],
    migrations: [join(process.cwd(), 'src/migrations/*{.ts,.js}')],

    // HIPAA Compliance Settings
    synchronize: false, // Never auto-sync in production
    logging: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
    maxQueryExecutionTime: 5000, // Log slow queries

    // Connection retries
    retryAttempts: 3,
    retryDelay: 3000,

    // Connection naming for audit purposes
    name: 'default',
  };
};

export const getAuditDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const sslEnabled = configService.get('DB_SSL_ENABLED') === 'true';
  const auditDbName = configService.get<string>('DB_AUDIT_NAME');
  const defaultDbName = configService.get<string>('DB_NAME');

  let sslConfig: any = undefined;

  // SSL Configuration for HIPAA Compliance
  if (sslEnabled) {
    const caPath = configService.get<string>('DB_SSL_CA_PATH');
    const certPath = configService.get<string>('DB_SSL_CERT_PATH');
    const keyPath = configService.get<string>('DB_SSL_KEY_PATH');

    sslConfig = {
      rejectUnauthorized:
        configService.get('DB_SSL_REJECT_UNAUTHORIZED') === 'true',
      ca: caPath ? readFileSync(caPath).toString() : undefined,
      cert: certPath ? readFileSync(certPath).toString() : undefined,
      key: keyPath ? readFileSync(keyPath).toString() : undefined,
    };
  }

  const dbPort = configService.get<string>('DB_PORT');
  const dbHost = configService.get<string>('DB_HOST');
  const dbUsername = configService.get<string>('DB_USERNAME');
  const dbPassword = configService.get<string>('DB_PASSWORD');

  return {
    type: 'postgres',
    host: dbHost || 'localhost',
    port: dbPort ? parseInt(dbPort, 10) : 5432,
    username: dbUsername || 'postgres',
    password: dbPassword || '',
    database: auditDbName || `${defaultDbName || 'healthchain_db'}_audit`,

    // SSL Configuration
    ssl: sslConfig,

    // Connection Security
    extra: {
      // Connection pool configuration for security
      max: 10, // Maximum number of connections
      min: 2, // Minimum number of connections
      idleTimeoutMillis: 30000, // Close idle connections after 30s
      connectionTimeoutMillis: 5000, // Connection timeout

      // Security settings
      application_name: 'HealthChain-HIPAA-Audit-API',
      statement_timeout: 30000, // 30 second query timeout
      idle_in_transaction_session_timeout: 60000, // 1 minute idle transaction timeout
    },

    // Entity and migration configuration for audit
    entities: [join(process.cwd(), 'src/audit/**/*.entity{.ts,.js}')],
    migrations: [join(process.cwd(), 'src/migrations/*{.ts,.js}')],

    // HIPAA Compliance Settings for audit DB
    synchronize: false, // Never auto-sync in production
    logging: ['error', 'warn'], // Minimal logging for audit DB
    maxQueryExecutionTime: 5000, // Log slow queries

    // Connection retries
    retryAttempts: 3,
    retryDelay: 3000,

    // Connection naming for audit purposes
    name: 'audit',
  };
};
@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      username: this.configService.get('DB_USERNAME', 'postgres'),
      password: this.configService.get('DB_PASSWORD', 'password'),
      database: this.configService.get('DB_NAME', 'healthcare_nursing'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      synchronize: this.configService.get('NODE_ENV') === 'development',
      logging: this.configService.get('NODE_ENV') === 'development',
      ssl:
        this.configService.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
    };
  }
}
