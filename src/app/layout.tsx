import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa-register";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "ELMASRY ELECTRIC | أدوات ومستلزمات الكهرباء",
  description:
    "محل ELMASRY ELECTRIC للأدوات الكهربائية — أسلاك، قواطع، لمبات، خراطيم، دوايات، لحام وستنشيل. أسعار بالجنيه المصري وثبّت التطبيق على هاتفك!",
  keywords: ["ELMASRY ELECTRIC", "أدوات كهربائية", "أسلاك", "قواطع", "لمبات", "خراطيم", "دوايات", "مصر"],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ELMASRY ELECTRIC",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased bg-zinc-950 text-foreground`}>
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
