import { IsString, MinLength } from "class-validator";

export class LoginDto {
    @IsString({ message: 'Tên đăng nhập phải là chuỗi ký tự' })
    @MinLength(6, { message: 'Tên đăng nhập phải có ít nhất 6 ký tự' })
    username!: string;

    @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
    @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
    password!: string;
}