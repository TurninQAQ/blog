"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  BookOpenText,
  Layers,
  Menu,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ContentRoute } from "@/config/routes";
import { siteConfig } from "@/config/site";

const routeIcons = {
  notes: BookOpenText,
  series: Layers,
  archive: Archive,
  search: Search,
} satisfies Record<ContentRoute["key"], LucideIcon>;

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function MobileNav({ routes }: { routes: readonly ContentRoute[] }) {
  const [open, setOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeAtDesktop = () => {
      if (desktopQuery.matches) {
        setOpen(false);
      }
    };

    closeAtDesktop();
    desktopQuery.addEventListener("change", closeAtDesktop);

    return () => {
      desktopQuery.removeEventListener("change", closeAtDesktop);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const outside = [
      document.querySelector("header"),
      document.getElementById("main-content"),
      document.querySelector("footer"),
    ].filter((element): element is HTMLElement => element instanceof HTMLElement);
    const previousStates = outside.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));

    outside.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    return () => {
      previousStates.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;

        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }
      });
    };
  }, [open]);

  function closeMenu({ restoreFocus }: { restoreFocus: boolean }) {
    setOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    ).filter((element) => !element.hasAttribute("disabled"));

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const panel = open ? (
    <div
      ref={panelRef}
      id="mobile-navigation-panel"
      role="dialog"
      aria-modal="true"
      aria-label="移动导航"
      className="manga-mobile-nav fixed inset-0 z-50 bg-lab-base/98 text-lab-text"
      onKeyDown={handlePanelKeyDown}
    >
      <div className="mx-auto flex min-h-svh w-full max-w-[1120px] flex-col px-4 py-4">
        <div className="flex min-h-14 items-center justify-between gap-4">
          <div className="min-w-0">
            <p
              className="truncate text-[16px] font-semibold leading-[1.5]"
              lang="en"
            >
              {siteConfig.brand.en}
            </p>
            <p
              className="truncate text-[14px] font-normal leading-[1.4] text-lab-text-muted"
              lang="zh-Hans"
            >
              {siteConfig.brand.zh}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface text-lab-text transition-colors duration-150 hover:border-[var(--lab-border-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
            aria-label="关闭导航"
            onClick={() => closeMenu({ restoreFocus: true })}
          >
            <X size={20} aria-hidden="true" strokeWidth={1.8} />
          </button>
        </div>

        <nav className="mt-8" aria-label="移动导航">
          <ul className="grid gap-3">
            {routes.map((route) => {
              const Icon = routeIcons[route.key];

              return (
                <li key={route.key}>
                  <Link
                    href={route.href}
                    className="flex min-h-11 items-center gap-3 rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface px-4 py-3 text-[16px] font-normal leading-[1.5] text-lab-text transition-colors duration-150 hover:border-[var(--lab-border-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
                    onClick={() => closeMenu({ restoreFocus: false })}
                  >
                    <Icon size={18} aria-hidden="true" strokeWidth={1.8} />
                    <span>{route.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="mt-auto text-[14px] font-normal leading-[1.4] text-lab-muted">
          {siteConfig.footer.tagline}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface text-lab-text transition-colors duration-150 hover:border-[var(--lab-border-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
        aria-label="打开导航"
        aria-controls="mobile-navigation-panel"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu size={20} aria-hidden="true" strokeWidth={1.8} />
      </button>

      {portalRoot && panel ? createPortal(panel, portalRoot) : null}
    </div>
  );
}
