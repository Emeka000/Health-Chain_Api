import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { DicomImage } from './dicom-image.entity';
import { RadiologyReport } from './radiology-report.entity';
import { RadiationDose } from './radiation-dose.entity';

@Entity()
export class ImagingStudy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studyInstanceUID: string;

  @Column()
  patientId: string;

  @Column()
  studyDate: Date;

  @Column()
  modality: 'CT' | 'MRI' | 'X-RAY' | 'ULTRASOUND' | 'PET' | 'SPECT';

  @Column()
  studyDescription: string;

  @Column()
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

  @Column()
  priority: 'routine' | 'urgent' | 'emergency';

  @Column()
  requestedBy: string;

  @Column()
  performingPhysician: string;

  @Column({ type: 'json', nullable: true })
  clinicalInformation: {
    reasonForStudy: string;
    relevantHistory: string;
    allergies: string[];
    pregnancyStatus?: boolean;
  };

  @OneToMany(() => DicomImage, dicomImage => dicomImage.study)
  dicomImages: DicomImage[];

  @OneToMany(() => RadiologyReport, report => report.study)
  reports: RadiologyReport[];

  @OneToMany(() => RadiationDose, dose => dose.study)
  radiationDoses: RadiationDose[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 