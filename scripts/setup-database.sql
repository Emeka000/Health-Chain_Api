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
