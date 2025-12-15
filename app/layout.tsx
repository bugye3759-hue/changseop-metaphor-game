import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "신창섭의 비유 고사 | 메이플스토리 풍자 AI 게임",
  description: "군대, 연애, 학교 등 다양한 상황을 비유해보세요. 신창섭 디렉터 AI가 당신의 드립력을 냉철하게 평가합니다. (무료 플레이)",
  keywords: ["신창섭", "김창섭", "메이플스토리", "비유고사", "신창섭게임", "쌀숭이", "AI게임"],
  openGraph: {
    title: "신창섭의 비유 고사 - 팩트폭력 AI 평가",
    description: "너 쌀숭이야? 드립력 테스트하고 명예의 전당 도전해라.",
    images: [
      {
        url: "/og-image.png", // 카톡 공유할 때 뜰 이미지 (나중에 추가 가능)
        width: 800,
        height: 600,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
