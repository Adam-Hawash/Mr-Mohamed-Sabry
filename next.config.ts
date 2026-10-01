import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  /* نطاقات البريفيو في الساندبوكس — عشان الـ JS chunks تتحمل من دومين المعاينة */
  allowedDevOrigins: ["localhost", "127.0.0.1", "**.space-z.ai", "*.space-z.ai", "space-z.ai"],
  /* ملف قاعدة البيانات لازم يوفر مع دوال الـ API على Vercel —
     بدون السطر ده القاعدة مش بتوصل مع الـ lambda والبيانات بتفشل */
  outputFileTracingIncludes: {
    "/api/**/*": ["./db/custom.db"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
