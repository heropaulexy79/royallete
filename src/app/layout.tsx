import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import FloatingCart from "@/components/FloatingCart";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deskilz.vercel.app';
const SHARE_TITLE = 'Déskilz Restaurant | Fast Food, Shawarma & Pizza in Obantoko';
const SHARE_DESCRIPTION =
  'Looking for delicious food in Obantoko, Abeokuta? Enjoy Shawarma, Pizza, Burgers, Ice Cream, Snacks and more at Déskilz. We also offer bulk orders and party packs. Explore our full menu';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SHARE_TITLE,
  description: SHARE_DESCRIPTION,
  keywords: [
    "Déskilz",
    "Déskilz Restaurant",
    "Fast Food in Obantoko",
    "Obantoko Abeokuta",
    "Shawarma",
    "Pizza",
    "Burgers",
    "Ice Cream",
    "Snacks",
    "Bulk Orders",
    "Party Packs",
    "WhatsApp Food Ordering",
  ],
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Déskilz Restaurant",
    images: [
      {
        url: "/image/deskilz-logo.png",
        width: 400,
        height: 400,
        alt: "Déskilz Restaurant Logo",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: ["/image/deskilz-logo.png"],
  },
  icons: {
    icon: "/image/deskilz-logo.png",
    apple: "/image/deskilz-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#e11d2a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased selection:bg-brand-primary selection:text-white pb-16 sm:pb-0 min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <CartProvider>
          {children}
          <FloatingCart />
        </CartProvider>
      </body>
    </html>
  );
}
