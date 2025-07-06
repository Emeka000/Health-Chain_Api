import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientAccessService {
  canAccess(user: User, patient: Patient): boolean {
    if (user.department !== patient.assignedDepartment && !user.permissions?.includes('emergency_override')) {
      throw new ForbiddenException('Access denied to this patient');
    }
    return true;
  }
}
