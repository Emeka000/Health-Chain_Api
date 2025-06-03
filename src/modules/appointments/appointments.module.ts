import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { Appointment } from './entities/appointment.entity';
import { ConsultationNote } from './entities/consultation-note.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';

// Services
import { AppointmentsService } from './services/appointments.service';
import { ConsultationNotesService } from './services/consultation-notes.service';
import { ProviderAvailabilityService } from './services/provider-availability.service';
import { NotificationService } from './services/notification.service';

// Controllers
import { AppointmentsController } from './controllers/appointments.controller';
import { ConsultationNotesController } from './controllers/consultation-notes.controller';
import { ProviderAvailabilityController } from './controllers/provider-availability.controller';
import { NotificationController } from './controllers/notification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      ConsultationNote,
      ProviderAvailability,
    ]),
    ConfigModule,
  ],
  controllers: [
    AppointmentsController,
    ConsultationNotesController,
    ProviderAvailabilityController,
    NotificationController,
  ],
  providers: [
    AppointmentsService,
    ConsultationNotesService,
    ProviderAvailabilityService,
    NotificationService,
  ],
  exports: [
    AppointmentsService,
    ConsultationNotesService,
    ProviderAvailabilityService,
    NotificationService,
  ],
})
export class AppointmentsModule {}
