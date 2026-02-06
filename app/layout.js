import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Picked — Where Basketball Talent Meets Opportunity",
  description:
    "The marketplace connecting semi-pro basketball players and teams across Europe. Create your profile, get discovered, and find your next opportunity. Free.",
  openGraph: {
    title: "Picked — Where Basketball Talent Meets Opportunity",
    description:
      "The marketplace connecting semi-pro basketball players and teams across Europe. Create your profile, get discovered, and find your next opportunity.",
    images: [{ url: "/og-image.png", width: 1080, height: 1080 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
