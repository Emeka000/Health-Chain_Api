import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  AfterLoad,
  Unique,
} from 'typeorm';
import { PatientStatus, Priority, BloodType, MaritalStatus, LanguagePreference } from '../../../common/enums';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Documentation } from '../../documentation/entities/documentation.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Entity('patients')
@Unique(['medicalRecordNumber'])
@Index(['lastName', 'firstName', 'dateOfBirth']) // Index for faster patient searches
@Index(['phoneNumber']) // Index for contact searches
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  medicalRecordNumber: string;
  
  // Identifier hash for duplicate detection
  @Column({ nullable: true })
  identifierHash: string;
  
  // Photo and identification
  @Column({ nullable: true })
  photoUrl: string;
  
  @Column({ nullable: true })
  identificationDocumentUrl: string;
  
  @Column({ default: false })
  identityVerified: boolean;
  
  @Column({ nullable: true })
  identificationVerifiedBy: string;
  
  @Column({ nullable: true })
  identificationVerifiedDate: Date;
  
  @Column({ type: 'json', nullable: true })
  documents: Array<{
    url: string;
    type: string;
    description: string;
    uploadDate: Date;
  }>;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column()
  gender: string;
  
  @Column({ nullable: true })
  pronouns: string;
  
  @Column({ nullable: true })
  ssn: string; // Social Security Number (encrypted)
  
  @Column({ nullable: true })
  email: string;
  
  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'json', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    addressType: string; // 'Home', 'Work', 'Temporary'
  };
  
  @Column({ type: 'json', nullable: true })
  previousAddresses: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    addressType: string;
    startDate: Date;
    endDate: Date;
  }[];

  @Column({ type: 'json', nullable: true })
  emergencyContacts: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    address?: string;
    isPrimary: boolean;
  }[];
  
  @Column({ type: 'enum', enum: MaritalStatus, nullable: true })
  maritalStatus: MaritalStatus;
  
  @Column({ nullable: true })
  occupation: string;
  
  @Column({ nullable: true })
  employer: string;
  
  @Column({ nullable: true })
  employerPhone: string;
  
  @Column({ type: 'enum', enum: LanguagePreference, default: LanguagePreference.ENGLISH })
  preferredLanguage: LanguagePreference;
  
  @Column({ default: false })
  needsInterpreter: boolean;
  
  @Column({ nullable: true })
  ethnicity: string;
  
  @Column({ nullable: true })
  race: string;
  
  @Column({ type: 'enum', enum: BloodType, nullable: true })
  bloodType: BloodType;
  
  @Column({ nullable: true })
  organDonor: boolean;
  
  @Column({ nullable: true })
  height: number; // in cm
  
  @Column({ nullable: true })
  weight: number; // in kg
  
  @Column({ nullable: true })
  bmi: number;

  @Column({ type: 'timestamp' })
  admissionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  dischargeDate: Date;
  
  @Column({ nullable: true })
  expectedDischargeDate: Date;
  
  @Column({ nullable: true })
  dischargingPhysician: string;
  
  @Column({ nullable: true })
  dischargeReason: string;
  
  @Column({ nullable: true })
  followUpInstructions: string;
  
  @Column({ nullable: true })
  transferDate: Date;
  
  @Column({ nullable: true })
  transferReason: string;

  @Column({
    type: 'enum',
    enum: PatientStatus,
    default: PatientStatus.ADMITTED,
  })
  status: PatientStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  acuityLevel: Priority;

  @Column({ type: 'text', nullable: true })
  primaryDiagnosis: string;

  @Column('simple-array', { nullable: true })
  secondaryDiagnoses: string[];

  @Column('simple-array', { nullable: true })
  allergies: string[];
  
  @Column({ type: 'json', nullable: true })
  detailedAllergies: {
    substance: string;
    reaction: string;
    severity: string; // 'Mild', 'Moderate', 'Severe'
    dateIdentified: Date;
  }[];
  
  @Column({ type: 'json', nullable: true })
  immunizations: {
    name: string;
    date: Date;
    administeredBy: string;
    lotNumber?: string;
    expirationDate?: Date;
  }[];
  
  @Column({ type: 'json', nullable: true })
  familyMedicalHistory: {
    condition: string;
    relationship: string;
    notes: string;
  }[];
  
  @Column({ type: 'json', nullable: true })
  socialHistory: {
    smokingStatus: string; // 'Never', 'Former', 'Current'
    alcoholUse: string;
    substanceUse: string;
    notes: string;
  };

  @Column({ type: 'json', nullable: true })
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    prescribedBy: string;
  }[];

  @Column()
  roomNumber: string;

  @Column()
  bedNumber: string;

  @Column({ nullable: true })
  attendingPhysician: string;

  @Column({ nullable: true })
  primaryNurse: string;
  
  @Column({ type: 'json', nullable: true })
  careTeam: {
    providerId: string;
    providerName: string;
    role: string;
    specialty: string;
    assignmentDate: Date;
  }[];
  
  @Column({ type: 'json', nullable: true })
  insuranceInformation: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    holderName: string;
    relationship: string;
    coverageStartDate: Date;
    coverageEndDate?: Date;
    isPrimary: boolean;
  }[];
  
  @Column({ nullable: true })
  advanceDirectives: string;
  
  @Column({ default: false })
  consentToTreat: boolean;
  
  @Column({ default: false })
  consentToShareData: boolean;
  
  @Column({ nullable: true })
  preferredPharmacy: string;
  
  @Column({ nullable: true })
  referralSource: string;
  
  @Column({ nullable: true })
  notes: string;
  
  @Column({ default: false })
  isDeleted: boolean;
  
  @Column({ nullable: true })
  mergedIntoPatientId: string; // If this patient was merged into another

  @OneToMany(() => Assignment, (assignment) => assignment.patient)
  assignments: Assignment[];

  @OneToMany(() => Documentation, (documentation) => documentation.patient)
  documentation: Documentation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
  
  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  get lengthOfStay(): number {
    const endDate = this.dischargeDate || new Date();
    return Math.ceil(
      (endDate.getTime() - this.admissionDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
  }
  
  // Generate identifier hash for duplicate detection
  @BeforeInsert()
  generateIdentifierHash() {
    // Create a hash based on first name, last name, DOB, and SSN (if available)
    const identifierString = `${this.firstName.toLowerCase()}|${this.lastName.toLowerCase()}|${this.dateOfBirth.toISOString()}|${this.ssn || ''}`;
    this.identifierHash = bcrypt.hashSync(identifierString, 10);
  }
  
  // Encrypt SSN before saving
  @BeforeInsert()
  encryptSensitiveData() {
    if (this.ssn) {
      this.ssn = bcrypt.hashSync(this.ssn, 10);
    }
  }
  
  // Calculate BMI after loading
  @AfterLoad()
  calculateBMI() {
    if (this.height && this.weight) {
      // BMI = weight(kg) / (height(m))²
      const heightInMeters = this.height / 100;
      this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
  }
}
