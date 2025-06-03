-- Create regulations table
CREATE TABLE regulations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    effective_date DATE NOT NULL,
    expiration_date DATE,
    regulatory_body VARCHAR(200) NOT NULL,
    metadata JSONB,
    version VARCHAR(20) NOT NULL,
    last_updated_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create compliance_requirements table
CREATE TABLE compliance_requirements (
    id SERIAL PRIMARY KEY,
    regulation_id INTEGER NOT NULL REFERENCES regulations(id),
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    compliance_level VARCHAR(50) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    implementation_guidance TEXT,
    assessment_frequency_days INTEGER NOT NULL,
    next_assessment_due DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    controls JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create compliance_assessments table
CREATE TABLE compliance_assessments (
    id SERIAL PRIMARY KEY,
    requirement_id INTEGER NOT NULL REFERENCES compliance_requirements(id),
    assessment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    score VARCHAR(50),
    assessed_by INTEGER NOT NULL,
    reviewed_by INTEGER,
    notes TEXT,
    evidence TEXT,
    documentation JSONB,
    score_percentage DECIMAL(5,2),
    remediation_required BOOLEAN DEFAULT false,
    remediation_deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create findings table
CREATE TABLE findings (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES compliance_assessments(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    identified_date DATE NOT NULL,
    due_date DATE NOT NULL,
    resolved_date DATE,
    identified_by INTEGER NOT NULL,
    assigned_to INTEGER,
    root_cause TEXT,
    business_impact TEXT,
    evidence JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create corrective_actions table
CREATE TABLE corrective_actions (
    id SERIAL PRIMARY KEY,
    finding_id INTEGER NOT NULL REFERENCES findings(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'planned',
    priority VARCHAR(50) NOT NULL,
    assigned_to INTEGER NOT NULL,
    assigned_by INTEGER NOT NULL,
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completed_date DATE,
    verified_date DATE,
    verified_by INTEGER,
    implementation_notes TEXT,
    verification_notes TEXT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) DEFAULT 'info',
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    regulation_id INTEGER REFERENCES regulations(id),
    description TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    metadata JSONB,
    phi_accessed BOOLEAN DEFAULT false,
    patient_id INTEGER,
    suspicious BOOLEAN DEFAULT false,
    risk_score DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create training_programs table
CREATE TABLE training_programs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    delivery_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    duration_hours DECIMAL(5,2) NOT NULL,
    mandatory BOOLEAN DEFAULT false,
    recertification_required BOOLEAN DEFAULT true,
    recertification_period_months INTEGER,
    passing_score DECIMAL(5,2) NOT NULL,
    max_attempts INTEGER DEFAULT 3,
    target_roles TEXT[],
    prerequisites TEXT[],
    learning_objectives TEXT,
    content JSONB,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create training_records table
CREATE TABLE training_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL REFERENCES training_programs(id),
    policy_id INTEGER,
    status VARCHAR(50) DEFAULT 'not_started',
    assigned_date DATE NOT NULL,
    started_date DATE,
    completion_date DATE,
    due_date DATE NOT NULL,
    expiration_date DATE,
    score DECIMAL(5,2),
    attempts INTEGER DEFAULT 0,
    time_spent_hours DECIMAL(5,2),
    instructor_id INTEGER,
    notes TEXT,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_number VARCHAR(100),
    completion_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, program_id)
);

-- Create competency_assessments table
CREATE TABLE competency_assessments (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL REFERENCES training_programs(id),
    competency_type VARCHAR(50) NOT NULL,
    assessment_method VARCHAR(50) NOT NULL,
    assessment_date DATE NOT NULL,
    competency_level VARCHAR(50) NOT NULL,
    assessor_id INTEGER NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    maximum_score DECIMAL(5,2) NOT NULL,
    competency_achieved BOOLEAN DEFAULT false,
    next_assessment_date DATE,
    strengths TEXT,
    improvement_areas TEXT,
    development_plan TEXT,
    assessment_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create policy_procedures table
CREATE TABLE policy_procedures (
    id SERIAL PRIMARY KEY,
    requirement_id INTEGER REFERENCES compliance_requirements(id),
    number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    version VARCHAR(20) NOT NULL,
    effective_date DATE NOT NULL,
    review_frequency_months INTEGER NOT NULL,
    next_review_date DATE NOT NULL,
    approved_by INTEGER,
    approval_date DATE,
    created_by INTEGER NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB,
    training_required BOOLEAN DEFAULT false,
    applicable_roles TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_regulations_type_status ON regulations(type, status);
CREATE INDEX idx_compliance_req_regulation_id ON compliance_requirements(regulation_id);
CREATE INDEX idx_compliance_assessments_requirement_id ON compliance_assessments(requirement_id);
CREATE INDEX idx_findings_assessment_id ON findings(assessment_id);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);
CREATE INDEX idx_audit_logs_phi_access ON audit_logs(phi_accessed, timestamp);
CREATE INDEX idx_training_records_employee ON training_records(employee_id, status);
CREATE INDEX idx_competency_assessments_employee ON competency_assessments(employee_id, assessment_date);