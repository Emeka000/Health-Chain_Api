import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoSession, SessionStatus } from './entities/video-session.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import * as crypto from 'crypto';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoSession)
    private videoSessionRepository: Repository<VideoSession>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async createSession(appointmentId: string): Promise<VideoSession> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const roomId = this.generateRoomId();
    const accessToken = this.generateAccessToken(roomId);

    const videoSession = this.videoSessionRepository.create({
      appointment,
      roomId,
      accessToken,
      status: SessionStatus.PENDING,
    });

    return this.videoSessionRepository.save(videoSession);
  }

  async startSession(sessionId: string): Promise<VideoSession> {
    const session = await this.videoSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['appointment'],
    });

    if (!session) {
      throw new NotFoundException('Video session not found');
    }

    session.status = SessionStatus.ACTIVE;
    session.startTime = new Date();

    return this.videoSessionRepository.save(session);
  }

  async endSession(sessionId: string): Promise<VideoSession> {
    const session = await this.videoSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Video session not found');
    }

    session.status = SessionStatus.ENDED;
    session.endTime = new Date();
    
    if (session.startTime) {
      session.duration = Math.floor(
        (session.endTime.getTime() - session.startTime.getTime()) / 1000
      );
    }

    return this.videoSessionRepository.save(session);
  }

  async getSessionByAppointment(appointmentId: string): Promise<VideoSession> {
    const session = await this.videoSessionRepository.findOne({
      where: { appointment: { id: appointmentId } },
      relations: ['appointment'],
    });

    if (!session) {
      throw new NotFoundException('Video session not found');
    }

    return session;
  }

  private generateRoomId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateAccessToken(roomId: string): string {
    // In production, integrate with actual video conferencing service (Twilio, Agora, etc.)
    return crypto.randomBytes(32).toString('hex');
  }

  async validateAccess(sessionId: string, userId: string): Promise<boolean> {
    const session = await this.videoSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
    });

    if (!session) {
      return false;
    }

    return (
      session.appointment.patient.id === userId ||
      session.appointment.doctor.id === userId
    );
  }
}
