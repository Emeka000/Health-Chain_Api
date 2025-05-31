#!/bin/bash

# HIPAA-Compliant PostgreSQL Setup Script
# This script automates the setup process for HIPAA compliance

set -e

echo "🏥 Starting HIPAA-Compliant PostgreSQL Setup..."
echo "================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
}

# Check if PostgreSQL is installed
check_postgresql() {
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version | awk '{print $3}')
        print_status "PostgreSQL is installed: $PG_VERSION"
    else
        print_warning "PostgreSQL is not installed or not in PATH."
        print_info "Please install PostgreSQL 13+ before continuing."
    fi
}

# Generate secure encryption keys
generate_keys() {
    print_info "Generating secure encryption keys..."
    
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    FIELD_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    PHI_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    BACKUP_ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    print_status "Encryption keys generated successfully"
}

# Create .env file
create_env_file() {
    print_info "Creating .env file..."
    
    if [ -f .env ]; then
        print_warning ".env file already exists. Creating backup..."
        mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    cat > .env << EOF
# Application Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration - HIPAA Compliant PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=healthchain_user
DB_PASSWORD=change_this_secure_password_32_chars_min
DB_NAME=healthchain_hipaa_db
DB_AUDIT_NAME=healthchain_hipaa_audit_db

# Database SSL Configuration (Required for Production)
DB_SSL_ENABLED=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SSL_CA_PATH=./ssl/ca-cert.pem
DB_SSL_CERT_PATH=./ssl/client-cert.pem
DB_SSL_KEY_PATH=./ssl/client-key.pem

# Encryption Configuration
ENCRYPTION_KEY=${ENCRYPTION_KEY}
ENCRYPTION_ALGORITHM=aes-256-gcm
FIELD_ENCRYPTION_KEY=${FIELD_ENCRYPTION_KEY}
PHI_ENCRYPTION_KEY=${PHI_ENCRYPTION_KEY}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION_TIME=3600s
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
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
AUDIT_LOG_RETENTION_DAYS=2555
AUDIT_LOG_MAX_FILES=100
AUDIT_LOG_MAX_SIZE=20m

# HIPAA Compliance Settings
HIPAA_COMPLIANCE_MODE=true
DATA_RETENTION_DAYS=2555
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
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=90
BACKUP_ENCRYPTION_KEY=${BACKUP_ENCRYPTION_KEY}

# Disaster Recovery
DR_ENABLED=true
DR_REPLICATION_ENABLED=true
DR_BACKUP_LOCATION=./backups
DR_RECOVERY_POINT_OBJECTIVE_HOURS=1
DR_RECOVERY_TIME_OBJECTIVE_HOURS=4
EOF
    
    print_status ".env file created successfully"
}

