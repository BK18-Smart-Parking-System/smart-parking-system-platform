import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ParkingModule } from './parking/parking.module';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { StudentDashboardModule } from './student-dashboard/student-dashboard.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [UsersModule, AuthModule, PrismaModule, SettingsModule, ParkingModule, StudentDashboardModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
