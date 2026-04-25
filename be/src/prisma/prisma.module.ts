import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Dùng @Global() để không phải import PrismaModule lặp lại ở nhiều nơi
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}