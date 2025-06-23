import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import CharacterStats from "@/components/layout/CharacterStats";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Image Describer",
  description: "Upload an image and get an AI-generated description.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-gray-900 text-white flex flex-col h-full`}>
        <Header />
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-2 mb-4">
          <CharacterStats />
        </div>
        <main className="font-sans p-4 md:p-8 flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
