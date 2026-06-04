import type { Metadata } from "next";
import "./globals.css";

const SITE_TITLE = "Anima | 광고대행사 1/10 비용으로 두는 브랜드 전담 에디터";
const SITE_DESCRIPTION =
  "오글거리는 인스타 감성, 알맹이 없는 AI 양산형 글은 이제 그만. 완벽한 말맛과 철학을 담은 1인칭 구어체로 끈끈한 팬덤을 모으는 스레드 콘텐츠 솔루션, Anima 스튜디오.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL("https://anima.oursmartlife.kr"),
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: "Anima 스튜디오",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 633,
        alt: "Anima Studio for Thread",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
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
