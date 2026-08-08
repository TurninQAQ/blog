import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Atom,
  Binary,
  Compass,
  Cpu,
  Mail,
  Radio,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/config/site";

const heroTelemetry: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    label: "DIMENSION",
    value: "C-137",
    detail: "传送门坐标已锁定",
    icon: Atom,
  },
  {
    label: "PORTAL",
    value: "97%",
    detail: "绿色涡流能量稳定",
    icon: Radio,
  },
  {
    label: "LAB",
    value: "LIVE",
    detail: "技术笔记持续同步",
    icon: Binary,
  },
];

function PortalHeroScene({ className = "" }: { className?: string }) {
  const isMobileVariant = className.includes("mobile");

  return (
    <figure className={`manga-hero__visual ${className}`} aria-hidden="true">
      <div className="manga-portal-scene">
        <div className="manga-portal-rift" />

        <div className="manga-portal-image-frame">
          <Image
            src="/images/portal/note-fallback-portal.webp"
            alt=""
            fill
            loading={isMobileVariant ? "eager" : undefined}
            priority={!isMobileVariant}
            sizes={
              isMobileVariant
                ? "(max-width: 767px) 92vw, 1px"
                : "(min-width: 1024px) 640px, 48vw"
            }
            className="manga-portal-image"
          />
          <Image
            src="/images/portal/portal-gun-overlay.png"
            alt=""
            width={982}
            height={988}
            sizes="(max-width: 767px) 22vw, 154px"
            className="manga-portal-gun-overlay"
          />
        </div>

        <div className="manga-hero__hud manga-hero__hud--top">
          <Cpu aria-hidden="true" className="h-4 w-4" />
          <span>DIMENSION C-137</span>
          <strong>LIVE FEED</strong>
        </div>
        <div className="manga-hero__hud manga-hero__hud--bottom">
          <Zap aria-hidden="true" className="h-4 w-4" />
          <span>PORTAL GUN</span>
          <strong>ARMED</strong>
        </div>

        <figcaption className="manga-portal-caption">
          <span>FIELD RECORDS / 001</span>
          <strong>RICK + MORTY</strong>
          <span>PORTAL LAB</span>
        </figcaption>
      </div>
    </figure>
  );
}

export function HeroIdentity() {
  const titleWords = siteConfig.hero.title.split(" ");
  const titleAccent = titleWords.pop() ?? "";
  const titleLead = titleWords.join(" ");

  return (
    <section
      data-portal-hero="true"
      className="manga-hero relative flex flex-col justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8"
    >
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
            className="manga-hero__summary mt-6 max-w-[42ch] text-[16px] font-medium leading-[1.65] text-lab-text-muted"
            lang="zh-Hans"
          >
            {siteConfig.hero.description}
          </p>
          <p
            className="manga-hero__summary mt-1 max-w-[42ch] text-[16px] font-normal leading-[1.65] text-lab-text-muted"
            lang="zh-Hans"
          >
            {siteConfig.hero.descriptionZh}
          </p>

          <div className="manga-hero__telemetry mt-7" aria-label="首页状态">
            {heroTelemetry.map((item) => {
              const Icon = item.icon;

              return (
                <div className="manga-hero__telemetry-item" key={item.label}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold leading-[1.2] text-lab-muted">
                      {item.label}
                    </span>
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <p className="mt-2 font-mono text-[18px] font-bold leading-[1.1] text-lab-text">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[12px] font-normal leading-[1.35] text-lab-text-muted">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>

          <PortalHeroScene className="manga-hero__visual--mobile" />

          <div className="manga-hero__actions mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/notes"
              className="manga-cta manga-cta--primary inline-flex min-h-12 items-center justify-center gap-3 border-2 border-lab-accent bg-lab-accent px-5 text-[15px] font-bold leading-[1.4] text-[#0a0e1a] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
            >
              <span>{siteConfig.hero.primaryCta}</span>
              <ArrowRight size={16} aria-hidden="true" strokeWidth={2.2} />
            </Link>

            <Link
              href="#lab-index"
              className="manga-cta manga-cta--secondary inline-flex min-h-12 items-center justify-center gap-2 border-2 border-lab-text bg-lab-surface px-4 text-[14px] font-semibold leading-[1.4] text-lab-text transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
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

        <PortalHeroScene className="manga-hero__visual--desktop" />
      </div>
    </section>
  );
}
