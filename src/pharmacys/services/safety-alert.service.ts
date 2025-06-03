import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import {
  SafetyAlert,
  AlertType,
  AlertSeverity,
} from '../entities/safety-alert.entity';

@Injectable()
export class SafetyAlertService {
  constructor(
    @InjectRepository(SafetyAlert)
    private alertRepository: Repository<SafetyAlert>,
  ) {}

  async createDrugInteractionAlert(
    prescriptionId: string,
    patientId: string,
    message: string,
  ): Promise<SafetyAlert> {
    const alert = this.alertRepository.create({
      type: AlertType.DRUG_INTERACTION,
      severity: AlertSeverity.HIGH,
      message,
      prescriptionId,
      patientId,
    });

    return await this.alertRepository.save(alert);
  }

  async createAllergyAlert(
    prescriptionId: string,
    patientId: string,
    drugId: string,
    message: string,
  ): Promise<SafetyAlert> {
    const alert = this.alertRepository.create({
      type: AlertType.ALLERGY_WARNING,
      severity: AlertSeverity.CRITICAL,
      message,
      prescriptionId,
      patientId,
      drugId,
    });

    return await this.alertRepository.save(alert);
  }

  async createLowStockAlert(
    inventoryItem: InventoryItem,
  ): Promise<SafetyAlert> {
    const alert = this.alertRepository.create({
      type: AlertType.INVENTORY_LOW,
      severity: AlertSeverity.MEDIUM,
      message: `Low stock alert: ${inventoryItem.drug.brandName} - Only ${inventoryItem.quantity} units remaining`,
      drugId: inventoryItem.drugId,
    });

    return await this.alertRepository.save(alert);
  }

  async createExpiredDrugAlert(
    inventoryItem: InventoryItem,
  ): Promise<SafetyAlert> {
    const alert = this.alertRepository.create({
      type: AlertType.EXPIRED_DRUG,
      severity: AlertSeverity.HIGH,
      message: `Expired drug alert: ${inventoryItem.drug.brandName} (Lot: ${inventoryItem.lotNumber}) expired on ${inventoryItem.expirationDate}`,
      drugId: inventoryItem.drugId,
    });

    return await this.alertRepository.save(alert);
  }

  async getActiveAlerts(): Promise<SafetyAlert[]> {
    return await this.alertRepository.find({
      where: { isResolved: false },
      order: { severity: 'DESC', createdAt: 'DESC' },
    });
  }

  async resolveAlert(
    id: string,
    pharmacistId: string,
    resolution: string,
  ): Promise<SafetyAlert> {
    const alert = await this.alertRepository.findOne({ where: { id } });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    alert.isResolved = true;
    alert.resolvedBy = pharmacistId;
    alert.resolvedAt = new Date();
    alert.resolution = resolution;

    return await this.alertRepository.save(alert);
  }
}
