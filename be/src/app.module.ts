import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';

@Module({
	imports: [UsersModule, AuthModule, PrismaModule, SettingsModule], // Làm module con nào thì import vào đây
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}