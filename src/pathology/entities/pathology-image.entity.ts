
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PathologyCase } from './pathology-case.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum ImageType {
  MICROSCOPIC = 'microscopic',
  MACROSCOPIC = 'macroscopic',
  GROSS = 'gross',
  FLUORESCENCE = 'fluorescence',
  ELECTRON_MICROSCOPY = 'electron_microscopy',
  WHOLE_SLIDE = 'whole_slide',
  IMMUNOFLUORESCENCE = 'immunofluorescence'
}

export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  TIFF = 'tiff',
  SVS = 'svs',
  NDPI = 'ndpi',
  CZI = 'czi',
  DICOM = 'dicom'
}

export enum StainType {
  H_AND_E = 'h_and_e',
  PAS = 'pas',
  MASSON_TRICHROME = 'masson_trichrome',
  RETICULIN = 'reticulin',
  CONGO_RED = 'congo_red',
  GRAM = 'gram',
  AFB = 'afb',
  IMMUNOHISTOCHEMICAL = 'immunohistochemical',
  SPECIAL_STAIN = 'special_stain'
}

@Entity('pathology_images')
export class PathologyImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalFilename: string;

  @Column()
  filePath: string;

  @Column()
  fileSize: number;

  @Column({
    type: 'enum',
    enum: ImageFormat
  })
  format: ImageFormat;

  @Column({
    type: 'enum',
    enum: ImageType
  })
  imageType: ImageType;

  @Column({
    type: 'enum',
    enum: StainType,
    nullable: true
  })
  stainType: StainType;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  magnification: number;

  @Column({ nullable: true })
  slideNumber: string;

  @Column({ nullable: true })
  blockNumber: string;

  @Column('simple-json', { nullable: true })
  metadata: {
    width: number;
    height: number;
    resolution: string;
    colorDepth: number;
    compressionType: string;
    acquisitionDate: Date;
    scannerModel: string;
    objective: string;
  };

  @Column('simple-json', { nullable: true })
  annotations: Array<{
    id: string;
    type: string;
    coordinates: number[];
    description: string;
    createdBy: string;
    createdAt: Date;
  }>;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: false })
  isKeyImage: boolean;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ nullable: true })
  thumbnailPath: string;

  @Column('simple-json', { nullable: true })
  qualityMetrics: {
    focusScore: number;
    brightnessLevel: number;
    contrastLevel: number;
    colorBalance: string;
    artifactPresence: boolean;
  };

  @ManyToOne(() => PathologyCase, pathologyCase => pathologyCase.images)
  pathologyCase: PathologyCase;

  @ManyToOne(() => Doctor, doctor => doctor.capturedImages)
  capturedBy: Doctor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}