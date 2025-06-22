import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
        <main className="font-sans p-4 md:p-8 flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
