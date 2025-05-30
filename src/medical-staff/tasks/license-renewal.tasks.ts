import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { LicenseRenewalService } from "../providers/license-renewal.service"

@Injectable()
export class LicenseRenewalTasks {
  private readonly logger = new Logger(LicenseRenewalTasks.name)

  constructor(private readonly licenseRenewalService: LicenseRenewalService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyLicenseCheck() {
    this.logger.log("Running daily license expiry check...")

    try {
      const result = await this.licenseRenewalService.checkExpiringLicenses()

      if (result.alerts.length > 0) {
        await this.licenseRenewalService.sendRenewalNotifications(result.alerts)
      }

      this.logger.log(
        `License check completed: ${result.expired.length} expired, ${result.expiringSoon.length} expiring soon`,
      )
    } catch (error) {
      this.logger.error("Error during license check:", error)
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyRenewalReport() {
    this.logger.log("Generating monthly license renewal report...")

    try {
      const report = await this.licenseRenewalService.generateRenewalReport()

      this.logger.log(
        `Monthly report generated: ${report.summary.totalLicenses} total licenses, ${report.summary.expiringSoon} expiring within a year`,
      )

      // In a real implementation, this would send the report via email
    } catch (error) {
      this.logger.error("Error generating monthly report:", error)
    }
  }
}
