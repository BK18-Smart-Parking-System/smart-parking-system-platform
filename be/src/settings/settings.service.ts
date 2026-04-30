import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePricingPolicyDto } from './dto/update-pricing-policy.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // Lấy toàn bộ chính sách giá, sắp xếp theo role để UI hiển thị có thứ tự
  async listPricingPolicies() {
    return this.prisma.pricingPolicy.findMany({
      orderBy: [{ role: 'asc' }, { effectiveFrom: 'desc' }],
    });
  }

  // Cập nhật 1 policy theo id
  async updatePricingPolicy(id: string, dto: UpdatePricingPolicyDto) {
    const existing = await this.prisma.pricingPolicy.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Không tìm thấy pricing policy với id '${id}'`);
    }

    return this.prisma.pricingPolicy.update({
      where: { id },
      data: {
        ...dto,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      },
    });
  }
}
