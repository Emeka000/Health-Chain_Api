export enum UserRole {
  ADMIN = 'admin',
  NURSE_MANAGER = 'nurse_manager',
  REGISTERED_NURSE = 'registered_nurse',
  LICENSED_PRACTICAL_NURSE = 'licensed_practical_nurse',
  CERTIFIED_NURSING_ASSISTANT = 'certified_nursing_assistant',
  SUPPORT_STAFF = 'support_staff',
}

export enum ShiftType {
  DAY = 'day',
  EVENING = 'evening',
  NIGHT = 'night',
  ROTATING = 'rotating',
}

export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AssignmentType {
  PATIENT = 'patient',
  DEPARTMENT = 'department',
  UNIT = 'unit',
}

export enum AssignmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  TRANSFERRED = 'transferred',
  CANCELLED = 'cancelled',
}

export enum CertificationType {
  RN = 'registered_nurse',
  LPN = 'licensed_practical_nurse',
  CNA = 'certified_nursing_assistant',
  BLS = 'basic_life_support',
  ACLS = 'advanced_cardiac_life_support',
  PALS = 'pediatric_advanced_life_support',
  CCRN = 'critical_care_registered_nurse',
  ONCOLOGY = 'oncology_certified_nurse',
  PEDIATRIC = 'pediatric_nurse',
  GERIATRIC = 'geriatric_nurse',
}

export enum SpecialtyType {
  ICU = 'intensive_care_unit',
  ER = 'emergency_room',
  SURGERY = 'surgery',
  PEDIATRICS = 'pediatrics',
  ONCOLOGY = 'oncology',
  CARDIOLOGY = 'cardiology',
  NEUROLOGY = 'neurology',
  ORTHOPEDICS = 'orthopedics',
  MATERNITY = 'maternity',
  GERIATRICS = 'geriatrics',
  MENTAL_HEALTH = 'mental_health',
}

export enum DocumentationType {
  CARE_PLAN = 'care_plan',
  NURSING_NOTES = 'nursing_notes',
  MEDICATION_ADMINISTRATION = 'medication_administration',
  VITAL_SIGNS = 'vital_signs',
  ASSESSMENT = 'assessment',
  DISCHARGE_PLANNING = 'discharge_planning',
  INCIDENT_REPORT = 'incident_report',
}

export enum QualityMetricType {
  PATIENT_SATISFACTION = 'patient_satisfaction',
  MEDICATION_ERRORS = 'medication_errors',
  FALL_PREVENTION = 'fall_prevention',
  INFECTION_CONTROL = 'infection_control',
  RESPONSE_TIME = 'response_time',
  DOCUMENTATION_COMPLIANCE = 'documentation_compliance',
  SHIFT_HANDOFF_QUALITY = 'shift_handoff_quality',
}

export enum PatientStatus {
  ADMITTED = 'admitted',
  DISCHARGED = 'discharged',
  TRANSFERRED = 'transferred',
  DECEASED = 'deceased',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  UNKNOWN = 'Unknown',
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
  DOMESTIC_PARTNERSHIP = 'domestic_partnership',
  OTHER = 'other',
}

export enum LanguagePreference {
  ENGLISH = 'english',
  SPANISH = 'spanish',
  FRENCH = 'french',
  GERMAN = 'german',
  CHINESE = 'chinese',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  RUSSIAN = 'russian',
  ARABIC = 'arabic',
  HINDI = 'hindi',
  PORTUGUESE = 'portuguese',
  OTHER = 'other',
}
