/**
 * Interface định nghĩa cấu trúc của một User trong ứng dụng.
 * Giúp TypeScript kiểm soát lỗi logic khi viết code.
 * Đóng vai trò giống 1 kiểu dữ liệu (thiếu thuộc tính nào thì TypeScript sẽ báo lỗi liền)
 */
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user'; // Chỉ cho phép 2 giá trị này
  createdAt: Date;
}