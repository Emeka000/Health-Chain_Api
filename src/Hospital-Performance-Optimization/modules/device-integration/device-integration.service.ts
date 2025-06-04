import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RealTimeGateway } from '../real-time/real-time.gateway';

@Injectable()
export class DeviceIntegrationService {
  constructor(
    private eventEmitter: EventEmitter2,
    private realTimeGateway: RealTimeGateway,
  ) {}

  async processDeviceData(deviceId: string, data: any): Promise<void> {
    try {
      // Validate and process device data
      const processedData = await this.validateDeviceData(data);
      
      // Determine data type and route accordingly
      switch (processedData.type) {
        case 'vital_signs':
          await this.processVitalSigns(processedData);
          break;
        case 'lab_result':
          await this.processLabResult(processedData);
          break;
        case 'imaging':
          await this.processImagingData(processedData);
          break;
        default:
          console.warn(`Unknown device data type: ${processedData.type}`);
      }
      
    } catch (error) {
      console.error(`Error processing device data from ${deviceId}:`, error);
      this.eventEmitter.emit('device.error', { deviceId, error: error.message });
    }
  }

  private async validateDeviceData(data: any): Promise<any> {
    // Implement data validation logic
    if (!data.patientId || !data.type || !data.values) {
      throw new Error('Invalid device data format');
    }
    
    return {
      ...data,
      timestamp: data.timestamp || new Date(),
      validated: true,
    };
  }

  private async processVitalSigns(data: any): Promise<void> {
    // Check for critical values
    const criticalValues = this.checkCriticalValues(data.values);
    
    if (criticalValues.length > 0) {
      this.realTimeGateway.broadcastEmergencyAlert({
        type: 'critical_vitals',
        patientId: data.patientId,
        criticalValues,
        severity: 'high',
      });
    }
    
    // Broadcast real-time vital signs
    this.realTimeGateway.broadcastVitalSigns(data.patientId, data.values);
    
    // Emit event for storage
    this.eventEmitter.emit('vitals.recorded', data);
  }

  private async processLabResult(data: any): Promise<void> {
    // Process lab results
    this.eventEmitter.emit('lab.result', data);
  }

  private async processImagingData(data: any): Promise<void> {
    // Process imaging data
    this.eventEmitter.emit('imaging.received', data);
  }

  private checkCriticalValues(vitals: any): string[] {
    const critical = [];
    
    // Example critical value checks
    if (vitals.heartRate && (vitals.heartRate < 60 || vitals.heartRate > 100)) {
      critical.push(`Heart rate: ${vitals.heartRate} BPM`);
    }
    
    if (vitals.bloodPressure) {
      const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
      if (systolic > 180 || diastolic > 110) {
        critical.push(`Blood pressure: ${vitals.bloodPressure}`);
      }
    }
    
    if (vitals.temperature && (vitals.temperature < 95 || vitals.temperature > 102)) {
      critical.push(`Temperature: ${vitals.temperature}°F`);
    }
    
    return critical;
  }
}
