import type { Metadata } from "next";
import { brandLogo } from "@/lib/brand";
import SiteMotion from "@/components/SiteMotion";
import "lenis/dist/lenis.css";
import "@fontsource-variable/manrope/index.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://127.0.0.1:3000"),
  title: "VAVI Tile Studio — From imagination to your space",
  description:
    "Custom tile designs created around your artwork, your ideas, and your space. Explore possibilities for homes, interiors and branded spaces.",
  robots: { index: false, follow: false },
  icons: {
    icon: { url: brandLogo.src, type: "image/png" },
  },
  openGraph: {
    title: "VAVI Tile Studio",
    description: "Bring Your Imagination Into Reality.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteMotion />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
