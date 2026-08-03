import { ContentRouteStrip } from "@/components/public/ContentRouteStrip";
import { FeaturedNotesModule } from "@/components/public/content/FeaturedNotesModule";
import { HeroIdentity } from "@/components/public/HeroIdentity";
import { LabBackground } from "@/components/visual/LabBackground";
import { getHomepagePublicContent } from "@/lib/public/content-queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const homepageContent = await getHomepagePublicContent();

  return (
    <>
      <LabBackground enableCanvas>
        <HeroIdentity />
      </LabBackground>

      <section
        className="manga-featured-band px-4 pb-14 pt-6 sm:px-6 lg:px-8"
        aria-label="内容模块"
      >
        <div className="mx-auto w-full max-w-[1280px]">
          <FeaturedNotesModule content={homepageContent} />
        </div>
      </section>

      <ContentRouteStrip />
    </>
  );
}
