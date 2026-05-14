import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "新人教育システム",
  description: "動画学習、クイズ、スキル可視化で新人教育を進める社内研修アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
