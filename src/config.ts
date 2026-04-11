import type {
  FriendsConfig,
  GiscusConfig,
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  ShowcaseConfig,
  SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
  title: "MonsterStation",
  subtitle: "FurryMonster's Blog",
  lang: "zh_CN", // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
  themeColor: {
    hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
    fixed: true, // Hide the theme color picker for visitors
  },
  banner: {
    enable: true,
    src: "assets/images/banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
    position: "top", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
    credit: {
      enable: true, // Display the credit text of the banner image
      text: "夸父伟大...", // Credit text to be displayed
      url: "", // (Optional) URL link to the original artwork or artist's page
    },
  },
  toc: {
    enable: true, // Display the table of contents on the right side of the post
    depth: 2, // Maximum heading depth to show in the table, from 1 to 3
  },
  favicon: [
    // Leave this array empty to use the default favicon
    {
      src: "/favicon/icon_light.png", // Path of the favicon, relative to the /public directory
      theme: "light", // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
      sizes: "32x32", // (Optional) Size of the favicon, set only if you have favicons of different sizes
    },
    {
      src: "/favicon/icon_dark.png",
      theme: "dark",
      sizes: "32x32",
    },
  ],
};

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    LinkPreset.Showcase,
    LinkPreset.Friends,
    {
      name: "GitHub",
      url: "https://github.com/Furry-Monster", // Internal links should not include the base path, as it is automatically added
      external: true, // Show an external link icon and will open in a new tab
    },
  ],
};

export const profileConfig: ProfileConfig = {
  avatar: "assets/images/avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
  name: "Furry Monster",
  bio: "Code as an Artist, Live as a Dreamer.",
  links: [
    {
      name: "Twitter",
      icon: "fa6-brands:twitter", // Visit https://icones.js.org/ for icon codes
      // You will need to install the corresponding icon set if it's not already included
      // `pnpm add @iconify-json/<icon-set-name>`
      url: "https://x.com/4urryM0nster",
    },
    {
      name: "Steam",
      icon: "fa6-brands:steam",
      url: "https://steamcommunity.com/profiles/76561198401542081/",
    },
    {
      name: "GitHub",
      icon: "fa6-brands:github",
      url: "https://github.com/Furry-Monster",
    },
    {
      name: "Discord",
      icon: "fa6-brands:discord",
      url: "https://discord.com/users/1314183151353987094",
    },
    {
      name: "Bilibili",
      icon: "fa6-brands:bilibili",
      url: "https://space.bilibili.com/199684075",
    },
    {
      name: "Dev.to",
      icon: "fa6-brands:dev",
      url: "https://dev.to/furrymonster",
    },
  ],
};

/** 追番 / 画廊 / 音乐 / 游戏展示页，数据集中在此配置 */
export const showcaseConfig: ShowcaseConfig = {
  title: "兴趣陈列室",
  description: "代码之外",
  anime: {
    enabled: true,
    items: [
      {
        title: "【我推的孩子】",
        cover:
          "https://lain.bgm.tv/r/400/pic/cover/l/98/5e/386809_1yR81.jpg",
        url: "https://bgm.tv/subject/386809",
        status: "watching",
        note: "TV 第一季",
      },
    ],
  },
  gallery: {
    enabled: true,
    description: "将图片放在 src/assets/showcase/ 下，在此填写相对文件名即可。",
    items: [
      // 示例（替换为你的作品文件名）：
      // { title: "习作", image: "sketch-01.png", description: "2025", link: "https://..." },
    ],
  },
  music: {
    enabled: true,
    items: [
      {
        title: "THE BOOK",
        artist: "YOASOBI",
        cover:
          "https://upload.wikimedia.org/wikipedia/en/3/3c/Yoasobi_-_The_Book.jpg",
        url: "https://en.wikipedia.org/wiki/The_Book_(Yoasobi_album)",
        note: "专辑",
      },
    ],
  },
  games: {
    enabled: true,
    items: [
      {
        title: "Portal 2",
        cover:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/620/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/620/Portal_2/",
        platform: "Steam",
        note: "合作解谜",
      },
    ],
  },
};

export const friendsConfig: FriendsConfig = {
  title: "看看大伙在做什么~",
  description: "欢迎交换友链！请通过邮件(4urrym0nster@gmail.com)或其他方式联系我。",
  links: [
    // More Friends link added here
  ],
};

export const licenseConfig: LicenseConfig = {
  enable: true,
  name: "CC BY-NC-SA 4.0",
  url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const giscusConfig: GiscusConfig = {
  enable: true,
  repo: "Furry-Monster/MonsterStation",
  repoId: "R_kgDON5nU-A",
  category: "Comments",
  categoryId: "DIC_kwDON5nU-M4C3qDU",
  mapping: "pathname",
  lang: "zh-CN",
  reactionsEnabled: true,
  emitMetadata: false,
  inputPosition: "top",
};

