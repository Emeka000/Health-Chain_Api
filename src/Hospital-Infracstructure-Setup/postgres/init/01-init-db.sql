- Initialize Hospital Database with Encryption

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create encrypted storage for sensitive medical data
CREATE TABLE IF NOT EXISTS patient_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(50) NOT NULL UNIQUE,
    encrypted_data BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_hash VARCHAR(64) NOT NULL
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_id VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    old_values JSONB,
    new_values JSONB,
    ip_address INET
);

-- Create function for data encryption
CREATE OR REPLACE FUNCTION encrypt_medical_data(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, key, 'compress-algo=1, cipher-algo=aes256');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for data decryption
CREATE OR REPLACE FUNCTION decrypt_medical_data(encrypted_data BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, user_id, old_values, ip_address)
        VALUES (TG_TABLE_NAME, TG_OP, current_user, row_to_json(OLD), inet_client_addr());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, user_id, old_values, new_values, ip_address)
        VALUES (TG_TABLE_NAME, TG_OP, current_user, row_to_json(OLD), row_to_json(NEW), inet_client_addr());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, user_id, new_values, ip_address)
        VALUES (TG_TABLE_NAME, TG_OP, current_user, row_to_json(NEW), inet_client_addr());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to patient_records
CREATE TRIGGER patient_records_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON patient_records
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Set up Row Level Security
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;

-- Create policy for data access
CREATE POLICY patient_data_policy ON patient_records
    FOR ALL TO hospital_user
    USING (true)
    WITH CHECK (true);
