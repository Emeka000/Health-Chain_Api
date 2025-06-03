@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Drug)
    private drugRepo: Repository<Drug>,
  ) {}
  // Check for drugs that are low in stock
  async checkLowStock(): Promise<Drug[]> {
    return this.drugRepo.find({
      where: (qb) => {
        qb.where('quantity <= reorderPoint');
      },
    });
  }

  // Find drugs that are expiring within a certain number of days
  async findExpiringDrugs(days: number): Promise<Drug[]> {
    const now = new Date();
    const upcoming = new Date();
    upcoming.setDate(now.getDate() + days);

    return this.drugRepo.find({
      where: {
        expirationDate: LessThan(upcoming),
      },
    });
  }

  // (Optional) Add or update drug stock
  async addDrug(data: Partial<Drug>) {
    const drug = this.drugRepo.create(data);
    return this.drugRepo.save(drug);
  }
}
