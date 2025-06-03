// Mock for the Appointment entity
import { AppointmentStatus } from '../../enums/appointment-status.enum';
import { AppointmentType } from '../../enums/appointment-type.enum';
import { MedicalPriority } from '../../enums/medical-priority.enum';

export class Appointment {
  id: string;
  patientId: string;
  providerId: string;
  startDateTime: string;
  endDateTime: string;
  status: AppointmentStatus;
  appointmentType: AppointmentType;
  medicalPriority: MedicalPriority;
  notes?: string;
  reasonForVisit?: string;
  isTelemedicine: boolean;
  isActive: boolean;
  confirmationNumber?: string;
  reminderSent?: boolean;
  reminderSentAt?: Date;
  cancellationReason?: string;
  cancelledBy?: string;
  cancellationDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
