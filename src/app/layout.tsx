import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { sora } from "./fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster } from "@/components/ui/sonner"

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pulse-ttm.com"),
  title: "Pulse TTM",
  description: "Профессиональный инструмент для работы с календарями, обработки заявок и эффективного администрирования.",
  openGraph: {
    title: "Pulse TTM",
    description: "Профессиональный инструмент для работы с календарями, обработки заявок и эффективного администрирования.",
    siteName: "Pulse TTM",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "https://corede.site/images/pulse-ttm-banner-1920x1080.png",
        width: 1920,
        height: 1080,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse TTM",
    description: "Профессиональный инструмент для работы с календарями, обработки заявок на корректировку и эффективного администрирования.",
    images: ["https://corede.site/images/pulse-ttm-banner-1920x1080.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interSans.variable} ${geistMono.variable} ${sora.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
