import { Injectable } from "@nestjs/common";
import { EmergencyOverride } from "./entities/emergency-overide.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { AccessLog } from "./entities/access-control.entity";
import { Repository } from "typeorm";
import { Patient } from "./entities/patient.entity";
import { User } from "src/entities/user.entity";

@Injectable
()
export class EmergencyOverrideService {
  constructor(
    @InjectRepository(EmergencyOverride) private overrideRepo: Repository<EmergencyOverride>,
    @InjectRepository(AccessLog) private logRepo: Repository<AccessLog>,
  ) {}

  async overrideAccess(user: User, patient: Patient, reason: string) {
    await this.overrideRepo.save({ user, patient, reason, timestamp: new Date() });

    await this.logRepo.save({
      user,
      action: 'override_access',
      resource: `patient:${patient.id}`,
      timestamp: new Date(),
      reason,
    });

    // Allow access temporarily (you can use a flag or cache mechanism)
  }
}
