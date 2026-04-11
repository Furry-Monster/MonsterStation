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
      {
        title: "Re：从零开始的异世界生活 第四季 丧失篇",
        cover:
          "https://lain.bgm.tv/r/400/pic/cover/l/8e/70/547888_46dnk.jpg",
        url: "https://bgm.tv/subject/547888",
        status: "watching",
        note: "TV · 贤者塔篇",
      },
      {
        title: "超かぐや姫！",
        cover:
          "https://lain.bgm.tv/r/400/pic/cover/l/f6/0f/604826_2XWRN.jpg",
        url: "https://bgm.tv/subject/604826",
        status: "watching",
        note: "WEB / 超时空辉夜姬！",
      },
      {
        title: "葬送的芙莉莲 第二季",
        cover:
          "https://lain.bgm.tv/r/400/pic/cover/l/0b/24/515759_qA1Zc.jpg",
        url: "https://bgm.tv/subject/515759",
        status: "watching",
        note: "TV · 第2期",
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
      {
        title: "踊り子",
        artist: "Vaundy",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/f1/cd/f7/f1cdf773-5dca-3d6d-6c14-2fb9871a83a9/197189838330.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E8%B8%8A%E3%82%8A%E5%AD%90/1706828529?i=1706828627",
        note: "シングル",
      },
      {
        title: "怪獣の花唄",
        artist: "Vaundy",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/09/89/00/09890002-b2de-3637-39b2-f6c2d34d0e93/197189854859.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E6%80%AA%E7%8D%A3%E3%81%AE%E8%8A%B1%E5%94%84/1706831732?i=1706832137",
      },
      {
        title: "東京フラッシュ",
        artist: "Vaundy",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/09/89/00/09890002-b2de-3637-39b2-f6c2d34d0e93/197189854859.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E6%9D%B1%E4%BA%AC%E3%83%95%E3%83%A9%E3%83%83%E3%82%B7%E3%83%A5/1706831732?i=1706831942",
      },
      {
        title: "カタオモイ",
        artist: "Aimer",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/46/4a/84/464a843d-14cc-e5e2-a9d6-763eb558e104/4547366270358.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E3%82%AB%E3%82%BF%E3%82%AA%E3%83%A2%E3%82%A4/1538258997?i=1538259004",
      },
      {
        title: "Ref:rain",
        artist: "Aimer",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/35/b6/ff/35b6ff2d-d8e4-5739-28d3-9a1191a5a856/4547366350791.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/ref-rain/1538260333?i=1538260334",
      },
      {
        title: "コイワズライ",
        artist: "Aimer",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/99/28/78/992878dc-3339-da1f-bfd2-3ccac5cc2cc7/4547366402339.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E3%82%B3%E3%82%A4%E3%83%AF%E3%82%BA%E3%83%A9%E3%82%A4/1538260864?i=1538261229",
        note: "koiwazurai",
      },
      {
        title: "花びらたちのマーチ",
        artist: "Aimer",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/ec/48/2a/ec482a8a-31e2-4301-da40-762f7c223eb9/4547366391244.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E8%8A%B1%E3%81%B3%E3%82%89%E3%81%9F%E3%81%A1%E3%81%AE%E3%83%9E%E3%83%BC%E3%83%81/1538894760?i=1538894762",
      },
      {
        title: "Daisy",
        artist: "Aimer",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/af/5b/75/af5b75b1-ab2f-35c8-d689-1c11475c56d2/4547366420647.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/daisy/1538261363?i=1538261366",
      },
      {
        title: "明日の私に幸あれ",
        artist: "ナナヲアカリ",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a1/f4/a8/a1f4a868-637a-f86d-908d-6e013a67cfb4/4547366727395.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E6%98%8E%E6%97%A5%E3%81%AE%E7%A7%81%E3%81%AB%E5%B9%B8%E3%81%82%E3%82%8C/1787114801?i=1787114805",
      },
      {
        title: "ムリムリ進化論",
        artist: "ナナヲアカリ",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/9d/a9/11/9da911e3-c3ee-7f2c-ca38-3fc34850885f/4547366756616.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E3%83%A0%E3%83%AA%E3%83%A0%E3%83%AA%E9%80%B2%E5%8C%96%E8%AB%96/1823015616?i=1823015618",
      },
      {
        title: "I LOVE MEでいられるように (feat. 漣あくあ)",
        artist: "ナナヲアカリ",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8b/5d/8a/8b5d8a2f-9ee5-8418-cc69-0a32ab1fbbd7/4547366670523.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/i-love-me%E3%81%A7%E3%81%84%E3%82%89%E3%82%8C%E3%82%8B%E3%82%88%E3%81%86%E3%81%AB-feat-%E6%B9%8A%E3%81%82%E3%81%8F%E3%81%82/1729527309?i=1729527619",
      },
      {
        title: "恋風",
        artist: "幾田りら",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/da/24/fa/da24fa87-a196-7c42-26cd-de90ef113cfc/199350193477.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E6%81%8B%E9%A2%A8/1805325620?i=1805325622",
      },
      {
        title: "ロマンスの約束",
        artist: "幾田りら",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bf/29/c3/bf29c326-8766-2b6a-708f-b42c0e5d1754/196292065640.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E3%83%AD%E3%83%9E%E3%83%B3%E3%82%B9%E3%81%AE%E7%B4%84%E6%9D%9F/1576512968?i=1576512973",
      },
      {
        title: "スパークル",
        artist: "幾田りら",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/e1/e7/d2/e1e7d23c-bd17-7b05-b32c-4b23f0623685/196626142849.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E3%82%B9%E3%83%91%E3%83%BC%E3%82%AF%E3%83%AB/1602544169?i=1602544173",
      },
      {
        title: "The Story of Us",
        artist: "milet",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/90/a1/a2/90a1a2e9-09a1-83b5-4dc7-eb5a7000f265/4547366789072.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/the-story-of-us/1863631186?i=1863631485",
      },
      {
        title: "Anytime Anywhere",
        artist: "milet",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a2/bb/16/a2bb16e5-7521-df4f-9563-b0fdcaefd5cf/4547366645477.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/anytime-anywhere/1708333821?i=1708333825",
      },
      {
        title: "hanataba",
        artist: "milet",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/35/4d/a0/354da047-2d67-4b85-da83-1838cd064d00/4547366680263.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/hanataba/1738603486?i=1738603849",
      },
      {
        title: "us",
        artist: "milet",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/79/9d/ee/799dee5e-2544-5230-ff50-074d128e4a7b/4547366491227.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/us/1544029149?i=1544029154",
        note: "EP",
      },
      {
        title: "千鳥",
        artist: "ヨルシカ",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2e/8b/c3/2e8bc3b7-6f8e-f722-5fdb-b69a7c8c6ac4/26UMGIM18610.rgb.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E5%8D%83%E9%B3%A5/1876728371?i=1876728685",
      },
      {
        title: "雨とカプチーノ",
        artist: "ヨルシカ",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/8e/8e/19/8e8e1946-327d-7376-b75f-a49cb69b8686/19UMGIM62014.rgb.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E9%9B%A8%E3%81%A8%E3%82%AB%E3%83%97%E3%83%81%E3%83%BC%E3%83%8E/1474061924?i=1474062330",
      },
      {
        title: "忘れてください",
        artist: "ヨルシカ",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2d/17/77/2d1777fe-9f3a-82db-d5a0-24b06f4a6a62/24UMGIM64777.rgb.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E5%BF%98%E3%82%8C%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84/1755182641?i=1755182819",
      },
      {
        title: "八月、某、月明かり",
        artist: "ヨルシカ",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/64/ab/ba/64abba45-d080-0e8a-c24b-313e597c63cb/PA00076158_0_91679_jacket.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E5%85%AB%E6%9C%88-%E6%9F%90-%E6%9C%88%E6%98%8E%E3%81%8B%E3%82%8A/1648876058?i=1648876473",
      },
      {
        title: "AWAKE",
        artist: "星街すいせい",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/af/02/ed/af02ede0-cf69-ed76-65fd-7f969a30a409/HoshimachiSuisei_AWAKE_JKT.png/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/awake/1779410831?i=1779410832",
      },
      {
        title: "ビビデバ",
        artist: "星街すいせい",
        cover:
          "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4e/da/19/4eda19dd-47fb-62ea-8e75-fb604ef8064d/4547366700749.jpg/600x600bb.jpg",
        url: "https://music.apple.com/jp/album/%E3%83%93%E3%83%93%E3%83%87%E3%83%90/1760452190?i=1760452193",
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
          "https://cdn.cloudflare.steamstatic.com/steam/apps/3764200/library_hero.jpg",
        url: "https://store.steampowered.com/app/3764200/",
        platform: "Steam",
        note: "Resident Evil Requiem",
      },
      {
        title: "Resident Evil Village",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/1196590/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/1196590/",
        platform: "Steam",
        note: "RE8",
      },
      {
        title: "Resident Evil 7 Biohazard",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/418370/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/418370/",
        platform: "Steam",
        note: "RE7",
      },
      {
        title: "Resident Evil 6",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/221040/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/221040/",
        platform: "Steam",
      },
      {
        title: "Dying Light 2 Stay Human",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/534380/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/534380/",
        platform: "Steam",
      },
      {
        title: "Metro 2033 Redux",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/286690/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/286690/",
        platform: "Steam",
        note: "Metro 2033",
      },
      {
        title: "Rise of the Tomb Raider",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/391220/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/391220/",
        platform: "Steam",
      },
      {
        title: "Shadow of the Tomb Raider",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/750920/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/750920/",
        platform: "Steam",
      },
      {
        title: "DOOM",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/379720/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/379720/",
        platform: "Steam",
        note: "2016",
      },
      {
        title: "Apex Legends",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/1172470/",
        platform: "Steam",
      },
      {
        title: "Dead Island 2",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/934700/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/934700/",
        platform: "Steam",
      },
      {
        title: "Project Zomboid",
        cover:
          "https://cdn.cloudflare.steamstatic.com/steam/apps/108600/library_600x900_2x.jpg",
        url: "https://store.steampowered.com/app/108600/",
        platform: "Steam",
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

