import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { WeddingTheme } from "@/components/wedding-theme";

export const metadata: Metadata = {
  title: "婚礼座位管理系统",
  description: "智能婚礼座位安排，实时协作",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <WeddingTheme />
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}
