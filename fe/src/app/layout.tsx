import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/index.css";
import { RoleProvider } from "../contexts/RoleContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hệ thống quản lý bãi đỗ xe thông minh HCMUT",
  description: "Hệ thống quản lý bãi đỗ xe thông minh HCMUT giúp sinh viên và nhân viên của trường dễ dàng tìm kiếm và quản lý chỗ đỗ xe, đồng thời cung cấp các tính năng như thanh toán trực tuyến, lịch sử giao dịch và báo cáo chi tiết.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
