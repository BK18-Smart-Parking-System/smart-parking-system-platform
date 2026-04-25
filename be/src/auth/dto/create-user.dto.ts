import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { Role } from '../../../generated/prisma'
/**
 * DTO (Data Transfer Object) dùng để validate dữ liệu từ Client gửi lên qua POST request.
 * Sử dụng các decorator của class-validator để định nghĩa quy tắc validate cho từng trường.
 * Test thử bằng POST http://localhost:8080/auth/register với body JSON như sau:
 * {
 *   "username": "testuser",
 *   "email": "test@gmail.com",
 *   "password": "password123",
 *   "fullName": "Test User",
 *   "role": "STUDENT"
 * }
 * Sẽ nhận được lỗi validate với thông báo chi tiết cho từng trường.
 * Có thể dùng Postman hoặc curl để gửi request thử.
*/
export class CreateUserDto {
  @IsString({ message: 'Mã số định danh phải là chuỗi ký tự' })
  @IsOptional()
  universityId?: string;

  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Tên đăng nhập phải có ít nhất 6 ký tự' })
  username!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password!: string;

  @IsString({ message: 'Họ và tên phải là chuỗi ký tự' })
  fullName!: string;

  @IsEnum(Role, { message: 'Quyền hạn không hợp lệ. Phải thuộc: ADMIN, STUDENT, STAFF, GUEST' })
  role!: Role;

  // Quản lý công nợ (Optional khi tạo mới)
  
  @IsNumber({}, { message: 'Số tiền nợ phải là số thực' })
  @IsOptional()
  debtAmount?: number;

  @IsDateString({}, { message: 'Ngày hết hạn không đúng định dạng ngày tháng' })
  @IsOptional()
  dueDate?: Date;
}