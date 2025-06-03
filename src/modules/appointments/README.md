# Appointments Module

## Overview

The Appointments Module is a comprehensive healthcare appointment scheduling and consultation management system designed for HIPAA-compliant healthcare applications. It provides a complete solution for managing provider availability, appointment scheduling, consultation documentation, and follow-up tracking.

## Features

### Appointment Management
- Create, update, and cancel appointments
- Schedule appointments based on provider availability
- Support for both in-person and telemedicine appointments
- Medical priority-based scheduling
- Appointment status tracking (proposed, booked, checked-in, in-progress, completed, cancelled)
- Appointment reminders and notifications
- Follow-up appointment scheduling

### Provider Availability Management
- Define provider availability with flexible scheduling options
- Support for recurring availability patterns
- Specialty-based provider filtering
- Telemedicine availability tracking
- Conflict detection and resolution

### Consultation Notes
- Document patient consultations with structured data
- Track diagnoses, treatment plans, and prescriptions
- Schedule and manage follow-up appointments
- Link consultation notes to appointments

### Notification System
- Appointment confirmation notifications
- Appointment reminder notifications
- Cancellation notifications
- Telemedicine link distribution
- Follow-up reminders

## Architecture

The module follows a standard NestJS architecture with:

- **Entities**: Define the data models for appointments, consultation notes, and provider availability
- **DTOs**: Data transfer objects for creating and updating entities
- **Services**: Business logic for managing entities
- **Controllers**: RESTful API endpoints for interacting with the module
- **Enums**: Standardized enumerations for appointment statuses, types, and medical priorities

## Security & Compliance

- Role-based access control for all endpoints
- HIPAA-compliant data handling
- Audit logging for all operations
- Secure telemedicine link generation and distribution

## API Endpoints

### Appointments
- `GET /appointments` - List appointments with filtering options
- `GET /appointments/:id` - Get appointment details
- `POST /appointments` - Create a new appointment
- `PATCH /appointments/:id` - Update an appointment
- `DELETE /appointments/:id` - Delete an appointment
- `PATCH /appointments/:id/status` - Update appointment status
- `PATCH /appointments/:id/cancel` - Cancel an appointment
- `POST /appointments/:id/reminder` - Send appointment reminder

### Consultation Notes
- `GET /consultation-notes` - List consultation notes with filtering options
- `GET /consultation-notes/:id` - Get consultation note details
- `POST /consultation-notes` - Create a new consultation note
- `PATCH /consultation-notes/:id` - Update a consultation note
- `DELETE /consultation-notes/:id` - Delete a consultation note
- `POST /consultation-notes/:id/follow-up` - Schedule a follow-up appointment

### Provider Availability
- `GET /provider-availability` - List provider availability with filtering options
- `GET /provider-availability/:id` - Get provider availability details
- `POST /provider-availability` - Create new provider availability
- `PATCH /provider-availability/:id` - Update provider availability
- `DELETE /provider-availability/:id` - Delete provider availability
- `GET /provider-availability/specialty/:specialty` - Find providers available for a specialty

### Notifications
- `POST /notifications/appointment/:id/reminder` - Send appointment reminder
- `POST /notifications/appointment/:id/confirmation` - Send appointment confirmation
- `POST /notifications/appointment/:id/cancellation` - Send cancellation notification
- `POST /notifications/appointment/:id/telemedicine-link` - Send telemedicine link
- `POST /notifications/appointment/:id/follow-up-reminder` - Send follow-up reminder
- `GET /notifications/appointment/:id/status` - Get notification status for an appointment

## Usage Examples

### Creating a Provider Availability

```typescript
// Define when a provider is available
const availability = {
  providerId: 'doctor-123',
  startDateTime: '2025-06-10T09:00:00Z',
  endDateTime: '2025-06-10T17:00:00Z',
  isAvailable: true,
  isTelemedicineAvailable: true,
  specialtiesAvailable: ['Cardiology', 'Internal Medicine'],
  recurrencePattern: 'WEEKLY',
  recurrenceEndDate: '2025-07-10T17:00:00Z'
};

// POST to /provider-availability
```

### Scheduling an Appointment

```typescript
// Create a new appointment
const appointment = {
  patientId: 'patient-456',
  providerId: 'doctor-123',
  startDateTime: '2025-06-10T10:00:00Z',
  endDateTime: '2025-06-10T11:00:00Z',
  appointmentType: 'ROUTINE',
  medicalPriority: 'MEDIUM',
  reasonForVisit: 'Annual checkup',
  isTelemedicine: false
};

// POST to /appointments
```

### Recording Consultation Notes

```typescript
// Create consultation notes after an appointment
const consultationNote = {
  appointmentId: 'appointment-789',
  providerId: 'doctor-123',
  patientId: 'patient-456',
  notes: 'Patient presented with...',
  diagnosis: 'Hypertension',
  treatmentPlan: 'Prescribed medication and lifestyle changes',
  prescriptions: ['Lisinopril 10mg', 'Hydrochlorothiazide 12.5mg'],
  followUpRequired: true,
  followUpTimeframe: '3 months'
};

// POST to /consultation-notes
```

## Testing

Comprehensive unit tests are available for all services:

- `appointments.service.spec.ts`
- `consultation-notes.service.spec.ts`
- `provider-availability.service.spec.ts`
- `notification.service.spec.ts`

Run tests with:

```bash
npm run test -- --testPathPattern=appointments
```

## Future Enhancements

- Integration with external calendar systems (Google Calendar, Outlook)
- SMS notification capabilities
- Patient self-scheduling portal
- Waitlist management for high-demand providers
- Advanced analytics for appointment utilization and provider efficiency
