import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientCommunication } from './entities/patient-communication.entity';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(PatientCommunication)
    private communicationRepository: Repository<PatientCommunication>,
  ) {}

  async sendCommunication(patientId: string, type: string, subject: string, content: string, sentBy: string): Promise<PatientCommunication> {
    const communication = this.communicationRepository.create({
      patientId,
      type,
      subject,
      content,
      sentBy,
      status: 'sent',
      sentAt: new Date()
    });

    return await this.communicationRepository.save(communication);
  }

  async findByPatient(patientId: string): Promise<PatientCommunication[]> {
    return await this.communicationRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' }
    });
  }

  async markAsRead(id: string): Promise<PatientCommunication> {
    const communication = await this.communicationRepository.findOne({ where: { id } });
    if (communication) {
      communication.status = 'read';
      communication.readAt = new Date();
      return await this.communicationRepository.save(communication);
    }
    return communication;
  }
}
