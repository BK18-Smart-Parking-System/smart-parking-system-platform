import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

/**
 * DTO (Data Transfer Object) dùng để validate dữ liệu từ Client gửi lên qua POST request.
 * Sử dụng các decorator của class-validator để định nghĩa quy tắc validate cho từng trường.
 * Test thử bằng POST http://localhost:8080/users với body:
  {
    "username":"ab",
    "email":"admin",
    "password":"12345",
    "role":"admi"
  }
 * Sẽ nhận được lỗi validate với thông báo chi tiết cho từng trường.
 * Có thể dùng Postman hoặc curl để gửi request thử.
*/
export class CreateUserDto {
  // Dấu "!": Non-null assertion operator, đảm bảo rằng các trường này sẽ được gán giá trị khi tạo đối tượng
  // Thêm dấu này cho đỡ báo lỗi thôi, không thêm vẫn chạy được

  @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Tên đăng nhập phải có ít nhất 6 ký tự' })
  username!: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password!: string;

  @IsEnum(['admin', 'user'], { message: 'Quyền hạn không hợp lệ' })
  @IsOptional() // Có thể gửi hoặc không
  role?: string;
}