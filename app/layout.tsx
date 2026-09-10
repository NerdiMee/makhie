import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Makhie — Market Access, Knowledge & Help for Individual Entrepreneurs",
  description:
    "Makhie builds free financial and educational tools for small businesses that have never had them — so business owners working with nothing can compete with, and look like, the businesses that have everything.",
  icons: { icon: "/assets/logo-small.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* The one design system, shared with every static tool page. */}
        <link rel="stylesheet" href="/assets/site.css" />
      </head>
      <body>
        {children}
        {/* The shared platform layer (auth widget, texture, glints, consent,
            telemetry, calculator) enhances React pages exactly as it does the
            static tools — it mounts outside the React tree. */}
        <Script src="/assets/vendor/supabase.js" strategy="beforeInteractive" />
        <Script src="/assets/vendor/qrcode.js" strategy="beforeInteractive" />
        <Script src="/assets/makhie.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
