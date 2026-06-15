import { Manrope, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "700", "800"],
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
  title: "Picked — The European basketball player market",
  description:
    "A professional basketball player market for Europe. Players build profiles and declare availability. Clubs open roster search and review prospects.",
  openGraph: {
    title: "Picked — The European basketball player market",
    description:
      "Players enter the market. Clubs search the market. Interest is exchanged.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${jetbrainsMono.variable}`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
