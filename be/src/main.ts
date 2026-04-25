import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Khởi tạo ứng dụng NestJS với AppModule làm module gốc
  const app = await NestFactory.create(AppModule);
  // Sử dụng ValidationPipe để tự động validate dữ liệu đầu vào dựa trên các DTO đã định nghĩa
  app.useGlobalPipes(new ValidationPipe());
  // Lắng nghe port được chỉ định trong biến môi trường PORT hoặc mặc định là 8080
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
