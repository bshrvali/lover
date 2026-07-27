import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Lover",
  description: "Mənimlə sevgili olarsan?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body className={`${display.variable} ${body.variable} ${script.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
