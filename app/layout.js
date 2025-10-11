import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MyHealthLink" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
