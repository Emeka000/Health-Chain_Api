import { Injectable, Logger } from "@nestjs/common"
import { Repository, LessThan } from "typeorm"
import { MedicalLicense } from "../entities/medical-license.entity"
import { LicenseStatus } from "../enums/license-status.enum"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class LicenseRenewalService {
  private readonly logger = new Logger(LicenseRenewalService.name)

   constructor(
    @InjectRepository(MedicalLicense)
    private licenseRepository: Repository<MedicalLicense>
  ) {}
  async checkExpiringLicenses(): Promise<{
    expiringSoon: MedicalLicense[]
    expired: MedicalLicense[]
    alerts: Array<{
      doctorId: string
      doctorName: string
      licenseType: string
      expiryDate: Date
      daysUntilExpiry: number
      urgency: "HIGH" | "MEDIUM" | "LOW"
    }>
  }> {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    // Get expired licenses
    const expired = await this.licenseRepository.find({
      where: {
        expiryDate: LessThan(now),
        status: LicenseStatus.ACTIVE,
      },
      relations: ["doctor"],
    })

    // Get licenses expiring within 90 days
    const expiringSoon = await this.licenseRepository.find({
      where: {
        expiryDate: LessThan(ninetyDaysFromNow),
        status: LicenseStatus.ACTIVE,
      },
      relations: ["doctor"],
    })

    // Create alerts with urgency levels
    const alerts = expiringSoon.map((license) => {
      const daysUntilExpiry = Math.ceil((license.expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

      let urgency: "HIGH" | "MEDIUM" | "LOW"
      if (daysUntilExpiry <= 0) {
        urgency = "HIGH"
      } else if (daysUntilExpiry <= 30) {
        urgency = "HIGH"
      } else if (daysUntilExpiry <= 60) {
        urgency = "MEDIUM"
      } else {
        urgency = "LOW"
      }

      return {
        doctorId: license.doctorId,
        doctorName: `${license.doctor.firstName} ${license.doctor.lastName}`,
        licenseType: license.licenseType,
        expiryDate: license.expiryDate,
        daysUntilExpiry,
        urgency,
      }
    })

    // Mark expired licenses
    if (expired.length > 0) {
      await this.licenseRepository.update({ id: expired.map((l) => l.id) as any }, { status: LicenseStatus.EXPIRED })
    }

    this.logger.log(`Found ${expired.length} expired licenses and ${expiringSoon.length} expiring soon`)

    return {
      expiringSoon,
      expired,
      alerts: alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
    }
  }

  async sendRenewalNotifications(
    alerts: Array<{
      doctorId: string
      doctorName: string
      licenseType: string
      expiryDate: Date
      daysUntilExpiry: number
      urgency: "HIGH" | "MEDIUM" | "LOW"
    }>,
  ): Promise<void> {
    // In a real implementation, this would send emails/notifications
    for (const alert of alerts) {
      this.logger.warn(
        `License renewal alert: ${alert.doctorName} - ${alert.licenseType} expires in ${alert.daysUntilExpiry} days (${alert.urgency} priority)`,
      )
    }
  }

  async generateRenewalReport(): Promise<{
    summary: {
      totalLicenses: number
      activeLicenses: number
      expiredLicenses: number
      expiringSoon: number
    }
    renewalSchedule: Array<{
      month: string
      expiringCount: number
      licenses: MedicalLicense[]
    }>
  }> {
    const now = new Date()
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

    const allLicenses = await this.licenseRepository.find({
      relations: ["doctor"],
    })

    const activeLicenses = allLicenses.filter((l) => l.status === LicenseStatus.ACTIVE)
    const expiredLicenses = allLicenses.filter((l) => l.status === LicenseStatus.EXPIRED)
    const expiringSoon = activeLicenses.filter((l) => l.expiryDate <= oneYearFromNow)

    // Group by month for renewal schedule
    const renewalSchedule = this.groupLicensesByMonth(expiringSoon)

    return {
      summary: {
        totalLicenses: allLicenses.length,
        activeLicenses: activeLicenses.length,
        expiredLicenses: expiredLicenses.length,
        expiringSoon: expiringSoon.length,
      },
      renewalSchedule,
    }
  }

  private groupLicensesByMonth(licenses: MedicalLicense[]): Array<{
    month: string
    expiringCount: number
    licenses: MedicalLicense[]
  }> {
    const monthGroups = new Map<string, MedicalLicense[]>()

    for (const license of licenses) {
      const monthKey = license.expiryDate.toISOString().substring(0, 7) // YYYY-MM
      if (!monthGroups.has(monthKey)) {
        monthGroups.set(monthKey, [])
      }
      monthGroups.get(monthKey)!.push(license)
    }

    return Array.from(monthGroups.entries())
      .map(([month, licenses]) => ({
        month,
        expiringCount: licenses.length,
        licenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }
}
