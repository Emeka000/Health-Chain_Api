import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { ShiftsService } from "./shifts.service"
import type { CreateShiftDto } from "./dto/create-shift.dto"
import type { CreateShiftHandoffDto } from "./dto/create-shift-handoff.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("shifts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("shifts")
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shift' })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all shifts" })
  @ApiResponse({ status: 200, description: "List of shifts" })
  findAll() {
    return this.shiftsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shift by ID' })
  @ApiResponse({ status: 200, description: 'Shift details' })
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  @Post('handoffs')
  @ApiOperation({ summary: 'Create shift handoff' })
  @ApiResponse({ status: 201, description: 'Handoff created successfully' })
  createHandoff(@Body() createHandoffDto: CreateShiftHandoffDto) {
    return this.shiftsService.createHandoff(createHandoffDto);
  }
}
