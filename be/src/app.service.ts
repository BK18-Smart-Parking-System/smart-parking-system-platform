import { Injectable } from '@nestjs/common';

// File này chứa các service để các module có thể import và sử dụng
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
