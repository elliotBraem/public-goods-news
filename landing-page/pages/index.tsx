import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import { FaTwitter, FaBook, FaGithub, FaTelegram } from "react-icons/fa";

const SlotEmoji = ({
  finalEmoji,
  duration,
  interval,
  emojiSet,
}: {
  finalEmoji: string;
  duration: number;
  interval: number;
  emojiSet: string[];
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    const startSpinning = () => {
      setIsSpinning(true);
      const intervalId = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % emojiSet.length);
      }, interval);

      setTimeout(() => {
        clearInterval(intervalId);
        setIsSpinning(false);
        setCurrentIndex(emojiSet.indexOf(finalEmoji));
      }, duration);

      return intervalId;
    };

    let intervalId = startSpinning();

    const restartInterval = setInterval(() => {
      clearInterval(intervalId);
      intervalId = startSpinning();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearInterval(restartInterval);
    };
  }, [emojiSet, finalEmoji, interval, duration]);

  return <span className="inline-block">{emojiSet[currentIndex]}</span>;
};

export default function Home() {
  const moneyEmojis = ["💸", "💰", "💵", "🏦", "💎"];
  const robotEmojis = ["🤖", "🦾", "🔧", "🧠", "⚡"];
  const partyEmojis = ["🎉", "🎊", "✨", "🎯", "🚀"];

  const soon = true;

  // Define the case studies JSON object
  const caseStudies = [
    {
      name: "Crypto Grant Wire",
      hashtag: "#grant",
      description: "feed for Web3 grant +  DAO Governance",
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

  return (
    <div className="min-h-screen bg-white font-lodrina">
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

      <header className="sticky top-0 flex justify-between items-center p-4 border-b-4 border-black bg-white z-10">
        <div className="flex items-center">
          <img
            src="/curatedotfuntransparenticon.png"
            alt="curate.fun Logo"
            className="h-8 w-8 mr-2"
          />
          <div>
            <h1 className="text-2xl h-8 flex items-center">curate.fun</h1>
          </div>
        </div>
        <nav className="flex space-x-4 mx-4">
          <div>
            {/* {["How to Submit", "See Feeds", "See Content"].map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <span className={`text-lg ${soon ? "text-gray-500" : "text-black"}`}>
                {item}
              </span>
              {soon && (
                <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1">
                  Soon
                </span>
              )}
            </div>
          ))} */}
          </div>

          <Link
            href="https://app.curate.fun/"
            target="_blank"
            rel="noopener noreferrer"
            id="cta-button"
            className="text-xl bg-black text-white px-4 py-2 rounded hover:bg-gray-800 font-lodrina"
          >
            DASHBOARD
          </Link>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center min-h-screen p-4 px-2 sm:px-4 w-full">
        <div className="w-full max-w-none mx-auto">
          <div className="flex justify-center items-center mb-8 sm:mb-12 border-b-4 border-black w-full">
            <div className="flex-1 p-4 flex justify-center items-center w-full">
              <div
                id="slot"
                className="text-4xl sm:text-6xl md:text-8xl space-x-2 sm:space-x-4 md:space-x-8 w-full"
              >
                <SlotEmoji
                  finalEmoji="🔖"
                  duration={2000}
                  interval={150}
                  emojiSet={["🔖", "📑", "📚", "📌", "📎"]}
                />
                <SlotEmoji
                  finalEmoji="📸"
                  duration={2500}
                  interval={150}
                  emojiSet={["📷", "🎥", "🎙️", "📹", "📸"]}
                />
                <SlotEmoji
                  finalEmoji="🤖"
                  duration={2500}
                  interval={150}
                  emojiSet={["🤖", "🦾", "🔧"]}
                />
              </div>
            </div>

            <div className="flex-1 p-4 flex justify-center items-center w-full border-l-4 border-black border-r-0 border-t-0 border-b-0">
              <TypeAnimation
                sequence={[
                  "[curate]",
                  1000,
                  "[curate] news...",
                  800,
                  "[curate] on socials",
                  1000,
                  "[output] tweets..",
                  800,
                  "[output] podcasts",
                  800,
                  "[output] blogs.",
                  1000,
                ]}
                wrapper="div"
                cursor={true}
                repeat={Infinity}
                className="text-lg sm:text-xl md:text-2xl font-mono px-2 w-full"
              />
            </div>
          </div>

          <section className="mb-8 sm:mb-12 w-full">
            <h2 className="text-2xl sm:text-3xl mb-4 border-b-4 border-black p-4 w-full">
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="card p-4 border-4 border-black shadow-md hover:shadow-lg transform hover:translate-y-[-2px] transition duration-300 w-full relative"
                >
                  {feature.soon && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-500">
                        Soon
                      </span>
                    </div>
                  )}
                  <h5 className="text-2xl">
                    {feature.emoji + " " + feature.title}
                  </h5>
                  <p className="mt-2">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="mb-8 sm:mb-12 w-full">
            <h1 className="text-2xl sm:text-3xl mb-4 border-b-4 border-black p-4 w-full">
              Supported Platforms
            </h1>
            <p className="mb-4">
              Seamlessly integrate with your favorite platforms:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3  gap-4 w-full">
              <div className="card p-4 border-t-4 border-black shadow-md flex items-center w-full">
                <span className="text-3xl mr-2">🐦</span>
                <p>Twitter</p>
              </div>
              <div className="card p-4 border-t-4 border-black shadow-md flex items-center w-full">
                <span className="text-3xl mr-2">✉️</span>
                <p>Telegram</p>
              </div>

              <div className="card p-4 border-t-4 border-black shadow-md flex items-center w-full relative">
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">Soon</span>
                </div>
                <span className="text-3xl mr-2">📡</span>
                <p>RSS Feeds</p>
              </div>
              <div className="card p-4 border-t-4 border-black shadow-md flex items-center w-full relative">
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">Soon</span>
                </div>
                <span className="text-3xl mr-2">🌐</span>
                <p>Farcaster</p>
              </div>
              <div className="card p-4 border-t-4 border-black shadow-md flex items-center w-full relative">
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">Soon</span>
                </div>
                <span className="text-3xl mr-2">🎙️</span>
                <p>Podcasting</p>
              </div>
              <div className="card p-4 border-t-4 border-black shadow-md flex items-center w-full relative">
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">Soon</span>
                </div>
                <span className="text-3xl mr-2">🛰️</span>
                <p>NEAR Social</p>
              </div>
            </div>
            <p className="mt-4 italic">
              Powered by{" "}
              <a
                className="text-blue-500 hover:text-gray-800"
                href="https://crosspost.everything.dev/"
                target="_blank"
                rel="noopener noreferrer"
              >
                opencrosspost.com
              </a>
            </p>
          </section>

          <section className="mb-8 sm:mb-12 w-full">
            <h1 className="text-2xl sm:text-3xl mb-4 border-b-4 border-black p-4 w-full">
              Case Studies
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {caseStudies
                .filter((study) => !study.hide)
                .map((study, index) => (
                  <Link
                    key={index}
                    href={study.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card p-4 border-4 border-black shadow-md hover:bg-gray-100 flex flex-col relative"
                  >
                    {study.soon && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-500">
                          Soon
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-3xl mr-2">
                          {study.logo || "🎙️"}
                        </span>
                        <p className="font-bold">{study.name}</p>
                      </div>
                      <span className="text-xs bg-gray-200 p-1">
                        {study.hashtag}
                      </span>
                    </div>
                    <hr className="my-2 border-t-4 border-black" />
                    <p className="mt-2 text-sm italic">{study.description}</p>
                  </Link>
                ))}
            </div>
          </section>

          <section className="mb-8 sm:mb-12 w-full text-center">
            <h1 className="text-2xl sm:text-3xl mb-4 border-b-4 border-black p-4 w-full">
              Community Section
            </h1>
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-4 w-full">
              <Link
                href="https://t.me/+UM70lvMnofk3YTVh"
                target="_blank"
                rel="noopener noreferrer"
                className="card p-4 border-4 border-black shadow-md hover:bg-gray-100 flex flex-col items-center justify-center"
              >
                <span className="text-3xl">👥</span>
                <p>Curate</p>
              </Link>
              <Link
                href="https://t.me/+UM70lvMnofk3YTVh"
                target="_blank"
                rel="noopener noreferrer"
                className="card p-4 border-4 border-black shadow-md hover:bg-gray-100 flex flex-col items-center justify-center"
              >
                <span className="text-3xl">🚀</span>
                <p>Launch Feed</p>
              </Link>
              <Link
                href="https://t.me/+UM70lvMnofk3YTVh"
                target="_blank"
                rel="noopener noreferrer"
                className="card p-4 border-4 border-black shadow-md hover:bg-gray-100 flex flex-col items-center justify-center"
              >
                <span className="text-3xl">🤝</span>
                <p>Partner W Us</p>
              </Link>
            </div>
          </section>

          {/* <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl mb-4 border-b-4 border-black p-4">Pricing</h2>
            <table className="w-full border-collapse border-4 border-black">
              <thead>
                <tr>
                  <th className="border-4 border-black p-2">Tier</th>
                  <th className="border-4 border-black p-2">Price (Monthly)</th>
                  <th className="border-4 border-black p-2">Features</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-4 border-black p-2">Basic</td>
                  <td className="border-4 border-black p-2">$49</td>
                  <td className="border-4 border-black p-2">
                    - 1 feed<br />
                    - 1 platform for crossposting<br />
                    - 3 curators/approvers<br />
                    - Weekly automated posts<br />
                    - 50 content pieces processed/month<br />
                    - Basic AI summarization
                  </td>
                </tr>
                <tr>
                  <td className="border-4 border-black p-2">Pro</td>
                  <td className="border-4 border-black p-2">$199</td>
                  <td className="border-4 border-black p-2">
                    - 1 feed<br />
                    - 2 platforms for crossposting<br />
                    - 5 curators/approvers<br />
                    - Daily automated posts<br />
                    - 200 content pieces processed/month<br />
                    - Advanced AI summarization and format conversion
                  </td>
                </tr>
                <tr>
                  <td className="border-4 border-black p-2">Enterprise</td>
                  <td className="border-4 border-black p-2">$599</td>
                  <td className="border-4 border-black p-2">
                    - Up to 3 feeds<br />
                    - All supported platforms for crossposting<br />
                    - 10 curators/approvers<br />
                    - Daily automated posts with custom scheduling<br />
                    - 500 content pieces processed/month<br />
                    - Full AI suite with custom model fine-tuning
                  </td>
                </tr>
              </tbody>
            </table>
          </section> */}

          {/* <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl mb-4 border-b-4 border-black p-4">Add-ons</h2>
            <table className="w-full border-collapse border-4 border-black">
              <thead>
                <tr>
                  <th className="border-4 border-black p-2">Add-on</th>
                  <th className="border-4 border-black p-2">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-4 border-black p-2">Extra platform integration</td>
                  <td className="border-4 border-black p-2">$30/month per platform</td>
                </tr>
                <tr>
                  <td className="border-4 border-black p-2">Custom AI model training</td>
                  <td className="border-4 border-black p-2">Starting at $300</td>
                </tr>
              </tbody>
            </table>
          </section> */}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full py-2 sm:py-4 bg-white/80 backdrop-blur border-t-4 border-black flex flex-col sm:flex-row justify-between items-center px-4">
        <div className="flex space-x-4">
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
      </footer>
    </div>
  );
}
