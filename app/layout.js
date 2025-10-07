import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Rishiji - Spiritual Wisdom & Divine Guidance",
  description: "Discover profound spiritual teachings, meditation guidance, and divine wisdom from Rishiji. Transform your life through ancient wisdom and spiritual practices.",
  icons: {
    icon: "/logom.webp",
    shortcut: "/logom.webp",
    apple: "/logom.webp",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
        style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
      >
        <Navbar />
        <div className="h-16" /> {/* Navbar spacer - reduced height */}
        {children}
      </body>
    </html>
  );
}
