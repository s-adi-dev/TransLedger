import { TanstackProvider } from "@/components/providers/tanstack";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppConfig } from "@/lib/config";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const revueFont = localFont({
  src: "../public/fonts/revue.ttf",
  variable: "--font-revue",
});

export const metadata: Metadata = {
  title: AppConfig.company.name,
  description: AppConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${revueFont.variable} antialiased bg-secondary`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TanstackProvider>
            {children}
            <Toaster position="top-right" className="whitespace-pre-line" />
          </TanstackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
