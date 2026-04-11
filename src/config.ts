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
        title: "【推しの子】 第3期",
        cover:
          "https://lain.bgm.tv/r/400/pic/cover/l/92/95/517057_257ad.jpg",
        url: "https://bgm.tv/subject/517057",
        status: "watching",
        note: "TV · 第三季",
      },
      {
        title: "NEEDY GIRL OVERDOSE",
        cover:
          "https://lain.bgm.tv/r/400/pic/cover/l/8d/c7/606263_3fRrj.jpg",
        url: "https://bgm.tv/subject/606263",
        status: "watching",
        note: "TV · 主播女孩重度依赖",
      },
      {
        title:
          "わたしが恋人になれるわけないじゃん、ムリムリ！（※ムリじゃなかった!?）",
        cover:
          "https://lain.bgm.tv/r/400/pic/cover/l/ae/03/524707_1quxk.jpg",
        url: "https://bgm.tv/subject/524707",
        status: "watching",
        note: "TV · 恋人不行",
      },
    ],
  },
  gallery: {
    enabled: true,
    items: [
      { title: "Happy Anniversary", image: "happyaniversary.png" },
      { title: "Kana", image: "kana.png" },
      { title: "Miku", image: "miku.png" },
      { title: "Manga · 紫阳花", image: "manga-ajisai.png" },
      { title: "Nina × Subaru", image: "ninaXsubaru.png" },
      { title: "SHF", image: "shf.png" },
    ],
  },
  music: {
    enabled: true,
    items: [
      {
        title: "Tokimeki",
        artist: "Vaundy",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/3d/cb/cb/3dcbcb5b-a4ff-307c-c496-bd8e6b90a504/197189838293.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/tokimeki/1706831539?i=1706831556",
        note: "シングル",
      },
      {
        title: "おもかげ (produced by Vaundy)",
        artist: "milet × Aimer × 幾田りら",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/1d/a0/ec1da08d-502e-9d7e-10d5-2dd301a0314f/4547366542912.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E3%81%8A%E3%82%82%E3%81%8B%E3%81%92-produced-by-vaundy/1598330550?i=1598330658",
        note: "シングル",
      },
      {
        title: "茜",
        artist: "ヨルシカ",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/28/7d/d2/287dd29e-cffa-ea42-79ce-ceeb764b70ac/25UM2IM05371.rgb.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E8%8C%9C/1869557597?i=1869557604",
        note: "デジタルシングル",
      },
      {
        title: "Latata",
        artist: "幾田りら",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6a/63/19/6a63198f-584f-1414-82f7-0ea6605361c2/199806619766.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/latata/1857886408?i=1857886413",
        note: "アルバム『Laugh』収録",
      },
    ],
  },
  games: {
    enabled: true,
    items: [
      {
        title: "SILENT HILL f",
        cover:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2947440/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/2947440/",
        platform: "Steam",
      },
      {
        title: "ELDEN RING NIGHTREIGN",
        cover:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2622380/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/2622380/",
        platform: "Steam",
      },
      {
        title: "Resident Evil 9",
        cover:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3764200/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/3764200/",
        platform: "Steam",
        note: "Resident Evil Requiem",
      },
      {
        title: "Monster Hunter Rise",
        cover:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1446780/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/1446780/",
        platform: "Steam",
      },
      {
        title: "Devil May Cry 5",
        cover:
          "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/601150/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/601150/",
        platform: "Steam",
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

