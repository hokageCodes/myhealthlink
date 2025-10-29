import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "MyHealthLink - One Link for Your Health",
  description: "Secure, mobile-first platform to store, organize, and share your health information via a single link or QR code.",
  keywords: "health records, medical data, health tracking, emergency health, Nigeria health",
  authors: [{ name: "MyHealthLink Team" }],
  openGraph: {
    title: "MyHealthLink - One Link for Your Health",
    description: "Store and share your health information securely",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
