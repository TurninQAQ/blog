import { siteConfig } from "./site";

export const contentRoutes = [
  {
    key: "notes",
    href: "/notes",
    label: siteConfig.navigation.notes,
    description: "聚合技术写作、实现记录和踩坑复盘。",
    icon: "BookOpenText",
  },
  {
    key: "series",
    href: "/series",
    label: siteConfig.navigation.series,
    description: "把同一主题的技术笔记按顺序串成专题。",
    icon: "Layers",
  },
  {
    key: "archive",
    href: "/archive",
    label: siteConfig.navigation.archive,
    description: "按时间回看已经发布的技术笔记。",
    icon: "Archive",
  },
  {
    key: "search",
    href: "/search",
    label: siteConfig.navigation.search,
    description: "通过标题、主题或关键词查找内容。",
    icon: "Search",
  },
] as const;

export type ContentRoute = (typeof contentRoutes)[number];
