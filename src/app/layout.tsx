import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import FloatingCart from "@/components/FloatingCart";
import SocialProofFOMO from "@/components/SocialProofFOMO";

export const metadata: Metadata = {
  metadataBase: new URL('https://deskilz.ng'),
  title: "Déskilz Restaurant | Fresh Bites, Shawarma, Pizza & Fast WhatsApp Ordering",
  description:
    "Experience the delicious taste of Déskilz. Freshly prepared shawarma, artisanal pizza, flame-grilled burgers, authentic food, ice cream, and refreshing drinks ordered directly on WhatsApp.",
  keywords: [
    "Déskilz",
    "Déskilz Restaurant",
    "Shawarma",
    "Pizza",
    "Burgers",
    "Nigerian Food",
    "Jollof Rice",
    "Ice Cream",
    "WhatsApp Food Ordering",
  ],
  openGraph: {
    title: "Déskilz Restaurant | Satisfying Meals, Snacks & Drinks",
    description:
      "Order hot and freshly prepared meals from Déskilz directly through WhatsApp. Browse our full 70-product approved catalogue.",
    url: "https://deskilz.ng",
    siteName: "Déskilz Restaurant",
    images: [
      {
        url: "/image/deskilz-logo.png",
        width: 400,
        height: 400,
        alt: "Déskilz Logo",
      },
    ],
    locale: "en_NG",
    type: "website",
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
          <SocialProofFOMO />
        </CartProvider>
      </body>
    </html>
  );
}
