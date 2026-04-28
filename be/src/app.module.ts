import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ParkingModule } from './parking/parking.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentDashboardModule } from './student-dashboard/student-dashboard.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule, AuthModule, PrismaModule, ParkingModule, StudentDashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
