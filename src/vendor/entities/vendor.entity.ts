@Entity()
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  contactInfo: string;

  @OneToMany(() => Drug, (drug) => drug.vendor)
  drugs: Drug[];
}
