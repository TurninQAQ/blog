export const siteConfig = {
  owner: {
    name: "Turnin",
    displayName: "Turnin",
  },
  brand: {
    en: "Turnin‘s Blog",
    zh: "穿越次元的技术博客",
    short: "TB",
  },
  email: "3274845285@qq.com",
  hero: {
    eyebrow: "Turnin‘s Blog",
    title: "Turnin‘s Blog",
    description: "Wubba Lubba Dub Dub！这里记录技术笔记、系统草图和跨次元的软件构建实验。",
    descriptionZh: "偏向工程实践、架构拆解和日常构建记录，坐稳了，准备穿越传送门。",
    primaryCta: "查看笔记",
    secondaryCta: "打开博客索引",
  },
  navigation: {
    notes: "笔记",
    series: "系列",
    archive: "归档",
    search: "搜索",
  },
  footer: {
    tagline: "技术笔记、系统草图和跨次元的软件构建实验。",
  },
} as const;

export type SiteConfig = typeof siteConfig;
