@Entity()
export class Recall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lotNumber: string;

  @Column()
  reason: string;

  @Column({ type: 'date' })
  recallDate: Date;
}
