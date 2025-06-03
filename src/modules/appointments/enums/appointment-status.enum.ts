/**
 * Enum for appointment statuses following FHIR R4 AppointmentStatus ValueSet
 */
export enum AppointmentStatus {
  PROPOSED = 'PROPOSED',
  PENDING = 'PENDING',
  BOOKED = 'BOOKED',
  ARRIVED = 'ARRIVED',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  NOSHOW = 'NOSHOW',
  WAITLIST = 'WAITLIST',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  RESCHEDULED = 'RESCHEDULED',
}
