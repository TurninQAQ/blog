import Link from "next/link";
import { contentRoutes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="manga-site-footer relative z-10 border-t-2 border-lab-text bg-lab-base">
      <div className="mx-auto grid w-full max-w-[1120px] gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div className="max-w-[68ch]">
          <p
            className="text-[16px] font-semibold leading-[1.5] text-lab-text"
            lang="en"
          >
            {siteConfig.brand.en}
          </p>
          <p
            className="mt-1 text-[14px] font-normal leading-[1.4] text-lab-text-muted"
            lang="zh-Hans"
          >
            {siteConfig.brand.zh}
          </p>
          <p className="mt-3 text-[14px] font-normal leading-[1.4] text-lab-muted">
            {siteConfig.footer.tagline}
          </p>
          <p
            className="mt-4 font-mono text-[12px] leading-[1.4] text-lab-accent/70"
            lang="en"
          >
            Wubba Lubba Dub Dub! — Dimension C-137
          </p>
        </div>

        <nav aria-label="页脚导航">
          <ul className="grid gap-2 sm:grid-cols-4 md:grid-cols-1">
            {contentRoutes.map((route) => (
              <li key={route.key}>
                <Link
                  href={route.href}
                  className="flex min-h-11 items-center rounded-lab px-2 text-[14px] font-normal leading-[1.4] text-lab-text-muted transition-colors duration-150 hover:bg-lab-surface hover:text-lab-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
                >
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
