import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import CookieConsent from "./components/CookieConsent";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${barlowCondensed.variable} ${dmSans.variable} antialiased`}
      >
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
