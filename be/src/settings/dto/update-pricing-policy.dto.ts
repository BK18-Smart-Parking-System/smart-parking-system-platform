import { IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { BillingCycle } from '../../../generated/prisma';

// Tất cả field đều optional vì UI cho phép sửa từng cột riêng lẻ
export class UpdatePricingPolicyDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerHour?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDailyPrice?: number;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
