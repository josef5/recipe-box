import { Menu } from "@/components/ui/menu";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recipe Box",
  description: "A collection of recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Temp */}
        <script
          src="https://mcp.figma.com/mcp/html-to-design/capture.js"
          async
        />
      </head>
      <body className="mx-auto flex min-h-full max-w-4xl flex-col px-4 sm:px-6">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Menu />
        {children}
        <Footer />
      </body>
    </html>
  );
}
