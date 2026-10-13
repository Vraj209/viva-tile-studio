import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import TileStory from "@/components/TileStory";
import Possibilities from "@/components/Possibilities";
import ProjectGallery from "@/components/ProjectGallery";
import Process from "@/components/Process";
import TechnicalSpecifications from "@/components/TechnicalSpecifications";
import FAQ from "@/components/FAQ";
import ProjectEnquiry from "@/components/ProjectEnquiry";
import SiteFooter from "@/components/SiteFooter";
export default function Page() {
  return (
    <div id="top">
      <SiteHeader />
      <main id="main">
        <Hero />
        <div className="intro" data-motion="editorial">
          <p className="eyebrow" data-motion-item>A DIFFERENT WAY TO THINK ABOUT TILE</p>
          <p data-motion-item>
            Some spaces deserve
            <br />
            something <em>only you could imagine.</em>
          </p>
          <span data-motion-item>
            Bring a photograph, a pattern, a sketch.
            <br />
            We’ll explore what it could become.
          </span>
        </div>
        <TileStory />
        <Possibilities />
        <section className="manifesto" data-motion="editorial">
          <span className="eyebrow" data-motion-item>THE VAVI PHILOSOPHY</span>
          <p data-motion-item>
            Instead of designing your room{" "}
            <br />
            around the tile,{" "}
            <em>
              design the tile{" "}
              <br />
              around your room.
            </em>
          </p>
          <span className="manifesto-symbol" aria-hidden="true" data-motion-depth="ornament">
            ✳
          </span>
        </section>
        <ProjectGallery />
        <Process />
        <TechnicalSpecifications />
        <FAQ />
        <ProjectEnquiry />
      </main>
      <SiteFooter />
    </div>
  );
}
