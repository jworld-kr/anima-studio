import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anima Studio for Thread — 페르소나 기반 콘텐츠 스튜디오",
  description:
    "로고 너머의 브랜드. Anima는 브랜드의 페르소나를 빚고, 그 페르소나로 Thread 콘텐츠를 만들어내는 스튜디오입니다.",
  metadataBase: new URL("https://anima.studio"),
  openGraph: {
    title: "Anima Studio for Thread — 페르소나 기반 콘텐츠 스튜디오",
    description: "로고 너머의 브랜드. 페르소나로 시작하는 Thread 콘텐츠.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        {/* Display: Fraunces */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..600&display=swap"
        />
        {/* Mono: JetBrains Mono */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        />
        {/* Body (KR + EN): Pretendard Variable */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
