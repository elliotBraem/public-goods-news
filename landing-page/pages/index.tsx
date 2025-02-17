import TweetWall from "@/components/TweetWall";
import {
  Bot,
  CalendarRange,
  ExternalLink,
  Gift,
  Minus,
  Newspaper,
  Plus,
  Podcast,
  SatelliteDish,
  Workflow,
} from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaBook,
  FaCheck,
  FaCopy,
  FaGithub,
  FaGlobeAmericas,
  FaTelegram,
  FaTwitter,
} from "react-icons/fa";
import hashtagData from "../../curate.config.json";

const PARTNERS = [
  {
    href: "https://www.elizaos.ai/",
    img: "/assets/images/communities/community1.png",
    alt: "Eliza",
  },
  {
    href: "https://solana.com/",
    img: "/assets/images/communities/solana.jpg",
    alt: "Solana",
  },
  {
    href: "https://www.eigenlayer.xyz/",
    img: "/assets/images/communities/community2.png",
    alt: "Eigen Layer",
  },
  {
    href: "https://near.org/",
    img: "/assets/images/communities/near.png",
    alt: "Near Protocol",
  },
  {
    href: "https://ethereum.org",
    img: "/assets/images/communities/eth.svg",
    alt: "Ethereum",
  },
  {
    href: "https://berachain.com",
    img: "/assets/images/communities/community4.png",
    alt: "Berachain4",
  },
  // {
  //   href: "https://nearweek.com",
  //   img: "/assets/images/communities/nearweek.svg",
  //   alt: "Near Week",
  // },
  {
    href: "https://nouns.wtf",
    img: "/assets/images/communities/community3.png",
    alt: "Nouns DAO",
  },
  {
    href: "https://t.me/cryptograntwire",
    img: "/assets/images/communities/cryptograntwire.svg",
    alt: "Crypto Grant Wire",
  },
  // {
  //   href: "https://potlock.org",
  //   img: "/assets/images/communities/potlock.svg",
  //   alt: "POTLOCK",
  // },
  {
    href: "https://aptosfoundation.org//",
    img: "/assets/images/communities/aptos.jpg",
    alt: "Aptos",
  },
  {
    href: "https://howtodao.xyz//",
    img: "/assets/images/communities/howtodao.png",
    alt: "How to DAO",
  },
  {
    href: "https://stellar.org//",
    img: "/assets/images/communities/stellar.jpg",
    alt: "Stellar",
  },
  {
    href: "https://www.refidao.com/",
    img: "/assets/images/communities/refi_dao.png",
    alt: "Refi DAO",
  },
  {
    href: "https://www.morphl2.io/",
    img: "/assets/images/communities/community5.png",
    alt: "Morph",
  },
  {
    href: "https://americancrypto.foundation",
    img: "/assets/images/communities/acf_logo.png",
    alt: "American Crypto Foundation",
  },
  {
    href: "https://celo.org/",
    img: "/assets/images/communities/community6.png",
    alt: "Celo",
  },
  {
    href: "https://hyperfoundation.org/",
    img: "/assets/images/communities/hyperliquid.png",
    alt: "Hyperliquid",
  },
  {
    href: "https://bitcoin.org/",
    img: "/assets/images/communities/bitcoin.jpeg",
    alt: "Bitcoin",
  },
  {
    href: "https://avax.network/",
    img: "/assets/images/communities/avax.jpg",
    alt: "Avalanche",
  },

  {
    href: "https://ripple.com/",
    img: "/assets/images/communities/ripple.jpg",
    alt: "Ripple",
  },
  {
    href: "https://desci.world/",
    img: "/assets/images/communities/desci.jpg",
    alt: "Desci World",
  },
  {
    href: "https://thenetworkstate.com/",
    img: "/assets/images/communities/networkstate.jpg",
    alt: "The Network State",
  },
  {
    href: "https://sui.io//",
    img: "/assets/images/communities/sui.jpg",
    alt: "Sui",
  },
  {
    href: "https://pudgypenguins.com/",
    img: "/assets/images/communities/pudgy.jpg",
    alt: "Pudgy Penguins",
  },
  {
    href: "https://base.org/",
    img: "/assets/images/communities/base.jpg",
    alt: "BASE L2",
  },
];

// First, update the HashtagButton type
type HashtagButton = {
  tag: string;
  isActive?: boolean;
  command?: string;
  onClick?: () => void;
};

