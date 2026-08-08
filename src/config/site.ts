export const siteConfig = {
  owner: {
    name: "Turnin",
    displayName: "Turnin",
  },
  brand: {
    en: "Turnin's Portal Lab",
    zh: "瑞克与莫蒂风格技术博客",
    short: "PL",
  },
  email: "3274845285@qq.com",
  hero: {
    eyebrow: "RICK & MORTY // TECH LOG",
    title: "Portal Tech Lab",
    description: "像打开一扇绿色传送门一样进入技术笔记、系统草图和跨次元的软件构建实验。",
    descriptionZh: "这里偏向工程实践、架构拆解、构建记录和故障复盘，用 Rick 与 Morty 的高能实验室气质包装每篇笔记。",
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
