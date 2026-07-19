import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const sora = Sora({ 
  subsets: ["latin"], 
  weight: ["300", "700"],
  variable: "--font-sora" 
});

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600"],
  variable: "--font-inter" 
});

export const metadata: Metadata = {
  title: "MediMind AI | Clinical Decision Support",
  description: "AI-Powered Clinical Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${sora.variable} font-inter min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
