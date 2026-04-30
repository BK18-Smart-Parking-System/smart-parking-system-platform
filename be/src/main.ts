import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // Khởi tạo ứng dụng NestJS với AppModule làm module gốc
  const app = await NestFactory.create(AppModule);
  // Thêm prefix /api cho tất cả các route
  app.setGlobalPrefix('api');
  // Sử dụng ValidationPipe để tự động validate dữ liệu đầu vào dựa trên các DTO đã định nghĩa
  app.useGlobalPipes(new ValidationPipe());
  // Parse cookie từ request
  app.use(cookieParser());
  // Cấu hình CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // Cho phép tất cả các nguồn hoặc chỉ định một nguồn cụ thể
    methods: 'GET,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
    credentials: true, // Cho phép gửi cookie và thông tin xác thực
  });
  // Lắng nghe port được chỉ định trong biến môi trường PORT hoặc mặc định là 8080
  await app.listen(process.env.PORT ?? 8080);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
}
bootstrap();
