import { Injectable } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import type { NursesService } from "../nurses/nurses.service"
import type { Nurse } from "../nurses/entities/nurse.entity"

@Injectable()
export class AuthService {
  constructor(
    private nursesService: NursesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const nurse = await this.nursesService.findByEmail(email)
    if (nurse && (await bcrypt.compare(password, nurse.password))) {
      const { password, ...result } = nurse
      return result
    }
    return null
  }

  async login(nurse: Nurse) {
    const payload = { email: nurse.email, sub: nurse.id, role: nurse.role }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: nurse.id,
        email: nurse.email,
        fullName: nurse.fullName,
        role: nurse.role,
      },
    }
  }
}
