import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "مستر محمد صبري | اللغة العربية",
  description:
    "منصّة مستر محمد صبري لتعليم اللغة العربية — دروس مشروحة، واجبات دورية، امتحانات تفاعلية، ومتابعة مستمرة. نُحبّ العربية ونُتقنها معًا.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#071A14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* الخطوط العربية الزخرفية — عماني/رقعة للعناوين، أميري للنص القرآني، كوفي للمسادات، القاهرة للنصوص */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- الخطوط عبر CDN عمدًا (next/font بيعطل مع Turbopack في بيئة التطوير) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Reem+Kufi:wght@400;500;600;700&family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster position="top-center" richColors closeButton expand={false} />
      </body>
    </html>
  );
}
