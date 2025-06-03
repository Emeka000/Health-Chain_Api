import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }
}
