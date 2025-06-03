import { Injectable } from '@nestjs/common';
import { DeviceDataDto, DeviceRegistrationDto } from './dto/medical-device.dto';

@Injectable()
export class MedicalDeviceService {
  async getDevices() {
    return {
      devices: [
        {
          id: 'bp_monitor_001',
          name: 'Omron Blood Pressure Monitor',
          type: 'blood_pressure',
          status: 'active',
          lastReading: '2024-06-03T09:15:00Z',
          patientId: 'patient_123'
        },
        {
          id: 'glucometer_002',
          name: 'Accu-Chek Glucometer',
          type: 'glucose',
          status: 'active',
          lastReading: '2024-06-03T08:30:00Z',
          patientId: 'patient_456'
        },
        {
          id: 'pulse_ox_003',
          name: 'Masimo Pulse Oximeter',
          type: 'pulse_oximetry',
          status: 'offline',
          lastReading: '2024-06-02T20:45:00Z',
          patientId: 'patient_789'
        }
      ]
    };
  }

  async registerDevice(registrationDto: DeviceRegistrationDto) {
    return {
      deviceId: `${registrationDto.type}_${Date.now()}`,
      status: 'registered',
      registeredAt: new Date(),
      ...registrationDto
    };
  }

  async processDeviceData(deviceDataDto: DeviceDataDto) {
    // Process and validate device data
    const processedData = {
      id: Date.now(),
      deviceId: deviceDataDto.deviceId,
      readings: deviceDataDto.readings,
      timestamp: deviceDataDto.timestamp || new Date(),
      processed: true,
      alerts: this.checkForAlerts(deviceDataDto.readings)
    };

    return {
      status: 'processed',
      dataId: processedData.id,
      alerts: processedData.alerts
    };
  }

  async getDeviceReadings(deviceId: string) {
    return {
      deviceId,
      readings: [
        {
          timestamp: '2024-06-03T09:15:00Z',
          values: { systolic: 120, diastolic: 80, heartRate: 72 }
        },
        {
          timestamp: '2024-06-03T09:00:00Z',
          values: { systolic: 118, diastolic: 78, heartRate: 70 }
        }
      ],
      summary: {
        totalReadings: 145,
        averages: { systolic: 122, diastolic: 79, heartRate: 71 },
        trends: 'stable'
      }
    };
  }

  async getPatientVitals(patientId: string) {
    return {
      patientId,
      vitals: {
        bloodPressure: {
          latest: { systolic: 120, diastolic: 80, timestamp: '2024-06-03T09:15:00Z' },
          trend: 'stable'
        },
        heartRate: {
          latest: { bpm: 72, timestamp: '2024-06-03T09:15:00Z' },
          trend: 'normal'
        },
        bloodGlucose: {
          latest: { mgDl: 95, timestamp: '2024-06-03T08:30:00Z' },
          trend: 'normal'
        },
        oxygenSaturation: {
          latest: { percentage: 98, timestamp: '2024-06-03T09:10:00Z' },
          trend: 'normal'
        }
      },
      alerts: [],
      lastUpdated: '2024-06-03T09:15:00Z'
    };
  }

  private checkForAlerts(readings: any) {
    const alerts = [];
    
    if (readings.systolic > 140 || readings.diastolic > 90) {
      alerts.push({
        type: 'hypertension',
        severity: 'high',
        message: 'Blood pressure reading above normal range'
      });
    }
    
    if (readings.heartRate > 100) {
      alerts.push({
        type: 'tachycardia',
        severity: 'medium',
        message: 'Heart rate elevated'
      });
    }

    return alerts;
  }
}
