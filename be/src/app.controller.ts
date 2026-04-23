import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// AppController là controller chính của ứng dụng, định nghĩa route gốc (route /)
// Cái này là mẫu
@Controller() // Decorator định nghĩa route (route /)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // Decorator định nghĩa method GET (GET /)
  getHello(): string {
    return this.appService.getHello();
  }
}
