# HIPAA-Compliant PostgreSQL Setup Guide

## Overview

This guide provides step-by-step instructions to configure a PostgreSQL database with medical-grade security and HIPAA compliance for your NestJS application.

## Prerequisites

- PostgreSQL 13+ with SSL support
- Node.js 18+
- NestJS application
- SSL certificates for database connections

## Environment Configuration

Create a `.env` file in your project root with the following variables:

```bash
# Application Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration - HIPAA Compliant PostgreSQL
DB_HOST=your-secure-db-host.com
DB_PORT=5432
DB_USERNAME=healthchain_user
DB_PASSWORD=your-super-secure-password-32-chars-min
DB_NAME=healthchain_hipaa_db
DB_AUDIT_NAME=healthchain_hipaa_audit_db

# Database SSL Configuration (Required for Production)
DB_SSL_ENABLED=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SSL_CA_PATH=/path/to/ca-certificate.crt
DB_SSL_CERT_PATH=/path/to/client-certificate.crt
DB_SSL_KEY_PATH=/path/to/client-key.key

# Encryption Configuration (Generate these with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your-32-character-encryption-key-here-change-this
ENCRYPTION_ALGORITHM=aes-256-gcm
FIELD_ENCRYPTION_KEY=your-field-level-encryption-key-32-chars
PHI_ENCRYPTION_KEY=your-phi-specific-encryption-key-here

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-minimum-32-characters
JWT_EXPIRATION_TIME=3600s
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key-minimum-32-characters
JWT_REFRESH_EXPIRATION_TIME=7d

# Security Configuration
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Audit Logging Configuration
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years for HIPAA compliance
AUDIT_LOG_MAX_FILES=100
AUDIT_LOG_MAX_SIZE=20m

# HIPAA Compliance Settings
HIPAA_COMPLIANCE_MODE=true
DATA_RETENTION_DAYS=2555  # 7 years
BACKUP_ENCRYPTION_ENABLED=true
SESSION_TIMEOUT_MINUTES=30
AUTOMATIC_LOGOUT_ENABLED=true
PASSWORD_COMPLEXITY_ENABLED=true

# Monitoring and Alerting
MONITORING_ENABLED=true
SECURITY_ALERTS_ENABLED=true
FAILED_LOGIN_THRESHOLD=5
ACCOUNT_LOCKOUT_DURATION_MINUTES=30

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM
BACKUP_RETENTION_DAYS=90
BACKUP_ENCRYPTION_KEY=your-backup-encryption-key-32-chars

# Disaster Recovery
DR_ENABLED=true
DR_REPLICATION_ENABLED=true
DR_BACKUP_LOCATION=/secure/backup/location
DR_RECOVERY_POINT_OBJECTIVE_HOURS=1
DR_RECOVERY_TIME_OBJECTIVE_HOURS=4
```

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Encryption Keys

```bash
# Generate encryption keys
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('FIELD_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('PHI_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('BACKUP_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 3. PostgreSQL Database Setup

#### Create Databases
```sql
-- Create main database
CREATE DATABASE healthchain_hipaa_db;

-- Create audit database
CREATE DATABASE healthchain_hipaa_audit_db;

-- Create dedicated user
CREATE USER healthchain_user WITH PASSWORD 'your-secure-password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE healthchain_hipaa_db TO healthchain_user;
GRANT ALL PRIVILEGES ON DATABASE healthchain_hipaa_audit_db TO healthchain_user;
```

#### Enable Required Extensions
```sql
-- Connect to main database
\c healthchain_hipaa_db;

-- Enable UUID and encryption extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Connect to audit database
\c healthchain_hipaa_audit_db;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 4. SSL Configuration

#### Generate SSL Certificates (for development)
```bash
# Create SSL directory
mkdir -p ssl

# Generate CA private key
openssl genrsa -out ssl/ca-key.pem 4096

# Generate CA certificate
openssl req -new -x509 -key ssl/ca-key.pem -out ssl/ca-cert.pem -days 365 \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=CA"

# Generate server private key
openssl genrsa -out ssl/server-key.pem 4096

# Generate server certificate signing request
openssl req -new -key ssl/server-key.pem -out ssl/server-req.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

# Generate server certificate
openssl x509 -req -in ssl/server-req.pem -CA ssl/ca-cert.pem \
  -CAkey ssl/ca-key.pem -out ssl/server-cert.pem -days 365 -CAcreateserial

# Generate client private key
openssl genrsa -out ssl/client-key.pem 4096

# Generate client certificate signing request
openssl req -new -key ssl/client-key.pem -out ssl/client-req.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=client"

# Generate client certificate
openssl x509 -req -in ssl/client-req.pem -CA ssl/ca-cert.pem \
  -CAkey ssl/ca-key.pem -out ssl/client-cert.pem -days 365 -CAcreateserial

# Set permissions
chmod 600 ssl/*.pem
```

