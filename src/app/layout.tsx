import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import "./nprogress.css";
import NavigationProgress from "@/src/components/NavigationProgress";
import { AuthInitializer } from "@/src/components/AuthInitializer";
import GlobalLoadingProvider from "@/src/components/providers/GlobalLoadingProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scan To Order",
  description: "Quản lý nhà hàng hiệu quả với Scan To Order",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AuthInitializer />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <GlobalLoadingProvider />
        <ToastContainer aria-label="Toast notifications" />
        <main>{children}</main>
      </body>
    </html>
  );
}
