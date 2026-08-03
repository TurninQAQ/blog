import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, Mail, Terminal } from "lucide-react";
import { siteConfig } from "@/config/site";

export function HeroIdentity() {
  const titleWords = siteConfig.hero.title.split(" ");
  const titleAccent = titleWords.pop() ?? "";
  const titleLead = titleWords.join(" ");

  return (
    <section
      data-mecha-hero="true"
      className="manga-hero relative flex flex-col justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="manga-hero__mobile-art" aria-hidden="true">
        <div className="relative h-full w-full">
          <Image
            src="/images/portal/hero-mobile-portal.webp"
            alt=""
            fill
            priority
            quality={90}
            sizes="(max-width: 767px) 100vw, 1px"
            className="object-cover object-bottom"
          />
        </div>
      </div>
      <div className="manga-hero__frame mx-auto w-full max-w-[1280px]">
        <div className="manga-hero__copy max-w-[590px]">
          <p className="manga-kicker inline-flex min-h-10 items-center gap-2 font-mono text-[13px] font-semibold leading-[1.4] text-lab-accent">
            <Terminal size={16} aria-hidden="true" strokeWidth={1.8} />
            <span lang="en">{siteConfig.hero.eyebrow}</span>
          </p>

          <h1
            aria-label={siteConfig.hero.title}
            className="manga-hero__title mt-5 text-balance text-[48px] font-black leading-[1.05] text-lab-text"
            lang="en"
          >
            <span>{titleLead}</span>
            <span className="manga-hero__title-accent">{titleAccent}</span>
          </h1>

          <div className="manga-title-rule mt-6" aria-hidden="true" />

          <p
            className="mt-6 max-w-[42ch] text-[16px] font-medium leading-[1.65] text-lab-text-muted"
            lang="zh-Hans"
          >
            {siteConfig.hero.description}
          </p>
          <p
            className="mt-1 max-w-[42ch] text-[16px] font-normal leading-[1.65] text-lab-text-muted"
            lang="zh-Hans"
          >
            {siteConfig.hero.descriptionZh}
          </p>

          <div className="manga-hero__actions mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/notes"
              className="manga-cta manga-cta--primary inline-flex min-h-12 items-center justify-center gap-3 rounded-lab border-2 border-lab-accent bg-lab-accent px-5 text-[15px] font-bold leading-[1.4] text-[#0a0e1a] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
            >
              <span>{siteConfig.hero.primaryCta}</span>
              <ArrowRight size={16} aria-hidden="true" strokeWidth={2.2} />
            </Link>

            <Link
              href="#lab-index"
              className="manga-cta manga-cta--secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-lab border-2 border-lab-text bg-lab-surface px-4 text-[14px] font-semibold leading-[1.4] text-lab-text transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
            >
              <Compass size={16} aria-hidden="true" strokeWidth={2} />
              {siteConfig.hero.secondaryCta}
            </Link>
          </div>

          <a
            href={`mailto:${siteConfig.email}`}
            className="manga-hero__email mt-4 inline-flex min-h-11 items-center gap-2 rounded-lab text-[14px] font-normal leading-[1.4] text-lab-text-muted transition-colors duration-150 hover:text-lab-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
          >
            <Mail size={16} aria-hidden="true" strokeWidth={1.8} />
            <span>邮箱 {siteConfig.email}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
