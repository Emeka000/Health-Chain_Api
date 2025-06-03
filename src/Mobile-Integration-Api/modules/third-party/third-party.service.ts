import { Injectable, BadRequestException } from '@nestjs/common';
import { WebhookDto, IntegrationConfigDto } from './dto/third-party.dto';
import * as crypto from 'crypto';

@Injectable()
export class ThirdPartyService {
  async processWebhook(webhookDto: WebhookDto, signature: string) {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(webhookDto, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process different webhook types
    switch (webhookDto.type) {
      case 'patient_update':
        return this.processPatientUpdate(webhookDto.data);
      case 'lab_result':
        return this.processLabResult(webhookDto.data);
      case 'appointment_change':
        return this.processAppointmentChange(webhookDto.data);
      default:
        return { status: 'ignored', message: 'Unknown webhook type' };
    }
  }

  async getIntegrations() {
    return {
      available: [
        {
          id: 'epic',
          name: 'Epic EHR',
          status: 'connected',
          lastSync: '2024-06-03T10:00:00Z'
        },
        {
          id: 'cerner',
          name: 'Cerner PowerChart',
          status: 'disconnected',
          lastSync: null
        },
        {
          id: 'labcorp',
          name: 'LabCorp',
          status: 'connected',
          lastSync: '2024-06-03T09:30:00Z'
        }
      ]
    };
  }

  async configureIntegration(configDto: IntegrationConfigDto) {
    // Store integration configuration securely
    return {
      integrationId: configDto.type,
      status: 'configured',
      configuredAt: new Date()
    };
  }

  async syncEpic() {
    // Mock Epic EHR sync
    return {
      status: 'success',
      syncedRecords: {
        patients: 45,
        appointments: 23,
        labResults: 12
      },
      syncTime: new Date(),
      nextSync: new Date(Date.now() + 3600000) // 1 hour from now
    };
  }

  async syncCerner() {
    // Mock Cerner sync
    return {
      status: 'success',
      syncedRecords: {
        patients: 32,
        vitals: 89,
        medications: 156
      },
      syncTime: new Date(),
      nextSync: new Date(Date.now() + 3600000)
    };
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    const secret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(`sha256=${expectedSignature}`)
    );
  }

  private async processPatientUpdate(data: any) {
    // Process patient update from third-party system
    return { status: 'processed', type: 'patient_update' };
  }

  private async processLabResult(data: any) {
    // Process lab result from third-party system
    return { status: 'processed', type: 'lab_result' };
  }

  private async processAppointmentChange(data: any) {
    // Process appointment change from third-party system
    return { status: 'processed', type: 'appointment_change' };
  }
}