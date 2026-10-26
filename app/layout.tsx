import type { Metadata } from "next";
import { Geist_Mono, Inter, Manrope } from "next/font/google";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ziki · Standing orders (mock-up)",
  description: "A mock-up of Ziki where owners pre-authorize their agents with standing orders, and Ziki holds the offers that need a person.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} ${geistMono.variable} min-h-screen overflow-x-clip font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-3 pt-4 pb-32 sm:px-6 sm:pt-8 lg:pb-16">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
