import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { ShopShell } from "@/components/layout/ShopShell";
import Script from "next/script";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bella Dama | Maquillaje y Belleza",
  description: "Tienda de maquillaje y belleza",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${playfair.variable} ${dmSans.variable} ${cormorant.variable} font-body bg-lumiere-cream text-lumiere-charcoal antialiased`}
      >
        <ToastProvider>
          <ShopShell>{children}</ShopShell>
        </ToastProvider>
        <Script 
          src="https://accounts.google.com/gsi/client" 
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}