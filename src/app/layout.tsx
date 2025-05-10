import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Live Price Chart - Real-time Cryptocurrency Price Tracking",
  description: "Track cryptocurrency prices in real-time with our interactive live price chart. Get instant updates, historical data, and market insights.",
  keywords: "cryptocurrency, live price, price chart, real-time tracking, crypto market, bitcoin, ethereum",
  authors: [{ name: "Realtyna" }],
  creator: "Realtyna",
  publisher: "Realtyna",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://live-price-chart.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Live Price Chart - Real-time Cryptocurrency Price Tracking",
    description: "Track cryptocurrency prices in real-time with our interactive live price chart. Get instant updates, historical data, and market insights.",
    url: "https://live-price-chart.vercel.app",
    siteName: "Live Price Chart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Live Price Chart Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Price Chart - Real-time Cryptocurrency Price Tracking",
    description: "Track cryptocurrency prices in real-time with our interactive live price chart. Get instant updates, historical data, and market insights.",
    images: ["/twitter-image.png"],
    creator: "@realtyna",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
    yandex: "your-yandex-verification",
    yahoo: "your-yahoo-verification",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
