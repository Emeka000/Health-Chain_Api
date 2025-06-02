import { Controller } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import type { StaffService } from "./staff.service"

@ApiTags("staff")
@Controller("staff")
export class StaffController {
  constructor(private readonly staffService: StaffService) {}
}
