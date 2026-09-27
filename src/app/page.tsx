import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import TileStory from "@/components/TileStory";
import Possibilities from "@/components/Possibilities";
import ProjectGallery from "@/components/ProjectGallery";
import Process from "@/components/Process";
import FAQ from "@/components/FAQ";
import ProjectEnquiry from "@/components/ProjectEnquiry";
import SiteFooter from "@/components/SiteFooter";
export default function Page() {
  return (
    <div id="top">
      <SiteHeader />
      <main id="main">
        <Hero />
        <div className="intro">
          <p className="eyebrow">A DIFFERENT WAY TO THINK ABOUT TILE</p>
          <p>
            Some spaces deserve
            <br />
            something <em>only you could imagine.</em>
          </p>
          <span>
            Bring a photograph, a pattern, a sketch.
            <br />
            We’ll explore what it could become.
          </span>
        </div>
        <TileStory />
        <Possibilities />
        <section className="manifesto">
          <span className="eyebrow">THE VAVI PHILOSOPHY</span>
          <p>
            Instead of designing your room
            <br />
            around the tile,{" "}
            <em>
              design the tile
              <br />
              around your room.
            </em>
          </p>
          <span className="manifesto-symbol" aria-hidden="true">
            ✳
          </span>
        </section>
        <ProjectGallery />
        <Process />
        <FAQ />
        <ProjectEnquiry />
      </main>
      <SiteFooter />
    </div>
  );
}
