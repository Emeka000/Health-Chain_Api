/**
 * Enum for medical priority levels to classify appointments
 */
export enum MedicalPriority {
  LOW = 'LOW', // Routine, non-urgent care
  MEDIUM = 'MEDIUM', // Needs attention but not urgent
  HIGH = 'HIGH', // Urgent care needed
  EMERGENCY = 'EMERGENCY', // Immediate medical attention required
}
