import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Injectable } from '@nestjs/common';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  @Injectable()
  export class RealTimeGateway {
    @WebSocketServer()
    server: Server;
  
    @SubscribeMessage('join-room')
    handleJoinRoom(
      @MessageBody() data: { room: string },
      @ConnectedSocket() client: Socket,
    ): void {
      client.join(data.room);
      client.emit('joined-room', { room: data.room });
    }
  
    // Broadcast vital signs updates
    broadcastVitalSigns(patientId: number, vitals: any): void {
      this.server.to(`patient-${patientId}`).emit('vital-signs-update', {
        patientId,
        vitals,
        timestamp: new Date(),
      });
    }
  
    // Broadcast emergency alerts
    broadcastEmergencyAlert(alert: any): void {
      this.server.emit('emergency-alert', {
        ...alert,
        timestamp: new Date(),
      });
    }
  
    // Broadcast appointment updates
    broadcastAppointmentUpdate(appointmentId: number, update: any): void {
      this.server.to('appointments').emit('appointment-update', {
        appointmentId,
        update,
        timestamp: new Date(),
      });
    }
  
    // Broadcast system status
    broadcastSystemStatus(status: any): void {
      this.server.emit('system-status', {
        ...status,
        timestamp: new Date(),
      });
    }
  }
  