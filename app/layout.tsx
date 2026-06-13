import type { Metadata } from "next";
import "./globals.css";
import AppInitializer from "@/components/layout/AppInitializer";

export const metadata: Metadata = {
  title: "NexPlumb — Your Vetted Artisan, One Tap Away in Lagos",
  description: "Find verified, NIN-checked plumbers, electricians, carpenters and painters near you in Lagos. Secure escrow payments, real-time GPS tracking and quality guaranteed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full select-none">
      <body className="min-h-full bg-lgray text-body font-sans flex flex-col">
        <AppInitializer />
        {children}
      </body>
    </html>
  );
}
