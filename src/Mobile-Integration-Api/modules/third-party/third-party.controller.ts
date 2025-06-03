import { Controller, Get, Post, Body, Headers, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../../guards/auth.guard';
import { ThirdPartyService } from './third-party.service';
import { WebhookDto, IntegrationConfigDto } from './dto/third-party.dto';

@ApiTags('Third Party Integration')
@Controller('third-party')
export class ThirdPartyController {
  constructor(private thirdPartyService: ThirdPartyService) {}

  @Version('1')
  @Post('webhook')
  @ApiOperation({ summary: 'Receive third-party webhooks' })
  @ApiHeader({ name: 'X-Webhook-Signature', required: true })
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async receiveWebhook(
    @Body() webhookDto: WebhookDto,
    @Headers('x-webhook-signature') signature: string
  ) {
    return this.thirdPartyService.processWebhook(webhookDto, signature);
  }

  @Version('1')
  @Get('integrations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available integrations' })
  async getIntegrations() {
    return this.thirdPartyService.getIntegrations();
  }

  @Version('1')
  @Post('integrations/configure')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Configure third-party integration' })
  async configureIntegration(@Body() configDto: IntegrationConfigDto) {
    return this.thirdPartyService.configureIntegration(configDto);
  }

  @Version('1')
  @Post('integrations/epic/sync')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync with Epic EHR' })
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  async syncEpic() {
    return this.thirdPartyService.syncEpic();
  }

  @Version('1')
  @Post('integrations/cerner/sync')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync with Cerner EHR' })
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  async syncCerner() {
    return this.thirdPartyService.syncCerner();
  }
}
