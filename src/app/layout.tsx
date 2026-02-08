import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import { ToastContainer } from "react-toastify";
import "./globals.css";

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
        <ToastContainer  aria-label="Toast notifications"/>
      <main>
        {children}
      </main>
      </body>
    </html>
  );
}
