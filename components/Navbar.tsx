import React from "react";
import Image from "next/image";

interface NavbarProps {
  transparent?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  return (
    <nav
      className={`fixed top-0 left-0 w-full z-30 ${
        transparent ? "bg-transparent" : "bg-white shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between py-5 px-6 lg:px-10">
        <a href="/" className="flex items-center gap-2 text-xl font-semibold">
          <Image
            src="/img/logo.png"
            alt="Delta Palette logo"
            width={32}
            height={32}
          />
          <span>Delta Palette</span>
        </a>
        <ul className="flex items-center space-x-6">
          <li>
            <a href="/" className="hover:text-blue-400 font-semibold">
              Home
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-blue-400 font-semibold">
              About
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
