import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy?: string;
}

// entityInheritance/decorators/inheritance.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const INHERITANCE_TYPE = 'INHERITANCE_TYPE';
export const DISCRIMINATOR_COLUMN = 'DISCRIMINATOR_COLUMN';
export const DISCRIMINATOR_VALUE = 'DISCRIMINATOR_VALUE';
export const INHERITANCE_PARENT = 'INHERITANCE_PARENT';

export enum InheritanceType {
  SINGLE_TABLE = 'SINGLE_TABLE',
  CLASS_TABLE = 'CLASS_TABLE',
  CONCRETE_TABLE = 'CONCRETE_TABLE'
}

export const InheritanceStrategy = (type: InheritanceType) => 
  SetMetadata(INHERITANCE_TYPE, type);

export const DiscriminatorColumn = (column: string) => 
  SetMetadata(DISCRIMINATOR_COLUMN, column);

export const DiscriminatorValue = (value: string) => 
  SetMetadata(DISCRIMINATOR_VALUE, value);

export const InheritanceParent = (parent: Function) => 
  SetMetadata(INHERITANCE_PARENT, parent);