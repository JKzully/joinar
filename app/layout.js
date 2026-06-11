import { Manrope, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import CookieConsent from "./components/CookieConsent";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "700", "800"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://getpicked.co"),
  title: "Picked — Get picked by teams hiring this window",
  description:
    "One coach-ready basketball profile. Film, stats, availability — and direct messages from teams hiring across Europe. No agents required.",
  openGraph: {
    title: "Picked — Get picked by teams hiring this window",
    description:
      "One coach-ready basketball profile. Film, stats, availability — and direct messages from teams hiring across Europe.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
      >
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