const HashtagButton = ({ tag, isActive, onClick }: HashtagButton) => {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only show client-side features after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(`!submit @curatedotfun #${tag}`)
      .then(
        () => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        },
        () => {
          console.error("Failed to copy text to clipboard");
        },
      )
      .catch((error) => {
        console.error("Failed to copy text to clipboard", error);
      });
  };

  return (
    <button className="relative" onClick={onClick}>
      <div
        className={`
          px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2
          ${
            isActive
              ? "bg-gray-500 text-white"
              : "bg-white hover:bg-gray-100 border border-gray-200"
          }
        `}
      >
        <span>#{tag}</span>
        {isActive && <span className="text-gray-300">▼</span>}
      </div>
      {/* Only render dropdown after component is mounted */}
      {mounted && isActive && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-50 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">
              !submit @curatedotfun #{tag}
            </p>
            <button
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded transition-colors"
              onClick={handleCopy}
            >
              {copied ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaCopy className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() =>
              window.open(`https://app.curate.fun/feed/${tag}`, "_blank")
            }
          >
            Open Feed
          </button>
        </div>
      )}
    </button>
  );
};

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is curate.fun?",
      answer:
        "curate.fun is a platform designed to streamline community crowsourced news to build autonomous content.",
    },
    {
      question: "How do I get a feed?",
      answer: "Hop on our telegram and let us know what you want.",
    },
    {
      question: "Wen token?",
      answer: "Soon. TG for alpha",
    },
    {
      question: "What is platforms are currently supported?",
      answer:
        "Currently twitter for curation, headlines + threads + blogs for content, and telegram + twitter crosspost. Will be adding more soon.",
    },
    {
      question: "How can you add support?",
      answer:
        "You can add support by contributing to our <a class='hyperlink' href='https://github.com/potlock/curatedotfun' target='_blank' rel='noopener noreferrer'>GitHub repository</a> or joining our community.",
    },
    {
      question: "How does it work?",
      answer:
        "curate.fun uses AI to  summarize content from the approved community curated news from socials.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white mb-20">
      <div className="w-full flex md:flex-row flex-col mx-auto py-6 md:py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:items-start items-center mb-6 md:mb-8">
            <span className="inline-block px-4 py-2 rounded-full border border-black text-sm">
              FAQs
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-center md:text-left">
            Frequently asked questions
          </h2>
          <p className="md:text-left text-center mb-8">
            CONTACT US <span className="text-blue-500">→</span>
          </p>
        </div>
        <div className="md:max-w-[820px] max-w-[1200px] flex-1 w-full mx-auto px-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4 bg-gray-100 rounded-md">
                <div
                  className="flex justify-between items-center flex-1 cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                >
                  <p className="font-semibold">{faq.question}</p>
                  <div className="flex items-center">
                    {openIndex === index ? (
                      <Minus
                        className="text-gray-500 cursor-pointer"
                        onClick={() => toggleFAQ(index)}
                      />
                    ) : (
                      <Plus
                        className="text-gray-500 cursor-pointer"
                        onClick={() => toggleFAQ(index)}
                      />
                    )}
                  </div>
                </div>
                {openIndex === index && (
                  <p
                    className="mt-2 text-gray-600 flex-1"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const soon = true;

  // Define the case studies JSON object
  const caseStudies = [
    {
      name: "Crypto Grant Wire",
      hashtag: "#grant",
      Description: "Feed for Web3 grant +  DAO Governance",
      logo: "📡",
      link: "https://t.me/cryptograntwire",
      soon: true,
      hide: false,
    },
    {
      name: "This Week in Ethereum",
      hashtag: "#ethereum",
      description: "Comprehensive Ethereum ecosystem updates",
      logo: "🌐",
      link: "https://x.com/curatedotfun",
      soon: true,
      hide: true,
    },
    {
      name: "NEARWEEK",
      hashtag: "#near",
      description: "NEAR Protocol's community digest",
      logo: "📅",
      link: "https://x.com/nearweekbot",
      soon: true,
      hide: false,
    },
    {
      name: "AI x Crypto News",
      hashtag: "#ai3",
      description: "Intersection of AI and blockchain",
      logo: "🤖",
      link: "https://t.me/curatedotfun",
      soon: true,
      hide: true,
    },
    {
      name: "AI News",
      hashtag: "#ai",
      description: "Latest updates in AI",
      logo: "📰",
      link: "https://near.ai",
      soon: true,
      hide: true,
    },
    {
      name: "Crypto News",
      hashtag: "#crypto",
      description: "Latest updates in cryptocurrency",
      logo: "💰",
      link: "https://t.me/curatedotfun",
      soon: true,
      hide: true,
    },
    {
      name: "Public Goods FM",
      hashtag: "#publicgoods",
      description: "Public goods focused podcast and newsletter",
      logo: "🎙️",
      link: "https:/publicgoods.fm",
      soon: true,
      hide: false,
    },
    {
      name: "Morph L2",
      hashtag: "#morph",
      description: "Updates on Morph L2",
      logo: "🔄",
      link: "https://x.com/morph-news",
      soon: true,
      hide: true,
    },
  ];

  const features = [
    {
      emoji: "📰",
      title: "Smart Feed Creation",
      description:
        "Build intelligent content feeds that automatically collect and filter posts using advanced AI (powered by ChatGPT, Claude, and Llama).",
      soon: false,
    },
    {
      emoji: "👍",
      title: "Streamlined Approval Workflow",
      description:
        "Designated approvers review submissions through an intuitive interface, ensuring quality while maintaining efficiency.",
      soon: false,
    },
    {
      emoji: "🔄",
      title: "AI-Powered Content Summaries",
      description:
        "Our AI creates engaging recaps and transforms content into multiple formats - from newsletters to podcasts.",
      soon: false,
    },
    {
      emoji: "🎙️",
      title: "Multi-Format Publishing",
      description:
        "One-click conversion into professional blog posts, curated newsletters, AI-voiced podcasts, and real-time news feeds.",
      soon: true,
    },
    {
      emoji: "🚀",
      title: "Incentivized Curation",
      description:
        "Coming Soon: Earn tokens for quality content curation, creating a sustainable ecosystem for content creators and curators.",
      soon: true,
    },
  ];

  const [activeHashtag, setActiveHashtag] = useState("");

  return (
    <main className="flex flex-col min-h-screen bg-white w-[100vw]">
      <Head>
        <title>curate.fun - crowdsource automated content</title>
        <meta
          name="description"
          content="Save hours of content curation time with AI-powered tools that transform social media content into professional feeds, newsletters, and podcasts. Trusted by leading Web3 curators."
        />
        <meta
          name="keywords"
          content="content curation, social media automation, AI content management, digital publishing, content transformation"
        />
        <meta
          property="og:title"
          content="CURATE.FUN - Curate News on Socials"
        />
        <meta
          property="og:description"
          content="Curate news directly on socials and turn feeds into regular content."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://curate.fun" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="CURATE.FUN - Curate News on Socials"
        />
        <meta
          name="twitter:description"
          content="Curate news directly on socials and turn feeds into regular content."
        />
        <meta
          property="og:image"
          content="https://curate.fun/curatedotfunbannernew.png"
        />
        <meta
          property="twitter:image"
          content="https://curate.fun/curatedotfunbannernew.png"
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>

      <header className="w-full bg-white">
        <div className="flex justify-between items-center w-full p-4 border-b border-black">
          <div className="flex items-center">
            <Image
              src="/curatedotfuntransparenticon.png"
              alt="curate.fun Logo"
              width={32}
              height={32}
              className="h-8 w-8 mr-2"
              priority
            />
            <h1 className="text-2xl font-bold">curate.fun</h1>
          </div>
          <Link
            href="https://app.curate.fun/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Dashboard
          </Link>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center md:items-start">
          <div className="w-full md:w-1/2 md:pr-8 mb-8 md:mb-0">
            <h2 className="text-4xl md:text-6xl text-center md:text-left font-bold mb-6">
              Turn <span className="text-[#FF2E2E]">Crowdsourced News </span>
              into automated recurring AI Content
            </h2>
            <p className="text-lg md:text-xl mb-8  text-center md:text-left ">
              Discover the best crypto insights from top sources, curated by
              experts and the community, transformed into engaging content.
              Leverage real-time social data to fuel your content strategy
              effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="https://app.curate.fun/"
                target="_blank"
                className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 text-center"
              >
                Start Curating
              </Link>
              <Link
                href="https://docs.curate.fun/"
                target="_blank"
                className="flex items-center justify-center text-black hover:text-gray-600"
              >
                Learn More <span className="ml-2">→</span>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-1/2 relative">
            <div className="relative">
              <Image
                src={"/assets/images/hero-cards.png"}
                alt="Curate posts"
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <p className="text-center text-sm md:text-lg text-gray-500 mb-4">
            COVERING THESE COMMUNITIES:
          </p>
          <div className="w-full pb-6 overflow-x-scroll">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden">
                <div className="flex justify-start items-center px-4 gap-20 animate-marquee hover:pause-marquee whitespace-nowrap">
                  {[...PARTNERS, ...PARTNERS].map((partner, i) => (
                    <a
                      key={i}
                      href={partner.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-[40px]"
                    >
                      <Image
                        src={partner.img}
                        width={40}
                        height={40}
                        alt={partner.alt}
                        className="w-[40px] h-[40px] object-contain rounded-full"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-black"></div>
      </header>

      <section className="w-full bg-white6">
        <div className="w-full max-w-7xl mx-auto py-8 md:py-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
            Popular Feeds
          </h2>

          <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
            {hashtagData.feeds.map((feed) => (
              <HashtagButton
                key={feed.id}
                tag={feed.id.replace("#", "")}
                isActive={activeHashtag === feed.id.replace("#", "")}
                onClick={() =>
                  setActiveHashtag(
                    activeHashtag === feed.id.replace("#", "")
                      ? ""
                      : feed.id.replace("#", ""),
                  )
                }
              />
            ))}
          </div>
        </div>

        <div className="w-full border-t border-black"></div>
      </section>

      <section className="w-full bg-white">
        <div className="w-full mx-auto pt-6 md:pt-8">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="flex flex-col md:items-start items-center mb-6 md:mb-8">
              <span className="inline-block px-4 py-2 rounded-full border border-black text-sm">
                HOW IT WORKS
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-center md:text-left">
              Three Steps to Content Curation on Autopilot.
            </h2>
          </div>
          <div className="w-full border-t border-black"></div>
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-x border-black">
                <div className="flex flex-col items-center mb-6">
                  <Image
                    src="/assets/images/technology_ccode_opensource.png"
                    width={300}
                    height={300}
                    alt="Submit Content"
                    className="w-24 md:w-[188px]"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center md:text-left">
                  Submit Content Anywhere, Anytime
                </h3>
                <p className="font-['PT_Root_UI'] text-[16px] md:text-[18px] leading-[26px] md:leading-[30px] text-[#57606A] text-center md:text-left">
                  Submit contents anywhere by replying to posts with{" "}
                  <span className="font-mono">!submit @curatedotfun</span>
                  <br />
                  <span className="font-mono text-neutral-500 rounded-sm bg-neutral-100 p-2">
                    #hashtag
                  </span>
                </p>
              </div>

              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black">
                <div className="flex flex-col items-center mb-6">
                  <img
                    src="/assets/images/arrow_recycling_cycle_flow_action.png"
                    alt="Approval Workflow"
                    className="w-24 md:w-[188px]"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center md:text-left">
                  Streamlined Approval Workflow
                </h3>
                <p className="font-['PT_Root_UI'] text-[16px] md:text-[18px] leading-[26px] md:leading-[30px] text-[#57606A] text-center md:text-left">
                  Designated approvers review and approve submissions directly
                  on platform by replying with{" "}
                  <span className="font-mono text-neutral-500 rounded-sm bg-neutral-100 p-2">
                    !approve
                  </span>{" "}
                  or
                  <span className="font-mono text-neutral-500 rounded-sm bg-neutral-100 p-2">
                    !reject
                  </span>
                </p>
              </div>

              <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black">
                <div className="flex flex-col items-center mb-6">
                  <img
                    src="/assets/images/gear_wheels_machine.png"
                    alt="Share Everywhere"
                    className="w-24 md:w-[188px]"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Automatically Rewrite & Share Everywhere
                </h3>
                <p className="font-['PT_Root_UI'] text-[16px] md:text-[18px] leading-[26px] md:leading-[30px] text-[#57606A] text-center">
                  Turn submissions into polished posts and share them across
                  platforms like Twitter, Farcaster, Telegram, Blog etc.
                </p>
              </div>
            </div>
            <div className="hidden md:block absolute left-0 w-screen border-t border-black mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4">
              <div className="p-6 md:p-8 border-r border-b md:border-b-0 border-black">
                <h4 className="text-3xl md:text-4xl font-bold mb-2 text-center md:text-left">
                  500
                </h4>
                <p className="text-gray-500 uppercase text-xs md:text-sm text-center md:text-left">
                  POSTS CURATED
                </p>
              </div>
              <div className="p-6 md:p-8 border-b md:border-r md:border-b-0 border-black">
                <h4 className="text-3xl md:text-4xl font-bold mb-2 text-center md:text-left">
                  3
                </h4>
                <p className="text-gray-500 uppercase text-xs md:text-sm text-center md:text-left">
                  MEDIA PARTNERS
                </p>
              </div>
              <div className="p-6 md:p-8 border-r border-black">
                <h4 className="text-3xl md:text-4xl font-bold mb-2 text-center md:text-left">
                  +30
                </h4>
                <p className="text-gray-500 uppercase text-xs md:text-sm text-center md:text-left">
                  CURATORS
                </p>
              </div>
              <div className="p-6 md:p-8">
                <h4 className="text-3xl md:text-4xl font-bold mb-2 text-center md:text-left">
                  21
                </h4>
                <p className="text-gray-500 uppercase text-xs md:text-sm text-center md:text-left">
                  FEEDS
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-black"></div>
      </section>

      <section className="w-full bg-white">
        <div className="w-full mx-auto py-6 md:py-8">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex flex-col md:items-start items-center mb-6 md:mb-8">
              <span className="inline-block px-4 py-2 rounded-full border border-black text-sm">
                KEY FEATURES
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-center md:text-left max-w-[720px]">
              A fully integrated suite to transform your content workflow
            </h2>
          </div>
          <div className="w-full border-t border-neutral-500"></div>
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-4 md:p-8 border-b md:border-b border-neutral-500 md:border-r">
                <div className="flex items-center gap-2 mb-4 md:mb-6 justify-center md:justify-start">
                  <Newspaper className="w-5 h-5 md:w-6 md:h-6" />
                  <h3 className="text-xl md:text-2xl font-bold">
                    Curation Network
                  </h3>
                </div>
                <div className="p-3 md:p-4 mb-4">
                  <Image
                    src={"/assets/images/curation-network.svg"}
                    alt="Curate posts"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="font-['PT_Root_UI'] text-[16px] md:text-[18px] leading-[26px] md:leading-[30px] text-[#57606A] text-center md:text-left">
                  Empower your network to submit and filter content via Twitter
                  replies, Telegram chats etc. Use AI tools like ChatGPT to
                  refine suggestions, but let your community drive what's
                  trending.
                </p>
              </div>

              <div className="p-4 md:p-8 border-b md:border-b border-neutral-500">
                <div className="flex items-center gap-2 mb-4 md:mb-6 justify-center md:justify-start">
                  <Workflow className="w-5 h-5 md:w-6 md:h-6" />
                  <h3 className="text-xl md:text-2xl font-bold">
                    Streamlined Approval Workflow
                  </h3>
                </div>
                <div className="p-3 md:p-4 mb-4">
                  <Image
                    src={"/assets/images/streamlined-approval-workflow.svg"}
                    alt="Curate posts"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="font-['PT_Root_UI'] text-[16px] md:text-[18px] leading-[26px] md:leading-[30px] text-[#57606A] text-center md:text-left">
                  Designated approvers can review and approve submissions
                  directly on social media by replying !approve to a tweet or
                  through the dashboard, ensuring high standards without slowing
                  down your process.
                </p>
              </div>

              <div className="p-4 md:p-8 border-b md:border-r md:border-b-0 border-neutral-500">
                <div className="flex items-center gap-2 mb-4 md:mb-6 justify-center md:justify-start">
                  <Bot className="w-5 h-5 md:w-6 md:h-6" />
                  <h3 className="text-xl md:text-2xl font-bold">
                    AI-Powered Content Summaries
                  </h3>
                </div>
                <div className="p-3 md:p-4 mb-4">
                  <Image
                    src={"/assets/images/ai-powered-content-summaries.svg"}
                    alt="Curate posts"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="font-['PT_Root_UI'] text-[16px] md:text-[18px] leading-[26px] md:leading-[30px] text-[#57606A] text-center md:text-left">
                  Turn crowdsourced content into bite-sized, engaging recaps
                  with AI-powered summaries. Effortlessly transform articles,
                  threads, or videos into multiple formats like newsletters,
                  tweets, or podcast scripts.
                </p>
              </div>

              <div className="p-4 md:p-8 border-b md:border-b-0 border-neutral-500">
                <div className="flex items-center gap-2 mb-4 md:mb-6 justify-center md:justify-start">
                  <Gift className="w-5 h-5 md:w-6 md:h-6" />
                  <h3 className="text-xl md:text-2xl font-bold flex items-center">
                    Incentivized Curation
                    <span className="ml-2 text-xs md:text-sm bg-black text-white px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </h3>
                </div>
                <div className="p-3 md:p-4 mb-4">
                  <Image
                    src={"/assets/images/incentivized-curation.svg"}
                    alt="Curate posts"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="font-['PT_Root_UI'] text-[16px] md:text-[18px] leading-[26px] md:leading-[30px] text-[#57606A] text-center md:text-left">
                  Earn for curating quality content, creating a sustainable
                  ecosystem where creators and curators are rewarded for their
                  contributions. This feature is coming soon — stay tuned!
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-neutral-500 absolute mt-[-32px] hidden md:block"></div>
      </section>

      <section className="w-full bg-white">
        <div className="w-full mx-auto py-6 md:py-8">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 text-center md:text-left">
                Supported Platforms
              </h2>
              <p className="text-xl md:text-2xl mb-8 md:mb-12 text-center md:text-left">
                Your Content, Automated from Start to Finish
              </p>
            </div>
          </div>
          <div className="w-full border-t border-black"></div>
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
              <div className="md:border-x border-[#E5E5E5]">
                <div className="flex flex-col items-center md:items-start">
                  <Image
                    src="/assets/images/curate-engine.png"
                    alt="Curate Engine Flow"
                    width={400}
                    height={200}
                    className="w-full mb-6 md:mb-8"
                    unoptimized
                  />
                  <div className="p-4 md:p-8">
                    <h3 className="text-2xl font-bold mb-4 text-center md:text-left">
                      Curate Engine
                    </h3>
                    <p className="font-['PT_Root_UI'] text-[#57606A] text-[18px] leading-[30px] font-normal text-center md:text-left">
                      Pull posts, threads, and videos from Twitter, Telegram,
                      and more. Organize everything into smart feeds that update
                      automatically, so you're always sharing fresh, relevant
                      content.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-r border-[#E5E5E5]">
                <Image
                  src="/assets/images/curate-engine2.png"
                  alt="Cron Jobs Flow"
                  width={400}
                  height={200}
                  className="w-full mb-6 md:mb-8"
                  unoptimized
                />
                <div className="p-4 md:p-8">
                  <h3 className="text-2xl font-bold mb-4 text-center md:text-left">
                    Content Engine
                  </h3>
                  <p className="font-['PT_Root_UI'] text-[#57606A] text-[18px] leading-[30px] font-normal text-center md:text-left">
                    Pull posts, threads, and videos from Twitter, Telegram, and
                    more. Organize everything into smart feeds that update
                    automatically, so you're always sharing fresh, relevant
                    content.
                  </p>
                </div>
              </div>

              <div className="border-r border-[#E5E5E5]">
                <Image
                  src="/assets/images/crosspost-engine.png"
                  alt="Crosspost Engine Flow"
                  width={400}
                  height={200}
                  className="w-full mb-6 md:mb-8"
                  unoptimized
                />
                <div className="p-4 md:p-8">
                  <h3 className="text-2xl font-bold mb-4 text-center md:text-left">
                    Crosspost Engine
                  </h3>
                  <p className="font-['PT_Root_UI'] text-[#57606A] text-[18px] leading-[30px] font-normal text-center md:text-left">
                    Schedule or auto-publish approved content across Twitter,
                    Discord, LinkedIn, Telegram, and other platforms. No more
                    copy-pasting or manual formatting — just consistent,
                    cross-platform engagement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-black"></div>
      </section>

      <section className="w-full bg-white">
        <div className="w-full mx-auto py-6 md:py-8">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex flex-col md:items-start items-center mb-6 md:mb-8">
              <span className="inline-block px-4 py-2 rounded-full border border-black text-sm">
                SOCIAL PROOF
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-center md:text-left">
              What curators are saying
              <br className="hidden sm:block" />
              about curate.fun
            </h2>
          </div>
          <div className="w-full border-t border-[#57606A]"></div>
          <div className="max-w-[1200px] mx-auto">
            <TweetWall />
          </div>
        </div>
        <div className="w-full border-t border-black hidden md:block"></div>
      </section>
      <section className="w-full bg-black text-white py-12 md:py-24">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            Contribute to the Protocol
          </h2>

          <p className="text-[#A1A1AA] text-lg md:text-xl max-w-[900px] mx-auto mb-8 md:mb-12 px-4">
            Join our community of developers and help shape the future of
            content curation. Our protocol is open-source, allowing anyone to
            contribute, improve, and build upon our technology.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <Link
              href={"https://t.me/+UM70lvMnofk3YTVh"}
              target="_blank"
              className="w-full md:w-auto bg-white text-black px-6 py-3 rounded-lg font-medium"
            >
              Start Contributing
            </Link>
            <Link
              href="https://docs.curate.fun/"
              target="_blank"
              className="flex items-center justify-center gap-2 text-white hover:text-gray-300 py-3"
            >
              Learn More
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="w-full bg-white">
        <div className="w-full mx-auto pt-6 md:pt-8">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex flex-col md:items-start items-center mb-6 md:mb-8">
              <span className="inline-block px-4 py-2 rounded-full border border-black text-sm">
                CASE STUDIES
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-12 text-center md:text-left">
              Discover How Leading Communities and Creators
              <br className="hidden md:block" />
              Streamline Their Workflows.
            </h2>
          </div>
          <div className="w-full border-t border-black"></div>
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0 justify-center">
              <div className="pt-10 pb-8 md:p-8 md:border-x relative max-w-[300px] border-b border-neutral-500 mx-auto">
                <div className="absolute right-0 bottom-0 opacity-20 backdrop-blur-md bg-white/50 rounded-full p-4">
                  <FaGlobeAmericas
                    className="w-48 h-48 text-white"
                    style={{
                      filter:
                        "drop-shadow(0 1.87px 4.68px rgba(193, 146, 76, 0.8))",
                    }}
                  />
                </div>
                <Link
                  href="https://AmericanCrypto.Foundation"
                  target="_blank"
                  className="flex flex-col items-center md:items-start relative z-10"
                >
                  <div className="flex items-start gap-2 mb-4">
                    <Image
                      src="/assets/images/communities/acf.jpg"
                      alt="American Crypto Foundation"
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized
                    />
                    <h3 className="text-2xl font-bold">
                      American Crypto Foundation
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-center md:text-left">
                    All new America x crypto
                  </p>
                  <span className="inline-block px-3 py-1 bg-gray-800 text-white rounded-md text-sm">
                    #usa
                  </span>
                </Link>
              </div>
              <div className="p-4 pb-8 md:p-8 md:border-x relative max-w-[300px] border-b border-neutral-500 mx-auto">
                <div className="absolute right-0 bottom-0 opacity-20 backdrop-blur-md bg-white/50 rounded-full p-4">
                  <SatelliteDish
                    className="w-48 h-48 text-white"
                    style={{
                      filter:
                        "drop-shadow(0 1.87px 4.68px rgba(193, 146, 76, 0.8))",
                    }}
                  />
                </div>
                <Link
                  href="https://t.me/cryptograntwire"
                  target="_blank"
                  className="flex flex-col items-center md:items-start relative z-10"
                >
                  <div className="flex items-start gap-2 mb-4">
                    <Image
                      src="/assets/images/communities/cryptograntwire.svg"
                      alt="Crypto Grant Wire"
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized
                    />
                    <h3 className="text-2xl font-bold">Crypto Grant Wire</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-center md:text-left">
                    Feed for Web3 grant + DAO Governance
                  </p>
                  <span className="inline-block px-3 py-1 bg-gray-800 text-white rounded-md text-sm">
                    #grants
                  </span>
                </Link>
              </div>
              <div className="p-4 pb-8 md:p-8 md:border-x relative max-w-[300px] border-b border-neutral-500 mx-auto">
                <div className="absolute right-0 bottom-0 opacity-20 backdrop-blur-md bg-white/50 rounded-full p-4">
                  <SatelliteDish
                    className="w-48 h-48 text-white"
                    style={{
                      filter:
                        "drop-shadow(0 1.87px 4.68px rgba(193, 146, 76, 0.8))",
                    }}
                  />
                </div>
                <Link
                  href="https://fundraising.news"
                  target="_blank"
                  className="flex flex-col items-center md:items-start relative z-10"
                >
                  <div className="flex items-start gap-2 mb-4">
                    <Image
                      src="https://cdn1.cdn-telegram.org/file/Y0NDaS421SdueeYpg8Ae7aSVkh027ugUcj3iMpyuEtWoCoMa3QyQ_QWmMuq4DXd7qt4sLn4J0wlNQZmBZePFhzmfpvoKms3UZwONx4fSWnORLxtBmDbDdUofQwBaDNx4G6QK9687OzdP_5wK8S7DU2cnjY4zQSoCnDEtv-hyGf1qRQLYrdYhvq8DLWTUKg3LT_thSw-iddrtX8G5SBFo4BkyVezj2OMY42VFlu-efKASJAZ_D-oerem1U9q5G6buzGcAqSCL8DfpBXqEG30HEbk1rYcyn3L81Hn30qABujOjpAPUfrdg-F19OsiT6K8AeykaZgwJfkkLODAfzh-gDQ.jpg"
                      alt="Crypto Fundraising"
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized
                    />
                    <h3 className="text-2xl font-bold">Crypto Fundraises</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-center md:text-left">
                    An open database & api for crypto fundraising announcments
                  </p>
                  <span className="inline-block px-3 py-1 bg-gray-800 text-white rounded-md text-sm">
                    #cryptofundraise
                  </span>
                </Link>
              </div>

              <div className="p-4 pb-8 md:p-8 md:border-r relative max-w-[300px] border-b border-neutral-500 mx-auto">
                <div className="absolute right-0 bottom-0 opacity-20 backdrop-blur-md bg-white/50 rounded-full p-4">
                  <CalendarRange
                    className="w-48 h-48 text-white"
                    style={{
                      filter:
                        "drop-shadow(0 1.87px 4.68px rgba(193, 146, 76, 0.8))",
                    }}
                  />
                </div>
                <Link
                  href="https://nearweek.com"
                  target="_blank"
                  className="flex flex-col items-center md:items-start relative z-10"
                >
                  <div className="flex items-start gap-2 mb-4">
                    <Image
                      src="/assets/images/communities/nearweek.svg"
                      alt="NEARWEEK"
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized
                    />
                    <h3 className="text-2xl font-bold">NEARWEEK</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-center md:text-left">
                    NEAR Protocol Community digest
                  </p>
                  <span className="inline-block px-3 py-1 bg-gray-800 text-white rounded-md text-sm">
                    #near
                  </span>
                </Link>
              </div>

              <div className="p-4 pb-8 md:p-8 md:border-r relative max-w-[300px] overflow-hidden mx-auto">
                <div className="absolute right-0 bottom-0 opacity-20 backdrop-blur-md bg-white/50 rounded-full p-4">
                  <Podcast
                    className="w-48 h-48 text-white"
                    style={{
                      filter:
                        "drop-shadow(0 1.87px 4.68px rgba(193, 146, 76, 0.8))",
                      transform: "rotate(-45deg)",
                    }}
                  />
                </div>
                <Link
                  href="https://publicgoods.fm"
                  target="_blank"
                  className="flex flex-col items-center md:items-start relative z-10"
                >
                  <div className="flex items-start gap-2 mb-4">
                    <Image
                      src="/assets/images/communities/publicgoodsfm.svg"
                      alt="Public Goods FM"
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized
                    />
                    <h3 className="text-2xl font-bold">Public Goods FM</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-center md:text-left">
                    Public goods focused podcast and newsletter
                  </p>
                  <span className="inline-block px-3 py-1 bg-gray-800 text-white rounded-md text-sm">
                    #publicgoods
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-black"></div>
      </section>

      <FAQs />

      <footer className="w-full py-8 bg-[#F9F9F9] border-t border-black flex flex-col sm:flex-row justify-between items-center px-6 gap-6">
        <div className="flex items-center">
          <Image
            src="/curatedotfuntransparenticon.png"
            alt="curate.fun Logo"
            width={32}
            height={32}
            className="h-8 w-8 mr-2"
            priority
          />
          <h1 className="text-2xl font-bold">curate.fun</h1>
        </div>
        <div className="text-sm sm:text-base text-right mt-2 sm:mt-0">
          <Link
            href="https://potlock.org"
            className="hover:text-gray-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Curated with ❤️ by 🫕 POTLOCK
          </Link>
        </div>
        <div className="flex space-x-6">
          <Link
            href="https://twitter.com/curatedotfun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl hover:text-blue-500"
          >
            <FaTwitter />
          </Link>
          <Link
            href="https://docs.curate.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl hover:text-blue-500"
          >
            <FaBook />
          </Link>
          <Link
            href="https://github.com/potlock/curatedotfun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl hover:text-blue-500"
          >
            <FaGithub />
          </Link>
          <Link
            href="https://t.me/+UM70lvMnofk3YTVh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl hover:text-blue-500"
          >
            <FaTelegram />
          </Link>
        </div>
      </footer>
    </main>
  );
}
