import { Menu } from "@/components/ui/menu";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import { FlashToast } from "@/components/ui/flash-toast";
import { Toaster } from "sonner";
import { TOAST_OPTIONS } from "@/constants/toast-options";
import { Suspense } from "react";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
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
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
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
        <Toaster toastOptions={{ classNames: TOAST_OPTIONS.classNames }} />
        <Suspense fallback={null}>
          <FlashToast
            configByValue={{
              "recipe-saved": {
                message: "Recipe saved.",
                variant: "success",
              },
              "signed-in": {
                message: "Signed in.",
                variant: "success",
              },
              "signed-out": {
                message: "Signed out.",
                variant: "success",
              },
            }}
          />
        </Suspense>
        <Menu />
        {children}
        <Footer />
      </body>
    </html>
  );
}
