import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell manga-public-shell min-h-svh bg-lab-base text-lab-text">
      <SiteHeader />
      <main
        id="main-content"
        className="relative z-10 mx-auto min-h-[calc(100svh-64px)] w-full"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
