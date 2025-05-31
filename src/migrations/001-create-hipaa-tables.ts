import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHIPAATables1703168400000 implements MigrationInterface {
  name = 'CreateHIPAATables1703168400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable necessary PostgreSQL extensions
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    
    // Create audit logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'username',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'enum',
            enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS_ATTEMPT', 'EXPORT', 'PRINT', 'BACKUP', 'RESTORE'],
          },
          {
            name: 'result',
            type: 'enum',
            enum: ['SUCCESS', 'FAILURE', 'WARNING'],
          },
          {
            name: 'entityType',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'entityId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'oldValues',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'newValues',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sessionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'endpoint',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'httpMethod',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'statusCode',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'additionalData',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isPHIAccess',
            type: 'boolean',
            default: false,
          },
          {
            name: 'phiType',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'timestamp',
            type: 'bigint',
            default: 'EXTRACT(EPOCH FROM NOW())',
          },
        ],
      }),
      true,
    );

    // Create HIPAA-compliant doctors table
    await queryRunner.createTable(
      new Table({
        name: 'doctors_hipaa',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'employeeId',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: '_firstName',
            type: 'text',
            comment: 'Encrypted PHI field',
          },
          {
            name: '_lastName',
            type: 'text',
            comment: 'Encrypted PHI field',
          },
          {
            name: '_email',
            type: 'text',
            comment: 'Encrypted PHI field',
          },
          {
            name: 'emailHash',
            type: 'varchar',
            isUnique: true,
            comment: 'Hash for email lookups',
          },
          {
            name: '_phone',
            type: 'text',
            comment: 'Encrypted PHI field',
          },
          {
            name: '_dateOfBirth',
            type: 'text',
            comment: 'Encrypted PHI field',
          },
          {
            name: 'hireDate',
            type: 'date',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'],
            default: "'ACTIVE'",
          },
          {
            name: 'departmentId',
            type: 'varchar',
          },
          {
            name: '_credentials',
            type: 'text',
            isNullable: true,
            comment: 'Encrypted PHI field',
          },
          {
            name: '_contactInfo',
            type: 'text',
            isNullable: true,
            comment: 'Encrypted PHI field',
          },
          {
            name: '_notes',
            type: 'text',
            isNullable: true,
            comment: 'Encrypted PHI field',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'createdBy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isDeleted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'deletedBy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dataClassification',
            type: 'varchar',
            default: "'PHI'",
          },
          {
            name: 'sensitivityLevel',
            type: 'varchar',
            default: "'HIGH'",
          },
        ],
      }),
      true,
    );

    // Create indexes for audit logs using SQL commands
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_user_created" ON "audit_logs" ("userId", "createdAt");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_entity_created" ON "audit_logs" ("entityType", "entityId", "createdAt");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_action_created" ON "audit_logs" ("action", "createdAt");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_phi_access" ON "audit_logs" ("isPHIAccess", "createdAt");
    `);

    // Create indexes for doctors_hipaa using SQL commands
    await queryRunner.query(`
      CREATE INDEX "IDX_doctors_hipaa_employee_id" ON "doctors_hipaa" ("employeeId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_doctors_hipaa_email_hash" ON "doctors_hipaa" ("emailHash");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_doctors_hipaa_department" ON "doctors_hipaa" ("departmentId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_doctors_hipaa_status" ON "doctors_hipaa" ("status");
    `);

    // Enable Row Level Security (RLS) for HIPAA compliance
    await queryRunner.query('ALTER TABLE doctors_hipaa ENABLE ROW LEVEL SECURITY');
    await queryRunner.query('ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY');

    // Create security policies (these would be customized based on your authentication system)
    await queryRunner.query(`
      CREATE POLICY doctors_hipaa_select_policy ON doctors_hipaa
      FOR SELECT
      USING (true); -- Replace with actual user permission logic
    `);

    await queryRunner.query(`
      CREATE POLICY audit_logs_insert_policy ON audit_logs
      FOR INSERT
      WITH CHECK (true); -- Replace with actual user permission logic
    `);

    // Create trigger for automatic updatedAt timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updatedAt = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_doctors_hipaa_updated_at
      BEFORE UPDATE ON doctors_hipaa
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers and functions
    await queryRunner.query('DROP TRIGGER IF EXISTS update_doctors_hipaa_updated_at ON doctors_hipaa');
    await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column()');

    // Drop policies
    await queryRunner.query('DROP POLICY IF EXISTS doctors_hipaa_select_policy ON doctors_hipaa');
    await queryRunner.query('DROP POLICY IF EXISTS audit_logs_insert_policy ON audit_logs');

    // Drop tables
    await queryRunner.dropTable('doctors_hipaa');
    await queryRunner.dropTable('audit_logs');
  }
} 