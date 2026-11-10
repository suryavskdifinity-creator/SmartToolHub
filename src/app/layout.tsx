import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

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

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-7504961737515196";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const hasAdsense =
    Boolean(ADSENSE_CLIENT) && !ADSENSE_CLIENT.includes("XXXXXXXX");

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        {/* Must be in real HTML for AdSense site verification crawler */}
        {hasAdsense && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
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
