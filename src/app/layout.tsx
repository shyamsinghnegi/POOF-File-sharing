import type { Metadata } from "next";
import { Space_Mono, UnifrakturCook } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400","700"],
  subsets: ["latin"],
});
const unifrakturCook = UnifrakturCook({
  variable: "--font-unifraktur",
  weight: ["700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "poof",
  description: "Fast, secure file sharing that's gone in 24h.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${unifrakturCook.variable}`}>
      <body>{children}</body>
    </html>
  );
}