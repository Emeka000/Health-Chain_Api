import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { join } from 'path';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  const sslEnabled = configService.get('DB_SSL_ENABLED') === 'true';

  let sslConfig: any = undefined;
  
  // SSL Configuration for HIPAA Compliance
  if (sslEnabled) {
    sslConfig = {
      rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED') === 'true',
      ca: configService.get('DB_SSL_CA_PATH') 
        ? readFileSync(configService.get('DB_SSL_CA_PATH')).toString()
        : undefined,
      cert: configService.get('DB_SSL_CERT_PATH')
        ? readFileSync(configService.get('DB_SSL_CERT_PATH')).toString()
        : undefined,
      key: configService.get('DB_SSL_KEY_PATH')
        ? readFileSync(configService.get('DB_SSL_KEY_PATH')).toString()
        : undefined,
    };
  }

  return {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT'), 10),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    
    // SSL Configuration
    ssl: sslConfig,
    
    // Connection Security
    extra: {
      // Connection pool configuration for security
      max: 10, // Maximum number of connections
      min: 2,  // Minimum number of connections
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

export const getAuditDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const mainConfig = getDatabaseConfig(configService);
  
  return {
    ...mainConfig,
    name: 'audit',
    database: configService.get('DB_AUDIT_NAME') || `${configService.get('DB_NAME')}_audit`,
    entities: [join(process.cwd(), 'src/audit/**/*.entity{.ts,.js}')],
    synchronize: false,
    logging: ['error', 'warn'], // Minimal logging for audit DB
  };
}; 