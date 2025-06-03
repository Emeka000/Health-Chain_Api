import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    HttpStatus,
    ParseIntPipe,
    Logger,
    Req,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
  } from '@nestjs/swagger';
  import { Request } from 'express';
  import { PolicyService } from '../services/policy.service';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../../auth/guards/roles.guard';
  import { Roles } from '../../auth/decorators/roles.decorator';
  
  interface AuthenticatedRequest extends Request {
    user: {
      id: number;
      roles: string[];
    };
  }
  
  @ApiTags('Policy Management')
  @Controller('policies')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class PolicyController {
    private readonly logger = new Logger(PolicyController.name);
  
    constructor(private readonly policyService: PolicyService) {}
  
    @Post()
    @Roles('admin', 'compliance_officer', 'policy_manager')
    @ApiOperation({ summary: 'Create a new policy or procedure' })
    @ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Policy created successfully',
    })
    async createPolicy(
      @Body() createPolicyDto: any, 
      @Req() req: AuthenticatedRequest,
    ) {
      this.logger.log(`Creating policy: ${createPolicyDto.number}`);
      return 'Policy creation not implemented yet';
    }
  
    @Get('due-for-review')
    @Roles('admin', 'compliance_officer', 'policy_manager')
    @ApiOperation({ summary: 'Get policies due for review' })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Policies due for review retrieved successfully',
    })
    async getPoliciesDueForReview() {
      this.logger.log('Getting policies due for review');
      return 'Policy review listing not implemented yet';
    }
  }