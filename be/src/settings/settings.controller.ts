import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdatePricingPolicyDto } from './dto/update-pricing-policy.dto';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('pricing-policies')
  async listPricingPolicies() {
    return this.settingsService.listPricingPolicies();
  }

  @Put('pricing-policies/:id')
  async updatePricingPolicy(
    @Param('id') id: string,
    @Body() dto: UpdatePricingPolicyDto,
  ) {
    return this.settingsService.updatePricingPolicy(id, dto);
  }
}
