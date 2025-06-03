import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Department } from "./department.entity";

@Entity()
export class Workflow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('jsonb')
  steps: any; // Define structure of workflow steps

  @ManyToOne(() => Department, department => department.workflows)
  department: Department;
}
