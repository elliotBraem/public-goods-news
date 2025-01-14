import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "curate.fun",
  tagline: "Deploy AI Content Curation Agents",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.curate.press",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "POTLOCK", // Usually your GitHub org/user name.
  projectName: "curatedotfun", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/potlock/curatedotfun",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/potlock/curatedotfun",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/meta.png",
    navbar: {
      title: "curate.fun",
      logo: {
        alt: "curate.fun Docs Logo",
        src: "img/grantsdotfun_icon.png",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "Tutorial",
        },
        {
          href: "https://curate.press",
          label: "Website",
          position: "right",
        },
        {
          href: "https://x.com/potlock_",
          label: "X",
          position: "right",
        },
        {
          href: "https://github.com/potlock/curatedotfun",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "📚 Docs",
          items: [
            {
              label: "🚀 Tutorial",
              to: "/docs/intro",
            },
          ],
        },
        {
          title: "🌐 Community",
          items: [
            {
              label: "💬 Telegram",
              href: "https://t.me/",
            },
            {
              label: "🐦 Twitter",
              href: "https://twitter.com/potlock_",
            },
          ],
        },
        {
          title: "🛠️ Products",
          items: [
            {
              label: "🔒 POTLOCK",
              href: "https://potlock.org",
            },
            {
              label: "🤖 AI-PGF",
              href: "https://aipgf.com",
            },
            {
              label: "💸 grants.fun",
              href: "https://grants.fun",
            },
          ],
        },
      ],
      copyright: `Built with ❤️ POTLOCK`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
