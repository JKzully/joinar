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
  title: "Picked — The basketball roster network",
  description:
    "Build a coach-ready profile, get seen by teams across 28 countries, take the call — without agents, politics, or the wait.",
  openGraph: {
    title: "Picked — The basketball roster network",
    description:
      "Build a coach-ready profile, get seen by teams across 28 countries, take the call.",
    images: [{ url: "/og-image.png", width: 1080, height: 1080 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
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
