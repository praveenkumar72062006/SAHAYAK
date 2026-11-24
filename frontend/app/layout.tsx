import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sahayak - Hyper-Local Job Matching for Informal Workers",
  description: "AI-powered multilingual job portal for informal and semi-skilled workers in India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-between`}
      >
        <Providers>
          <Header />
          <main className="flex-1 pb-10">
            {children}
          </main>
          <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-6 text-center text-sm text-gray-500">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-medium text-gray-700">🏆 Sahayak (सहायक) · Hack With Delhi 4.0 · Track 6: Education, Skills and Employment</p>
              <p className="text-xs text-gray-500 mt-1">Direct, bilingual, hyper-local job matching for informal and semi-skilled workers across Delhi NCR 🇮🇳</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
