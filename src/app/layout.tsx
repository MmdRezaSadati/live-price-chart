import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Price Chart - Real-time Cryptocurrency Price Tracking",
  description:
    "Track cryptocurrency prices in real-time with our interactive live price chart. Get instant updates, historical data, and market insights.",
  keywords:
    "cryptocurrency, live price, price chart, real-time tracking, crypto market, bitcoin, ethereum",
  authors: [{ name: "Mohamad Reza Sadati" }],
  creator: "Mohamad Reza Sadati",
  publisher: "Mohamad Reza Sadati",
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
    description:
      "Track cryptocurrency prices in real-time with our interactive live price chart. Get instant updates, historical data, and market insights.",
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
  },,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
