import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { AppointmentsService } from './appointments.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  /**
   * Send appointment reminder notification
   */
  async sendAppointmentReminder(appointment: Appointment): Promise<boolean> {
    try {
      // Skip if reminder already sent or appointment is not booked
      if (
        appointment.reminderSent ||
        appointment.status !== AppointmentStatus.BOOKED
      ) {
        return false;
      }

      // In a real implementation, this would send an email or SMS
      // For now, we'll just log it
      this.logger.log(
        `Sending appointment reminder for appointment ${appointment.id} to patient ${appointment.patientId}`,
      );

      // Simulate sending notification
      const notificationData = {
        to: appointment.patientId, // In real implementation, this would be patient's email or phone
        subject: 'Appointment Reminder',
        body: `This is a reminder for your appointment on ${appointment.startDateTime.toLocaleString()} with Dr. ${appointment.providerId}.`,
        appointmentDetails: {
          id: appointment.id,
          confirmationNumber: appointment.confirmationNumber,
          dateTime: appointment.startDateTime,
          provider: appointment.providerId,
          type: appointment.appointmentType,
          isTelemedicine: appointment.isTelemedicine,
        },
      };

      // Log the notification data
      this.logger.log(`Notification data: ${JSON.stringify(notificationData)}`);

      // Mark reminder as sent
      await this.appointmentsService.markReminderSent(appointment.id);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send appointment reminder: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Send appointment confirmation notification
   */
  async sendAppointmentConfirmation(
    appointment: Appointment,
  ): Promise<boolean> {
    try {
      // In a real implementation, this would send an email or SMS
      this.logger.log(
        `Sending appointment confirmation for appointment ${appointment.id} to patient ${appointment.patientId}`,
      );

      // Simulate sending notification
      const notificationData = {
        to: appointment.patientId, // In real implementation, this would be patient's email or phone
        subject: 'Appointment Confirmation',
        body: `Your appointment has been confirmed for ${appointment.startDateTime.toLocaleString()} with Dr. ${appointment.providerId}.\n\nConfirmation Number: ${appointment.confirmationNumber}`,
        appointmentDetails: {
          id: appointment.id,
          confirmationNumber: appointment.confirmationNumber,
          dateTime: appointment.startDateTime,
          provider: appointment.providerId,
          type: appointment.appointmentType,
          isTelemedicine: appointment.isTelemedicine,
        },
      };

      // Log the notification data
      this.logger.log(`Notification data: ${JSON.stringify(notificationData)}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send appointment confirmation: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Send appointment cancellation notification
   */
  async sendAppointmentCancellation(
    appointment: Appointment,
  ): Promise<boolean> {
    try {
      // In a real implementation, this would send an email or SMS
      this.logger.log(
        `Sending appointment cancellation for appointment ${appointment.id} to patient ${appointment.patientId}`,
      );

      // Simulate sending notification
      const notificationData = {
        to: appointment.patientId, // In real implementation, this would be patient's email or phone
        subject: 'Appointment Cancellation',
        body: `Your appointment scheduled for ${appointment.startDateTime.toLocaleString()} with Dr. ${appointment.providerId} has been cancelled.\n\nReason: ${appointment.cancellationReason || 'Not specified'}`,
        appointmentDetails: {
          id: appointment.id,
          confirmationNumber: appointment.confirmationNumber,
          dateTime: appointment.startDateTime,
          provider: appointment.providerId,
          cancellationReason: appointment.cancellationReason,
        },
      };

      // Log the notification data
      this.logger.log(`Notification data: ${JSON.stringify(notificationData)}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send appointment cancellation: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Send telemedicine link notification
   */
  async sendTelemedicineLink(
    appointment: Appointment,
    telemedicineLink: string,
  ): Promise<boolean> {
    try {
      // Skip if appointment is not telemedicine or not booked
      if (
        !appointment.isTelemedicine ||
        appointment.status !== AppointmentStatus.BOOKED
      ) {
        return false;
      }

      // In a real implementation, this would send an email or SMS
      this.logger.log(
        `Sending telemedicine link for appointment ${appointment.id} to patient ${appointment.patientId}`,
      );

      // Simulate sending notification
      const notificationData = {
        to: appointment.patientId, // In real implementation, this would be patient's email or phone
        subject: 'Your Telemedicine Appointment Link',
        body: `Your telemedicine appointment is scheduled for ${appointment.startDateTime.toLocaleString()}.\n\nJoin using this link: ${telemedicineLink}`,
        appointmentDetails: {
          id: appointment.id,
          confirmationNumber: appointment.confirmationNumber,
          dateTime: appointment.startDateTime,
          provider: appointment.providerId,
          telemedicineLink,
        },
      };

      // Also send to provider
      const providerNotificationData = {
        to: appointment.providerId, // In real implementation, this would be provider's email or phone
        subject: 'Upcoming Telemedicine Appointment',
        body: `You have a telemedicine appointment scheduled for ${appointment.startDateTime.toLocaleString()}.\n\nJoin using this link: ${telemedicineLink}`,
        appointmentDetails: {
          id: appointment.id,
          confirmationNumber: appointment.confirmationNumber,
          dateTime: appointment.startDateTime,
          patient: appointment.patientId,
          telemedicineLink,
        },
      };

      // Log the notification data
      this.logger.log(
        `Patient notification data: ${JSON.stringify(notificationData)}`,
      );
      this.logger.log(
        `Provider notification data: ${JSON.stringify(providerNotificationData)}`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send telemedicine link: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Send follow-up reminder notification
   */
  async sendFollowUpReminder(appointment: Appointment): Promise<boolean> {
    try {
      // Skip if appointment doesn't require follow-up
      if (!appointment.followUpRequired) {
        return false;
      }

      // In a real implementation, this would send an email or SMS
      this.logger.log(
        `Sending follow-up reminder for appointment ${appointment.id} to patient ${appointment.patientId}`,
      );

      // Simulate sending notification
      const notificationData = {
        to: appointment.patientId, // In real implementation, this would be patient's email or phone
        subject: 'Follow-up Appointment Reminder',
        body: `This is a reminder for your follow-up appointment scheduled for ${appointment.followUpDate?.toLocaleString()}.\n\nNotes: ${appointment.followUpNotes || 'No additional notes'}`,
        appointmentDetails: {
          id: appointment.id,
          originalAppointmentDate: appointment.startDateTime,
          followUpDate: appointment.followUpDate,
          provider: appointment.providerId,
          followUpNotes: appointment.followUpNotes,
        },
      };

      // Log the notification data
      this.logger.log(`Notification data: ${JSON.stringify(notificationData)}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send follow-up reminder: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
