import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "SmartToolHub — Free Online Tools for Every Task",
    template: "%s · SmartToolHub",
  },
  description:
    "Professional free online toolkit: word counter, translator, calculators, developer utilities, QR generator, password tools and more. Privacy-first, no account required.",
  keywords: [
    "free online tools",
    "word counter",
    "translator",
    "JSON formatter",
    "QR code generator",
    "password generator",
    "calculator",
    "developer tools",
  ],
  authors: [{ name: "SmartToolHub" }],
  openGraph: {
    title: "SmartToolHub — Free Online Tools",
    description:
      "A practical collection of free tools for writing, calculations, development and productivity.",
    type: "website",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
  const hasRealAdsense =
    adsenseClient && !adsenseClient.includes("XXXXXXXX");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {hasRealAdsense && (
          <Script
            id="adsense-init"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