#### Configure PostgreSQL for SSL
```bash
# Edit postgresql.conf
ssl = on
ssl_cert_file = '/path/to/server-cert.pem'
ssl_key_file = '/path/to/server-key.pem'
ssl_ca_file = '/path/to/ca-cert.pem'
ssl_crl_file = ''

# Edit pg_hba.conf
hostssl all healthchain_user 0.0.0.0/0 cert
```

### 5. Run Database Migrations

```bash
npm run migration:run
```

### 6. Create Log Directories

```bash
mkdir -p logs/audit
chmod 755 logs
chmod 755 logs/audit
```

## Security Features Implemented

### 1. Field-Level Encryption
- All PHI (Protected Health Information) fields are encrypted using AES-256
- Separate encryption keys for different data types
- Automatic encryption/decryption in entity getters/setters

### 2. Audit Logging
- Comprehensive audit trail for all data access and modifications
- Separate audit database for tamper-proof logging
- File-based logging with rotation and retention policies
- Special tracking for PHI access

### 3. Database Security
- SSL/TLS encryption for all database connections
- Row-level security (RLS) policies
- Database connection pooling with security limits
- Prepared statements to prevent SQL injection

### 4. Access Controls
- Rate limiting and throttling
- Session management with automatic timeouts
- Failed login attempt tracking
- IP address logging and monitoring

### 5. Data Protection
- Soft deletes for audit compliance
- Data classification and sensitivity labeling
- Backup encryption
- Disaster recovery planning

## Compliance Checklist

### HIPAA Technical Safeguards ✅

- [x] **Access Control**: Unique user identification, emergency access, automatic logoff, encryption
- [x] **Audit Controls**: Hardware, software, and procedural mechanisms for recording access
- [x] **Integrity**: PHI must not be improperly altered or destroyed
- [x] **Person or Entity Authentication**: Verify identity before access
- [x] **Transmission Security**: Guard against unauthorized access during transmission

### HIPAA Administrative Safeguards ✅

- [x] **Security Officer**: Designated security responsibility
- [x] **Workforce Training**: Security awareness and training
- [x] **Information Access Management**: Procedures for granting access to PHI
- [x] **Security Incident Procedures**: Procedures to address security incidents
- [x] **Contingency Plan**: Data backup, disaster recovery, and emergency procedures

### HIPAA Physical Safeguards ✅

- [x] **Facility Access Controls**: Procedures to limit physical access
- [x] **Workstation Use**: Procedures for workstation use and access to PHI
- [x] **Device and Media Controls**: Procedures for electronic media handling

## Testing the Implementation

### 1. Test Database Connection
```bash
npm run test:db-connection
```

### 2. Test Encryption
```bash
npm run test:encryption
```

### 3. Test Audit Logging
```bash
npm run test:audit
```

### 4. Test Security Middleware
```bash
npm run test:security
```

## Monitoring and Maintenance

### 1. Log Monitoring
- Monitor audit logs for suspicious activity
- Set up alerts for failed login attempts
- Track PHI access patterns

### 2. Security Updates
- Regularly update dependencies
- Apply security patches promptly
- Review and update encryption keys periodically

### 3. Backup Verification
- Test backup and restore procedures regularly
- Verify backup encryption
- Maintain offsite backup copies

### 4. Compliance Audits
- Conduct regular security assessments
- Review access logs quarterly
- Update policies and procedures as needed

## Troubleshooting

### Common Issues

1. **SSL Connection Errors**
   - Verify certificate paths and permissions
   - Check PostgreSQL SSL configuration
   - Ensure certificates are not expired

2. **Encryption Errors**
   - Verify encryption keys are 32 characters
   - Check environment variable configuration
   - Ensure EncryptionService is properly injected

3. **Audit Log Issues**
   - Check log directory permissions
   - Verify database connection to audit DB
   - Monitor disk space for log files

4. **Performance Issues**
   - Monitor database connection pool usage
   - Optimize queries with proper indexing
   - Consider read replicas for reporting

## Support and Documentation

For additional support and detailed documentation:
- Review NestJS TypeORM documentation
- Check PostgreSQL security documentation
- Consult HIPAA compliance guidelines
- Monitor security best practices updates

## Important Security Notes

⚠️ **WARNING**: This implementation provides a foundation for HIPAA compliance but should be reviewed by security professionals and legal experts before use in production with real PHI data.

🔒 **SECURITY**: Always use strong, unique passwords and regularly rotate encryption keys.

📋 **COMPLIANCE**: Ensure your organization has proper HIPAA policies, procedures, and staff training in place.

🔄 **MAINTENANCE**: Regularly update dependencies, monitor security advisories, and conduct security assessments. 