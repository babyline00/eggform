import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EggForm — Virtual Egg Farming, Gaming & PKR Wallet",
  description:
    "EggForm is a complete virtual egg ecosystem: build your farm, hatch eggs, collect animals, trade on the marketplace, complete missions, and manage a separate PKR wallet for eligible real-money transactions.",
  keywords: [
    "EggForm",
    "virtual egg farming",
    "egg hatching",
    "PKR wallet",
    "marketplace",
    "game economy",
    "Pakistan gaming",
  ],
  authors: [{ name: "EggForm" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EggForm",
  },
  openGraph: {
    title: "EggForm — Virtual Egg Farming & PKR Wallet Platform",
    description:
      "Build your farm, hatch eggs, trade on the marketplace, and manage a separate PKR wallet.",
    siteName: "EggForm",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EggForm",
    description: "Virtual egg farming, gaming, marketplace, and PKR wallet platform.",
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
        className={`${jakartaSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
