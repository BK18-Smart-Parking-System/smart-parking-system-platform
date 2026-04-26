import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Đây là Guard giả định
    // Trong thực tế, bạn sẽ dùng @nestjs/passport và extends AuthGuard('jwt')
    const request = context.switchToHttp().getRequest();
    // Giả lập gán user vào request
    request.user = { id: 'dummy-id', role: 'ADMIN' };
    return true;
  }
}
