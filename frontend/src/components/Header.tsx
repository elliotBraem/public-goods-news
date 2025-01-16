import { FaTwitter, FaBook, FaGithub, FaTelegram } from "react-icons/fa";
import { Link } from "@tanstack/react-router";

const Header = () => {
  return (
    <header className="sticky top-0 flex justify-between items-center p-4 border-b-2 border-black bg-white z-10">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img
          src="/curatedotfuntransparenticon.png"
          alt="curate.fun Logo"
          className="h-8 w-8 mr-2"
        />
        <div className="flex">
          <h1 className="text-2xl h-8">curate.fun</h1>
        </div>
      </Link>
      <nav className="flex space-x-4 mx-4">
        <a
          href="https://twitter.com/curatedotfun"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl hover:text-blue-500"
        >
          <FaTwitter />
        </a>
        <a
          href="https://docs.curate.press"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl hover:text-blue-500"
        >
          <FaBook />
        </a>
        <a
          href="https://github.com/potlock/curatedotfun"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl hover:text-blue-500"
        >
          <FaGithub />
        </a>
        <a
          href="https://t.me/+UM70lvMnofk3YTVh"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl hover:text-blue-500"
        >
          <FaTelegram />
        </a>
      </nav>
    </header>
  );
};

export default Header;
