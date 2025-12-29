import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "工具平台",
  description: "一个现代化的全栈工具平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

