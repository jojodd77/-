import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "发音修正平台",
  description: "TTS发音修正和优化工具平台",
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

