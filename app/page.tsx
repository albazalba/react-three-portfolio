import { siteConfig } from "@/data/site";
import MuseumRoot from "@/components/museum/MuseumRoot";

export default function Home() {
  return (
    <>
      <MuseumRoot />
      <section className="sr-only">
        <h1>{siteConfig.title}</h1>
        <p>{siteConfig.description}</p>
        <p>
          Walk the apartment to read an introduction, professional experience, selected
          projects, and contact details. The game room has arcade machines you can play.
        </p>
      </section>
    </>
  );
}
