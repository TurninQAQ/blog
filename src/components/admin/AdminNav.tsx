"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "控制台" },
  { href: "/admin/posts", label: "文章库" },
  { href: "/", label: "查看站点" },
];

function isCurrentPath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return href !== "/" && pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="管理员导航" className="manga-admin-nav">
      {links.map((link) => {
        const isCurrent = isCurrentPath(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent ? "page" : undefined}
            className="manga-admin-nav-link"
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
