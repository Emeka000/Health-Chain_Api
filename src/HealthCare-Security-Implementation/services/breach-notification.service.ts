import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecurityIncident } from '../entities/security-incident.entity';

interface BreachNotificationData {
  incidentId: string;
  affectedIndividuals: number;
  breachDescription: string;
  disclosureDate: Date;
  discoveryDate: Date;
  containmentActions: string[];
}

@Injectable()
export class BreachNotificationService {
  constructor(private configService: ConfigService) {}

  async initiateBreachNotification(incident: SecurityIncident): Promise<void> {
    const breachData: BreachNotificationData = {
      incidentId: incident.id,
      affectedIndividuals: await this.calculateAffectedIndividuals(incident),
      breachDescription: incident.description,
      disclosureDate: new Date(),
      discoveryDate: incident.createdAt,
      containmentActions: [],
    };

    // Determine notification requirements
    if (breachData.affectedIndividuals >= 500) {
      await this.notifyHHSAndMedia(breachData);
    }

    await this.notifyAffectedIndividuals(breachData);
    await this.documentBreachNotification(incident.id, breachData);
  }

  private async calculateAffectedIndividuals(
    incident: SecurityIncident,
  ): Promise<number> {
    // This would integrate with your patient database to determine
    // how many individuals' PHI was potentially compromised
    if (incident.affectedPatientId) {
      return 1; // Single patient affected
    }

    // For broader breaches, calculate based on the incident details
    // This is a simplified example
    return 0;
  }

  private async notifyHHSAndMedia(
    breachData: BreachNotificationData,
  ): Promise<void> {
    // For breaches affecting 500+ individuals, notify HHS within 60 days
    // and media without unreasonable delay

    const hhsNotification = {
      submissionDate: new Date(),
      coveredEntity: this.configService.get('ORGANIZATION_NAME'),
      incidentId: breachData.incidentId,
      individualsAffected: breachData.affectedIndividuals,
      breachDescription: breachData.breachDescription,
      discoveryDate: breachData.discoveryDate,
    };

    // Send to HHS (this would be an actual API call)
    console.log('HHS Breach Notification:', hhsNotification);

    // Media notification for large breaches
    if (breachData.affectedIndividuals >= 500) {
      const mediaNotification = {
        headline: `Healthcare Data Security Incident Notification`,
        affectedCount: breachData.affectedIndividuals,
        contactInfo: this.configService.get('MEDIA_CONTACT_INFO'),
      };

      console.log('Media Notification:', mediaNotification);
    }
  }

  private async notifyAffectedIndividuals(
    breachData: BreachNotificationData,
  ): Promise<void> {
    // Individual notifications must be sent within 60 days
    const notification = {
      subject: 'Important Notice Regarding Your Healthcare Information',
      body: this.generateIndividualNotificationText(breachData),
      sendBy: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    };

    // This would integrate with your email/mail service
    console.log('Individual Notification Prepared:', notification);
  }

  private generateIndividualNotificationText(
    breachData: BreachNotificationData,
  ): string {
    return `
Dear Patient,

We are writing to inform you of a security incident that may have involved some of your healthcare information.

What Happened: ${breachData.breachDescription}

Information Involved: [Specific types of information that were involved]

What We Are Doing: We have taken immediate steps to secure our systems and are working with cybersecurity experts to investigate this incident.

What You Can Do: [Specific recommendations for the individual]

For More Information: Please contact us at [contact information] if you have any questions.

Sincerely,
[Organization Name]
Privacy Officer
    `.trim();
  }

  private async documentBreachNotification(
    incidentId: string,
    breachData: BreachNotificationData,
  ): Promise<void> {
    // Document all breach notification activities for compliance
    const documentation = {
      incidentId,
      notificationsSent: {
        individuals: breachData.affectedIndividuals > 0,
        hhs: breachData.affectedIndividuals >= 500,
        media: breachData.affectedIndividuals >= 500,
      },
      timeline: {
        breachDiscovered: breachData.discoveryDate,
        notificationsSentBy: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    };

    console.log('Breach Notification Documentation:', documentation);
  }
}
