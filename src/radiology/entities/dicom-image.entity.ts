import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ImagingStudy } from './imaging-study.entity';

@Entity()
export class DicomImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sopInstanceUID: string;

  @ManyToOne(() => ImagingStudy, study => study.dicomImages)
  study: ImagingStudy;

  @Column()
  seriesNumber: number;

  @Column()
  instanceNumber: number;

  @Column()
  imageType: string;

  @Column()
  rows: number;

  @Column()
  columns: number;

  @Column()
  bitsAllocated: number;

  @Column()
  bitsStored: number;

  @Column()
  highBit: number;

  @Column()
  pixelRepresentation: number;

  @Column()
  photometricInterpretation: string;

  @Column()
  samplesPerPixel: number;

  @Column()
  pixelSpacing: string;

  @Column()
  windowCenter: string;

  @Column()
  windowWidth: string;

  @Column()
  imageOrientation: string;

  @Column()
  imagePosition: string;

  @Column()
  sliceThickness: number;

  @Column()
  imageLocation: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  acquisitionTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 