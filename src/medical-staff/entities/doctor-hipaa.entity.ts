import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  Index,
} from "typeorm";
import { Exclude, Transform } from "class-transformer";
import { DoctorStatus } from "../enums/doctor-status.enum";
import { Department } from "./department.entity";
import { Specialty } from "./specialty.entity";
import { MedicalLicense } from "./medical-license.entity";
import { Schedule } from "./schedule.entity";
import { PerformanceMetric } from "./performance-metric.entity";
import { ContinuingEducation } from "./continuing-education.entity";
import { EncryptionService } from "../../security/encryption.service";

@Entity("doctors_hipaa")
@Index(['employeeId'])
@Index(['email'])
@Index(['departmentId'])
@Index(['status'])
export class DoctorHIPAA {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @Index()
  employeeId: string;

  // PHI: First Name - Encrypted
  @Column({ type: 'text' })
  @Exclude({ toPlainOnly: true })
  private _firstName: string;

  // PHI: Last Name - Encrypted
  @Column({ type: 'text' })
  @Exclude({ toPlainOnly: true })
  private _lastName: string;

  // PHI: Email - Encrypted
  @Column({ type: 'text' })
  @Exclude({ toPlainOnly: true })
  private _email: string;

  // Email hash for indexing and lookups
  @Column({ unique: true })
  @Index()
  emailHash: string;

  // PHI: Phone - Encrypted
  @Column({ type: 'text' })
  @Exclude({ toPlainOnly: true })
  private _phone: string;

  // PHI: Date of Birth - Encrypted
  @Column({ type: 'text' })
  @Exclude({ toPlainOnly: true })
  private _dateOfBirth: string;

  @Column({ type: "date" })
  hireDate: Date;

  @Column({ type: "enum", enum: DoctorStatus, default: DoctorStatus.ACTIVE })
  @Index()
  status: DoctorStatus;

  @Column()
  @Index()
  departmentId: string;

  @ManyToOne(
    () => Department,
    (department) => department.doctors,
  )
  department: Department;

  @ManyToMany(
    () => Specialty,
    (specialty) => specialty.doctors,
  )
  @JoinTable({
    name: "doctor_specialties_hipaa",
    joinColumn: { name: "doctorId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "specialtyId", referencedColumnName: "id" },
  })
  specialties: Specialty[];

  @OneToMany(
    () => MedicalLicense,
    (license) => license.doctor,
    { cascade: true },
  )
  licenses: MedicalLicense[];

  @OneToMany(
    () => Schedule,
    (schedule) => schedule.doctor,
  )
  schedules: Schedule[];

  @OneToMany(
    () => PerformanceMetric,
    (metric) => metric.doctor,
  )
  performanceMetrics: PerformanceMetric[];

  @OneToMany(
    () => ContinuingEducation,
    (education) => education.doctor,
  )
  continuingEducation: ContinuingEducation[];

  // PHI: Credentials - Encrypted
  @Column({ type: "text", nullable: true })
  @Exclude({ toPlainOnly: true })
  private _credentials: string;

  // PHI: Contact Information - Encrypted
  @Column({ type: "text", nullable: true })
  @Exclude({ toPlainOnly: true })
  private _contactInfo: string;

  // PHI: Notes - Encrypted
  @Column({ type: "text", nullable: true })
  @Exclude({ toPlainOnly: true })
  private _notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Audit fields
  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  deletedBy: string;

  // Data classification
  @Column({ default: 'PHI' })
  dataClassification: string;

  @Column({ default: 'HIGH' })
  sensitivityLevel: string;

  // Temporary properties for decrypted data (not persisted)
  private encryptionService: EncryptionService;

  // Getters and setters for encrypted fields
  get firstName(): string {
    return this._firstName ? this.encryptionService?.decryptPHI(this._firstName) : '';
  }

  set firstName(value: string) {
    this._firstName = value ? this.encryptionService?.encryptPHI(value) : '';
  }

  get lastName(): string {
    return this._lastName ? this.encryptionService?.decryptPHI(this._lastName) : '';
  }

  set lastName(value: string) {
    this._lastName = value ? this.encryptionService?.encryptPHI(value) : '';
  }

  get email(): string {
    return this._email ? this.encryptionService?.decryptPHI(this._email) : '';
  }

  set email(value: string) {
    if (value) {
      this._email = this.encryptionService?.encryptPHI(value);
      this.emailHash = this.encryptionService?.hashForIndex(value);
    } else {
      this._email = '';
      this.emailHash = '';
    }
  }

  get phone(): string {
    return this._phone ? this.encryptionService?.decryptPHI(this._phone) : '';
  }

  set phone(value: string) {
    this._phone = value ? this.encryptionService?.encryptPHI(value) : '';
  }

  get dateOfBirth(): Date | null {
    if (!this._dateOfBirth) return null;
    const decrypted = this.encryptionService?.decryptPHI(this._dateOfBirth);
    return decrypted ? new Date(decrypted) : null;
  }

  set dateOfBirth(value: Date | null) {
    this._dateOfBirth = value ? this.encryptionService?.encryptPHI(value.toISOString()) : '';
  }

  get credentials(): any {
    if (!this._credentials) return null;
    const decrypted = this.encryptionService?.decryptPHI(this._credentials);
    return decrypted ? JSON.parse(decrypted) : null;
  }

  set credentials(value: any) {
    this._credentials = value ? this.encryptionService?.encryptPHI(JSON.stringify(value)) : '';
  }

  get contactInfo(): any {
    if (!this._contactInfo) return null;
    const decrypted = this.encryptionService?.decryptPHI(this._contactInfo);
    return decrypted ? JSON.parse(decrypted) : null;
  }

  set contactInfo(value: any) {
    this._contactInfo = value ? this.encryptionService?.encryptPHI(JSON.stringify(value)) : '';
  }

  get notes(): string {
    return this._notes ? this.encryptionService?.decryptPHI(this._notes) : '';
  }

  set notes(value: string) {
    this._notes = value ? this.encryptionService?.encryptPHI(value) : '';
  }

  // Lifecycle hooks for encryption/decryption
  @BeforeInsert()
  @BeforeUpdate()
  encryptData() {
    // Encryption is handled by setters
    if (!this.emailHash && this._email) {
      this.emailHash = this.encryptionService?.hashForIndex(this.email);
    }
  }

  @AfterLoad()
  decryptData() {
    // Decryption is handled by getters
    // This hook can be used for additional post-load processing
  }

  // Helper method to set encryption service
  setEncryptionService(encryptionService: EncryptionService) {
    this.encryptionService = encryptionService;
  }

  // Helper method to get full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Safe display name (last name partially masked)
  get displayName(): string {
    const lastName = this.lastName;
    if (lastName.length <= 2) return `${this.firstName} ${lastName}`;
    return `${this.firstName} ${lastName.charAt(0)}${'*'.repeat(lastName.length - 1)}`;
  }

  // Check if data contains PHI
  containsPHI(): boolean {
    return !!(this._firstName || this._lastName || this._email || this._phone || 
              this._dateOfBirth || this._credentials || this._contactInfo || this._notes);
  }
} 