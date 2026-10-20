import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BrochureLibrary from "@/components/BrochureLibrary";

export const metadata: Metadata = {
  title: "Brochures | VAVI Tile Studio",
  description: "Explore our tile collections, one page at a time. Discover surfaces, finishes and possibilities in our digital catalogue library.",
};

export default function BrochuresPage() {
  return (
    <div id="top">
      <SiteHeader />
      <main id="main">
        <BrochureLibrary />
      </main>
      <SiteFooter homePage={false} tone="forest" />
    </div>
  );
}
