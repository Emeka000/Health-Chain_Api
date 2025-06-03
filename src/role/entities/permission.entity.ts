import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string; // 'read_patient', 'write_prescription', etc.

  @Column()
  resource: string; // 'patient', 'record', etc.
}
