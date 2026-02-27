import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BookQuest",
  description: "Plataforma de leitura gamificada",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`dark ${mono.variable}`}>
      <body className="bg-gray-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
