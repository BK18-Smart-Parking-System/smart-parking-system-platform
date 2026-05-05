import { Module } from '@nestjs/common';
import { GuestCardController } from './guest-card.controller';
import { GuestCardService } from './guest-card.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GuestCardController],
  providers: [GuestCardService],
})
export class GuestCardModule {}