# Install npm dependencies
install_dependencies() {
    print_info "Installing npm dependencies..."
    
    if npm install; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Generate SSL certificates for development
generate_ssl_certificates() {
    print_info "Generating SSL certificates for development..."
    
    # Create SSL directory
    mkdir -p ssl
    
    # Generate CA private key
    openssl genrsa -out ssl/ca-key.pem 4096 2>/dev/null
    
    # Generate CA certificate
    openssl req -new -x509 -key ssl/ca-key.pem -out ssl/ca-cert.pem -days 365 \
        -subj "/C=US/ST=State/L=City/O=HealthChain/OU=Development/CN=CA" 2>/dev/null
    
    # Generate server private key
    openssl genrsa -out ssl/server-key.pem 4096 2>/dev/null
    
    # Generate server certificate signing request
    openssl req -new -key ssl/server-key.pem -out ssl/server-req.pem \
        -subj "/C=US/ST=State/L=City/O=HealthChain/OU=Development/CN=localhost" 2>/dev/null
    
    # Generate server certificate
    openssl x509 -req -in ssl/server-req.pem -CA ssl/ca-cert.pem \
        -CAkey ssl/ca-key.pem -out ssl/server-cert.pem -days 365 -CAcreateserial 2>/dev/null
    
    # Generate client private key
    openssl genrsa -out ssl/client-key.pem 4096 2>/dev/null
    
    # Generate client certificate signing request
    openssl req -new -key ssl/client-key.pem -out ssl/client-req.pem \
        -subj "/C=US/ST=State/L=City/O=HealthChain/OU=Development/CN=client" 2>/dev/null
    
    # Generate client certificate
    openssl x509 -req -in ssl/client-req.pem -CA ssl/ca-cert.pem \
        -CAkey ssl/ca-key.pem -out ssl/client-cert.pem -days 365 -CAcreateserial 2>/dev/null
    
    # Set proper permissions
    chmod 600 ssl/*.pem
    
    # Clean up temporary files
    rm -f ssl/*.req ssl/*.srl
    
    print_status "SSL certificates generated successfully"
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    
    # Create log directories
    mkdir -p logs/audit
    mkdir -p backups
    
    # Set proper permissions
    chmod 755 logs
    chmod 755 logs/audit
    chmod 755 backups
    
    print_status "Directories created successfully"
}

# Create database setup script
create_db_script() {
    print_info "Creating database setup script..."
    
    cat > scripts/setup-database.sql << 'EOF'
-- HIPAA-Compliant Database Setup Script

-- Create main database
CREATE DATABASE healthchain_hipaa_db;

-- Create audit database  
CREATE DATABASE healthchain_hipaa_audit_db;

-- Create dedicated user
CREATE USER healthchain_user WITH PASSWORD 'change_this_secure_password_32_chars_min';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE healthchain_hipaa_db TO healthchain_user;
GRANT ALL PRIVILEGES ON DATABASE healthchain_hipaa_audit_db TO healthchain_user;

-- Connect to main database
\c healthchain_hipaa_db;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant usage on extensions
GRANT USAGE ON SCHEMA public TO healthchain_user;
GRANT CREATE ON SCHEMA public TO healthchain_user;

-- Connect to audit database
\c healthchain_hipaa_audit_db;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant usage on extensions
GRANT USAGE ON SCHEMA public TO healthchain_user;
GRANT CREATE ON SCHEMA public TO healthchain_user;

\echo 'Database setup completed successfully!'
EOF
    
    print_status "Database setup script created"
}

# Create package.json scripts
add_npm_scripts() {
    print_info "Adding npm scripts for HIPAA operations..."
    
    # Check if package.json exists
    if [ ! -f package.json ]; then
        print_error "package.json not found"
        return 1
    fi
    
    # Add migration script if not exists
    if ! grep -q "migration:run" package.json; then
        # Use a temporary file to add the script
        cat package.json | jq '.scripts["migration:run"] = "typeorm migration:run"' > temp_package.json
        mv temp_package.json package.json
    fi
    
    print_status "npm scripts added successfully"
}

# Main setup function
main() {
    echo
    print_info "Checking system requirements..."
    check_node
    check_postgresql
    
    echo
    print_info "Setting up HIPAA-compliant configuration..."
    generate_keys
    create_env_file
    
    echo
    print_info "Installing dependencies..."
    install_dependencies
    
    echo
    print_info "Setting up SSL certificates..."
    generate_ssl_certificates
    
    echo
    print_info "Creating directories and scripts..."
    create_directories
    create_db_script
    add_npm_scripts
    
    echo
    print_status "HIPAA-compliant setup completed successfully!"
    echo
    echo "================================================="
    echo "🎉 Setup Complete!"
    echo "================================================="
    echo
    print_info "Next steps:"
    echo "1. Review and update the .env file with your specific configuration"
    echo "2. Update the database password in .env and scripts/setup-database.sql"
    echo "3. Run the database setup script: psql -U postgres -f scripts/setup-database.sql"
    echo "4. Run database migrations: npm run migration:run"
    echo "5. Start your application: npm run start:dev"
    echo
    print_warning "Important Security Notes:"
    echo "- Change all default passwords before production use"
    echo "- Review SSL certificate configuration for production"
    echo "- Ensure proper backup and monitoring procedures"
    echo "- Have security professionals review the implementation"
    echo
    print_info "For detailed documentation, see HIPAA_SETUP.md"
    echo
}

# Run main function
main "$@" 