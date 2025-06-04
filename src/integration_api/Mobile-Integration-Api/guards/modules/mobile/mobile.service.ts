import { Injectable } from '@nestjs/common';
import { CreatePatientDto, UpdatePatientDto } from './dto/mobile.dto';

@Injectable()
export class MobileService {
  async getDashboard() {
    return {
      summary: {
        totalPatients: 150,
        appointmentsToday: 8,
        pendingResults: 12,
        criticalAlerts: 2
      },
      recentActivity: [
        { type: 'appointment', message: 'Appointment with John Doe at 2:00 PM' },
        { type: 'alert', message: 'High blood pressure reading for Jane Smith' }
      ],
      quickActions: ['Schedule Appointment', 'View Lab Results', 'Send Message']
    };
  }

  async getPatients() {
    return {
      patients: [
        {
          id: 1,
          name: 'John Doe',
          age: 45,
          lastVisit: '2024-06-01',
          status: 'active',
          riskLevel: 'low'
        },
        {
          id: 2,
          name: 'Jane Smith',
          age: 52,
          lastVisit: '2024-05-28',
          status: 'monitoring',
          riskLevel: 'high'
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 150
      }
    };
  }

  async createPatient(createPatientDto: CreatePatientDto) {
    return {
      id: Date.now(),
      ...createPatientDto,
      createdAt: new Date(),
      status: 'active'
    };
  }

  async updatePatient(id: string, updatePatientDto: UpdatePatientDto) {
    return {
      id: parseInt(id),
      ...updatePatientDto,
      updatedAt: new Date()
    };
  }

  async syncData() {
    return {
      lastSync: new Date(),
      syncedItems: {
        patients: 25,
        appointments: 15,
        labResults: 8
      },
      conflicts: [],
      status: 'success'
    };
  }
}