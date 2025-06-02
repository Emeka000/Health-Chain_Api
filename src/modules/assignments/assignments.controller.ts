import { Controller, Get, Post, Body, Patch, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { AssignmentsService } from "./assignments.service"
import type { CreateAssignmentDto } from "./dto/create-assignment.dto"
import type { UpdateAssignmentDto } from "./dto/update-assignment.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@ApiTags("assignments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("assignments")
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiResponse({ status: 201, description: 'Assignment created successfully' })
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all assignments" })
  @ApiResponse({ status: 200, description: "List of assignments" })
  findAll() {
    return this.assignmentsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  @ApiResponse({ status: 200, description: 'Assignment details' })
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update assignment" })
  @ApiResponse({ status: 200, description: "Assignment updated successfully" })
  update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
    return this.assignmentsService.update(id, updateAssignmentDto)
  }
}
